import {
  Paper,
  List,
  ListItemButton,
  ListItemText,
  Typography,
  Box,
} from '@mui/material';

import { Song } from '@models';

type Props = {
  songs: Song[];
  songIdx: number;
  onSongChange: (idx: number) => void;
};
const SongList = ({ songs, onSongChange }: Props) => {
  return (
    <Box>
      <Typography variant="h4">All Songs</Typography>
      <Paper sx={{ maxHeight: '500px', overflow: 'auto' }}>
        <List>
          {songs.map((song, i) => (
            <ListItemButton key={song.no} onClick={() => onSongChange(i)}>
              <ListItemText primary={`${song.no}. ${song.title}`} />
            </ListItemButton>
          ))}
        </List>
      </Paper>
    </Box>
  );
};

export default SongList;
