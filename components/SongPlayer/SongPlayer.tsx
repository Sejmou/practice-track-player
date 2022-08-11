import SuspenseContainer from '@components/SuspenseContainer/SuspenseContainer';
import { useMusicalContext } from '@frontend/context/musical-context';
import { SourceData } from '@models';
import { Box, Typography } from '@mui/material';
import { useEffect, useMemo, useState } from 'react';
import useSWRImmutable from 'swr/immutable';
import AudioControls from './AudioControls/AudioControls';

const jsonFetcher = (url: string) => fetch(url).then(res => res.json());

const waveformDataFetcher = (url: string, ctx: AudioContext) =>
  fetch(url)
    .then(data => data.arrayBuffer())
    .then(buffer => ctx.decodeAudioData(buffer));

type Props = {
  /**
   * specifies how waveform data for the player should be retrieved
   */
  waveformDataStrategy:
    | 'compute on-the-fly (with audio context)'
    | 'fetch from own server'
    | 'fetch via proxy';
};

const SongPlayer = ({ waveformDataStrategy }: Props) => {
  const {
    currentSong: song,
    currentTrack: track,
    previousSongAvailable,
    nextSongAvailable,
    goToNextSong,
    goToPreviousSong,
  } = useMusicalContext();
  const [audioContext, setAudioContext] = useState<AudioContext>();

  const videoId = useMemo(() => {
    const videoUrlSearch = new URL(track.url).search;
    const params = new URLSearchParams(videoUrlSearch);
    return params.get('v')!;
  }, [track]);

  useEffect(() => {
    setAudioContext(new AudioContext());
  }, []);

  const { data: audioElSrcData, error } = useSWRImmutable<SourceData, any>(
    '/api/yt-audio/audio-el-data/' + videoId,
    // 'api/server-audio/0', // use while testing
    jsonFetcher
  );

  const { data: waveformData, error: waveformError } = useSWRImmutable<
    AudioBuffer,
    any
  >(
    waveformDataStrategy !== 'compute on-the-fly (with audio context)' &&
      audioElSrcData
      ? [
          waveformDataStrategy === 'fetch via proxy'
            ? '/api/proxy?url=' + encodeURIComponent(audioElSrcData.src)
            : '/api/yt-audio/waveform-data/' + videoId,
          audioContext,
        ]
      : null,
    waveformDataFetcher
  );

  const dataReady =
    audioElSrcData &&
    (waveformDataStrategy
      ? !!audioElSrcData && !!waveformData
      : !!audioElSrcData);

  return (
    <Box>
      <Box
        sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}
      >
        <Typography>Current Song:</Typography>
        <Typography variant="h5">
          {song.no}. {song.title}
        </Typography>
      </Box>
      {dataReady ? (
        <AudioControls
          audioContext={audioContext}
          audioElSrcData={audioElSrcData}
          audioBuffer={waveformData}
          onNextClicked={goToNextSong}
          onPreviousClicked={goToPreviousSong}
          nextAvailable={nextSongAvailable}
          previousAvailable={previousSongAvailable}
        />
      ) : (
        <SuspenseContainer
          height={309 + 64}
          status={!error ? 'loading' : 'error'}
          errorMessage="Could not load audio 😢 Try again later or pick some other
        track/song"
          loadingMessage="Loading Player"
        />
      )}
    </Box>
  );
};
export default SongPlayer;
