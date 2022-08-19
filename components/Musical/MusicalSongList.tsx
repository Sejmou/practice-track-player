import { useMusicalContext } from '@frontend/context/musical-context';
import {
  List,
  ListItemButton,
  ListItemText,
  ListItemIcon,
  SxProps,
} from '@mui/material';
import MusicNoteIcon from '@mui/icons-material/MusicNote';
import ResponsiveContainer from '@components/layout/ResponsiveContainer';

type Props = { sx?: SxProps };

const MusicalSongList = ({ sx }: Props) => {
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
    <ResponsiveContainer sx={sx} title="All Songs">
      {songList}
    </ResponsiveContainer>
  );
};

export default MusicalSongList;
