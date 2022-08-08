import {
  Paper,
  List,
  ListItemButton,
  ListItemText,
  Typography,
} from '@mui/material';

import { SongTrack } from '@models';

type Props = {
  tracks: SongTrack[];
  onTrackChange: (trackIdx: number) => void;
};
const TrackList = ({ tracks, onTrackChange }: Props) => {
  return (
    <div>
      <Typography variant="h4">Available Tracks</Typography>
      <Paper sx={{ maxHeight: '500px', overflow: 'auto' }}>
        <List>
          {tracks.map((track, i) => (
            <ListItemButton key={i} onClick={() => onTrackChange(i)}>
              <ListItemText primary={`${track.track}`} />
            </ListItemButton>
          ))}
        </List>
      </Paper>
    </div>
  );
};

export default TrackList;
