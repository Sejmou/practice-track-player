import ResponsiveContainer from '@frontend/layout/ResponsiveContainer';
import {
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  SxProps,
} from '@mui/material';
import { PlaylistItems } from '@pages/api/yt/user/playlists';
import MusicNoteIcon from '@mui/icons-material/MusicNote';

type Props = {
  playlists: PlaylistItems;
  currentPlaylistId?: string;
  onPlaylistChange: (idx: number) => void;
  sx?: SxProps;
};

const PlayListList = ({
  playlists,
  currentPlaylistId,
  onPlaylistChange,
  sx,
}: Props) => {
  const playlistList = (
    <List>
      {playlists.map((playlist, i) => (
        <ListItemButton
          selected={playlist.id === currentPlaylistId}
          key={i}
          onClick={() => onPlaylistChange(i)}
        >
          <ListItemText
            primary={`${playlist.title}${
              playlist.id === currentPlaylistId ? ' [playing]' : ''
            }`}
            secondary={playlist.description}
          />
          {playlist.id === currentPlaylistId && (
            <ListItemIcon>
              <MusicNoteIcon />
            </ListItemIcon>
          )}
        </ListItemButton>
      ))}
    </List>
  );

  return (
    <ResponsiveContainer sx={sx} title="Your Playlists">
      {playlistList}
    </ResponsiveContainer>
  );
};
export default PlayListList;
