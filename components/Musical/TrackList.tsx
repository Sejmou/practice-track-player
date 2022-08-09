import {
  Paper,
  List,
  ListItemButton,
  ListItemText,
  Typography,
  ListItemIcon,
} from '@mui/material';
import MusicNoteIcon from '@mui/icons-material/MusicNote';

import { useMusicalContext } from '@frontend/context/musical-context';

const TrackList = () => {
  const { tracks, currentTrack, setCurrentTrack } = useMusicalContext();

  return (
    <div>
      <Typography variant="h4">Available Tracks</Typography>
      <Paper sx={{ maxHeight: '500px', overflow: 'auto' }}>
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
      </Paper>
    </div>
  );
};

export default TrackList;
