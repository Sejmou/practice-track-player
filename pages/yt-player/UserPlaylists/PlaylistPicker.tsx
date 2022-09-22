import { Autocomplete, SxProps, TextField } from '@mui/material';
import { PlaylistItem } from '@pages/api/yt/user/playlists';

type Props = {
  playlists: PlaylistItem[];
  onPlaylistSelected: (playlist: PlaylistItem) => void;
  sx?: SxProps;
};

const PlaylistPicker = ({
  playlists,
  onPlaylistSelected: onPlaylistChange,
  sx,
}: Props) => {
  return (
    <Autocomplete
      disablePortal
      id="combo-box-demo"
      options={playlists}
      getOptionLabel={playlist =>
        playlist.title || `unnamed playlist (id: ${playlist.id})`
      }
      sx={{ width: '100%', ...sx }}
      renderInput={params => (
        <TextField {...params} label="Search your playlists..." />
      )}
      onChange={(_, playlist) => {
        if (playlist) onPlaylistChange(playlist);
      }}
    />
  );
};

export default PlaylistPicker;
