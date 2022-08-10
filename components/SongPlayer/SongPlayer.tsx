import LoadingSpinnerContainer from '@components/LoadingSpinnerContainer/LoadingSpinnerContainer';
import { useMusicalContext } from '@frontend/context/musical-context';
import { SourceData } from '@models';
import { Box, CircularProgress, Typography } from '@mui/material';
import { useEffect, useMemo, useState } from 'react';
import useSWRImmutable from 'swr/immutable';
import AudioControls from './AudioControls';

const jsonFetcher = (url: string) => fetch(url).then(res => res.json());

const waveformDataFetcher = (url: string, ctx: AudioContext) =>
  fetch(url)
    .then(data => data.arrayBuffer())
    .then(buffer => ctx.decodeAudioData(buffer));

type Props = {
  fetchWaveformDataViaProxy: boolean;
};

const SongPlayer = ({ fetchWaveformDataViaProxy }: Props) => {
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
    '/api/yt-audio/' + videoId,
    // 'api/server-audio/0', // use while testing
    jsonFetcher
  );

  const { data: waveformData, error: waveformError } = useSWRImmutable<
    AudioBuffer,
    any
  >(
    fetchWaveformDataViaProxy && audioElSrcData
      ? [
          '/api/proxy?url=' + encodeURIComponent(audioElSrcData.src),
          audioContext,
        ]
      : null,
    waveformDataFetcher
  );

  const playerReady = fetchWaveformDataViaProxy
    ? !!audioElSrcData && !!waveformData
    : !!audioElSrcData;

  if (playerReady) {
    console.log(audioElSrcData, waveformData);
  }

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
      {!audioElSrcData ? (
        <Box
          sx={{
            height: '64px',
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {error ? (
            <Typography>
              Could not load audio 😢 Try again later or pick some other
              track/song
            </Typography>
          ) : (
            <CircularProgress />
          )}
        </Box>
      ) : playerReady ? (
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
        <LoadingSpinnerContainer height={309} message="Loading Player" />
      )}
    </Box>
  );
};
export default SongPlayer;
