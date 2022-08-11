import SuspenseContainer from '@components/SuspenseContainer/SuspenseContainer';
import { useMusicalContext } from '@frontend/context/musical-context';
import { SourceData } from '@models';
import { Box, Typography } from '@mui/material';
import { useEffect, useMemo, useState } from 'react';
import useSWRImmutable from 'swr/immutable';
import AudioControls from './AudioControls/AudioControls';

const jsonFetcher = (url: string) => fetch(url).then(res => res.json());

const audioFileFetcherAndConverter = (url: string, ctx: AudioContext) =>
  fetch(url)
    .then(data => data.arrayBuffer())
    .then(buffer => ctx.decodeAudioData(buffer));

const binaryDataUrlFetcher = (url: string) =>
  fetch(url).then(data => data.text());

type WaveformDataStrategy =
  | 'fetch audio from audioElement src, create waveforms on client'
  | 'fetch pre-computed binary audio buffer from server'
  | 'fetch audio from server, create waveforms on client';

type Props = {
  /**
   * specifies how waveform data for the player should be retrieved
   */
  waveformDataStrategy: WaveformDataStrategy;
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
  useEffect(() => {
    setAudioContext(new AudioContext());
  }, []);

  const videoId = useMemo(() => {
    const videoUrlSearch = new URL(track.url).search;
    const params = new URLSearchParams(videoUrlSearch);
    return params.get('v')!;
  }, [track]);

  // this logic is quite nasty lol

  const { data: audioElSrcData, error } = useSWRImmutable<SourceData, any>(
    '/api/yt-audio/audio-el-data/' + videoId,
    jsonFetcher
  );

  const { data: audioBuffer, error: bufferError } = useSWRImmutable<
    AudioBuffer,
    any
  >(
    waveformDataStrategy ===
      'fetch audio from server, create waveforms on client'
      ? ['/api/server-audio/mp3/' + videoId, audioContext]
      : null,
    audioFileFetcherAndConverter
  );

  const { data: waveformDataUri, error: waveformUriError } = useSWRImmutable<
    string,
    any
  >(
    waveformDataStrategy ===
      'fetch pre-computed binary audio buffer from server'
      ? '/api/server-audio/waveform-data/' + videoId
      : null,
    binaryDataUrlFetcher
  );

  const dataReady =
    !!audioElSrcData &&
    ((waveformDataStrategy ===
      'fetch audio from server, create waveforms on client' &&
      !!audioBuffer) ||
      (waveformDataStrategy ===
        'fetch pre-computed binary audio buffer from server' &&
        !!audioBuffer) ||
      waveformDataStrategy ===
        'fetch audio from audioElement src, create waveforms on client');

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
          audioBuffer={audioBuffer}
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
