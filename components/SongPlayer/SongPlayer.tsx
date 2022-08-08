import { Song, SourceData } from '@models';
import { Box, CircularProgress, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import useSWRImmutable from 'swr/immutable';
import AudioControls from './AudioControls';

const fetcher = (url: string) => fetch(url).then(res => res.json());

type Props = { song: Song; trackIdx: number };

const SongPlayer = ({ song, trackIdx }: Props) => {
  console.log('current song', song);
  console.log('current track index', trackIdx);
  const [videoId, setVideoId] = useState<string>();

  useEffect(() => {
    const videoUrlSearch = new URL(song.tracks[trackIdx].url).search;
    const params = new URLSearchParams(videoUrlSearch);
    const newVideoId = params.get('v')!;

    setVideoId(newVideoId);
  }, [song.tracks, trackIdx]);

  const { data: audioData, error } = useSWRImmutable<SourceData, any>(
    videoId ? '/api/yt-audio/' + videoId : null,
    fetcher
  );

  const nextSongClickHandler = () => {};
  const previousSongClickHandler = () => {};

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
      {error && <p>Could not load audio :/</p>}
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
          <CircularProgress />
        </Box>
      ) : (
        <AudioControls
          audioData={audioData}
          onNextClicked={nextSongClickHandler}
          onPreviousClicked={previousSongClickHandler}
        />
      )}
    </Box>
  );
};
export default SongPlayer;
