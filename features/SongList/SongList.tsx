import {
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  SxProps,
} from '@mui/material';
import { Song } from '@models';
import MusicNoteIcon from '@mui/icons-material/MusicNote';
import ResponsiveContainer from '@frontend/layout/ResponsiveContainer';

type Props = {
  songs: Song[];
  currentSong: Song;
  handleSongChange: (newSong: Song) => void;
  title?: string;
  sx?: SxProps;
};
const SongList = ({
  songs,
  currentSong,
  handleSongChange,
  title,
  sx,
}: Props) => {
  return (
    <ResponsiveContainer sx={sx} title={title || 'Songs'}>
      <List>
        {songs.map((song, i) => (
          <ListItemButton
            selected={song === currentSong}
            key={i}
            onClick={() => handleSongChange(song)}
          >
            <ListItemText
              primary={`${song.title}`}
              secondary={`${song.artist}`}
            />
            {song === currentSong && (
              <ListItemIcon>
                <MusicNoteIcon />
              </ListItemIcon>
            )}
          </ListItemButton>
        ))}
      </List>
    </ResponsiveContainer>
  );
};
export default SongList;
