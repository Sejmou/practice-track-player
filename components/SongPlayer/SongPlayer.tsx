import { Song, SourceData } from '@models';
import { Box, CircularProgress } from '@mui/material';
import useSWRImmutable from 'swr/immutable';
import AudioControls from './AudioControls';

const fetcher = (url: string) => fetch(url).then(res => res.json());

type Props = { song: Song };

const SongPlayer = ({ song }: Props) => {
  const videoUrlSearch = new URL(song.tracks[0].url).search;
  const params = new URLSearchParams(videoUrlSearch);
  const videoId = params.get('v')!;
  console.log(videoId);

  const { data: audioData, error } = useSWRImmutable<SourceData, any>(
    '/api/yt-audio/' + videoId,
    fetcher
  );

  const nextSongClickHandler = () => {};
  const previousSongClickHandler = () => {};

  return (
    <div>
      <Box
        sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}
      >
        <span>Current Song:</span>
        <b>
          {song.no}. {song.title}
        </b>
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
    </div>
  );
};
export default SongPlayer;
