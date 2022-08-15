import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Box, keyframes, useMediaQuery, useTheme } from '@mui/material';

import { useMusicalContext } from '@frontend/context/musical-context';
import SuspenseContainer from '@components/SuspenseContainer/SuspenseContainer';
import SongPlayer, {
  SongPlayerHandle,
} from '@components/SongPlayer/SongPlayer';
import {
  useServerAudioSrcDataFetcher,
  useServerWaveformDataFetcher,
  useYouTubeAudioSrcDataFetcher,
} from '@frontend/hooks/use-audio-data-fetcher';
import { copyAndDispatchKeyboardEvent } from '@frontend';
import { useSongPlayerKeyboardShortcuts } from '@frontend/hooks/use-songplayer-kb-shortcuts';

const MusicalSongPlayer = () => {
  const {
    currentSong: song,
    currentTrack: track,
    previousSongAvailable,
    nextSongAvailable,
    goToNextSong,
    goToPreviousSong,
    lastSeekedTime,
  } = useMusicalContext();

  const videoId = useMemo(() => {
    const videoUrlSearch = new URL(track.url).search;
    const params = new URLSearchParams(videoUrlSearch);
    return params.get('v')!;
  }, [track]);

  const { data: audioElSrcData, error: audioElSrcError } =
    useYouTubeAudioSrcDataFetcher(videoId);
  // useServerAudioSrcDataFetcher(videoId);

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

  const songPlayerRef = useRef<SongPlayerHandle>(null);

  useSongPlayerKeyboardShortcuts(songPlayerRef);

  return (
    <Box minHeight={narrowViewport ? 517 : 470}>
      {dataReady ? (
        <SongPlayer
          song={song}
          ref={songPlayerRef}
          audioElSrcData={audioElSrcData}
          waveformData={waveformData}
          previousSongAvailable={previousSongAvailable}
          nextSongAvailable={nextSongAvailable}
          onNextSong={goToNextSong}
          onPreviousSong={goToPreviousSong}
          seekTime={lastSeekedTime}
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
