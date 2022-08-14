import {
  Paper,
  List,
  ListItemButton,
  ListItemText,
  Typography,
  ListItemIcon,
  SxProps,
} from '@mui/material';
import MusicNoteIcon from '@mui/icons-material/MusicNote';

import { useMusicalContext } from '@frontend/context/musical-context';
import ResponsiveContainer from '@components/layout/ResponsiveContainer';

type Props = { sx?: SxProps };

const TrackList = ({ sx }: Props) => {
  const { tracks, currentTrack, setCurrentTrack } = useMusicalContext();

  const trackList = (
    <List>
      {tracks.map((track, i) => (
        <ListItemButton
          selected={track === currentTrack}
          key={i}
          onClick={() => setCurrentTrack(track)}
        >
          <ListItemText
            primary={`${track.name}${
              track === currentTrack ? ' [playing]' : ''
            }`}
          />
          {track === currentTrack && (
            <ListItemIcon>
              <MusicNoteIcon />
            </ListItemIcon>
          )}
        </ListItemButton>
      ))}
    </List>
  );

  return (
    <ResponsiveContainer sx={sx} title="Available Tracks">
      {trackList}
    </ResponsiveContainer>
  );
};

export default TrackList;
