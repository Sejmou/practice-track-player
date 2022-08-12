import { useMusicalContext } from '@frontend/context/musical-context';
import {
  Paper,
  List,
  ListItemButton,
  ListItemText,
  Typography,
  Box,
  ListItemIcon,
  useTheme,
  useMediaQuery,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import MusicNoteIcon from '@mui/icons-material/MusicNote';
import ResponsiveContainer from '@components/layout/ResponsiveContainer';

const SongList = () => {
  const { songs, currentSong, setCurrentSong } = useMusicalContext();

  const songList = (
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
  );

  return (
    <ResponsiveContainer title="All Songs">{songList}</ResponsiveContainer>
  );
};

export default SongList;
