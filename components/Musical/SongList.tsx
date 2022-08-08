import { Song } from '@models';
import { List, ListItem, ListItemButton, ListItemText } from '@mui/material';
import SongItem from './SongItem';

type Props = {
  songs: Song[];
  onSongChange: (songNo: string) => void;
};
const SongList = ({ songs, onSongChange }: Props) => {
  return (
    <div>
      <h2>Songs (click any to switch):</h2>
      <List>
        {songs.map(song => (
          <ListItemButton key={song.no} onClick={() => onSongChange(song.no)}>
            <ListItemText primary={`${song.no}. ${song.title}`} />
          </ListItemButton>
        ))}
      </List>
    </div>
  );
};

export default SongList;
