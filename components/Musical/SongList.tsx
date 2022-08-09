import { useMusicalContext } from '@frontend/context/musical-context';
import {
  Paper,
  List,
  ListItemButton,
  ListItemText,
  Typography,
  Box,
  ListItemIcon,
} from '@mui/material';
import MusicNoteIcon from '@mui/icons-material/MusicNote';

const SongList = () => {
  const { songs, currentSong, setCurrentSong } = useMusicalContext();
  return (
    <Box>
      <Typography variant="h4">All Songs</Typography>
      <Paper sx={{ maxHeight: '500px', overflow: 'auto' }}>
        <List>
          {songs.map((song, i) => (
            <ListItemButton
              selected={song === currentSong}
              key={i}
              onClick={() => setCurrentSong(song)}
            >
              <ListItemText
                primary={`${song.no}. ${song.title}${
                  song === currentSong ? ' [current]' : ''
                }`}
              />
              {song === currentSong && (
                <ListItemIcon>
                  <MusicNoteIcon />
                </ListItemIcon>
              )}
            </ListItemButton>
          ))}
        </List>
      </Paper>
    </Box>
  );
};

export default SongList;
