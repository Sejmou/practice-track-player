import { useMemo } from 'react';
import { Box, useMediaQuery, useTheme } from '@mui/material';

import { useMusicalContext } from '@frontend/musical/musical-context';
import SuspenseContainer from 'features/SuspenseContainer/SuspenseContainer';
import AudioPlayer from '@frontend/media-playback/media/AudioPlayer';
import {
  useServerWaveformDataFetcher,
  useGoogleDriveAudioSrcDataFetcher,
} from '@frontend/media-playback/use-audio-data-fetcher';
import { useKeyboardShortcuts } from '@frontend/media-playback/use-keyboard-shortcuts';

const MusicalSongPlayer = () => {
  const {
    currentSong: song,
    currentTrack: track,
    nextSongAvailable,
    goToNextSong,
    goToPreviousSong,
    lastSeekedTime,
    currentTimeStamps: timestamps,
  } = useMusicalContext();

  useKeyboardShortcuts([
    [{ key: 'ArrowLeft', ctrlKey: true }, goToPreviousSong],
    [{ key: 'ArrowRight', ctrlKey: true }, goToNextSong],
  ]);

  const videoId = useMemo(() => {
    const videoUrlSearch = new URL(track.url).search;
    const params = new URLSearchParams(videoUrlSearch);
    return params.get('v')!;
  }, [track]);

  const { data: audioElSrcData, error: audioElSrcError } =
    useGoogleDriveAudioSrcDataFetcher(videoId);

  const { data: waveformData, error: waveformDataError } =
    useServerWaveformDataFetcher(videoId);

  const dataReady = !!audioElSrcData && !!waveformData;
  const errorMsgs = [
    audioElSrcError ? 'Could not load audio file' : '',
    waveformDataError ? 'Could not load waveform data' : '',
  ];
  const hasErrors = errorMsgs.some(msg => !!msg);

  const fallbackActionButtonData = useMemo(
    () => ({
      label: 'Play on Youtube instead',
      action: () => {
        window.open(track.url, '_blank');
      },
    }),
    [track]
  );

  const theme = useTheme();
  // required for setting minHeight to prevent height glitch while loading peaks.js WaveformView
  const narrowViewport = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <Box minHeight={narrowViewport ? 517 : 470}>
      {dataReady ? (
        <AudioPlayer
          mainTitle={`${song.no}. ${song.title}`}
          subTitle={track.name}
          audioElSrcData={audioElSrcData}
          waveformData={waveformData}
          nextDisabled={!nextSongAvailable}
          onNext={goToNextSong}
          onPrevious={goToPreviousSong}
          seekTime={lastSeekedTime}
          points={timestamps}
        />
      ) : (
        <>
          <SuspenseContainer
            height={narrowViewport ? 517 : 470}
            status={!hasErrors ? 'loading' : 'error'}
            errors={[
              'Player loading failed 😢',
              ...errorMsgs.filter(msg => !!msg),
            ]}
            fallbackActionButtonData={fallbackActionButtonData}
            loadingMessage="Loading player"
          />
        </>
      )}
    </Box>
  );
};
export default MusicalSongPlayer;
