import { useMusicalContext } from '@frontend/context/musical-context';
import { SourceData } from '@models';
import { Box, CircularProgress, Typography } from '@mui/material';
import { useMemo } from 'react';
import useSWRImmutable from 'swr/immutable';
import AudioControls from './AudioControls';

const fetcher = (url: string) => fetch(url).then(res => res.json());

const SongPlayer = () => {
  const {
    currentSong: song,
    currentTrack: track,
    previousSongAvailable,
    nextSongAvailable,
    goToNextSong,
    goToPreviousSong,
  } = useMusicalContext();

  const videoId = useMemo(() => {
    const videoUrlSearch = new URL(track.url).search;
    const params = new URLSearchParams(videoUrlSearch);
    return params.get('v')!;
  }, [track]);

  const { data: audioData, error } = useSWRImmutable<SourceData, any>(
    '/api/yt-audio/' + videoId,
    fetcher
  );

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
      {!audioData ? (
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
      ) : (
        <AudioControls
          audioData={audioData}
          onNextClicked={goToNextSong}
          onPreviousClicked={goToPreviousSong}
          nextAvailable={nextSongAvailable}
          previousAvailable={previousSongAvailable}
        />
      )}
    </Box>
  );
};
export default SongPlayer;
