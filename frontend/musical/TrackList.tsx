import {
  List,
  ListItemButton,
  ListItemText,
  ListItemIcon,
  SxProps,
} from '@mui/material';
import MusicNoteIcon from '@mui/icons-material/MusicNote';

import { useMusicalContext } from '@frontend/musical/musical-context';
import ResponsiveContainer from '@frontend/layout/ResponsiveContainer';
import { useKeyboardShortcuts } from '@frontend/util/use-keyboard-shortcuts';

type Props = { sx?: SxProps };

const TrackList = ({ sx }: Props) => {
  const {
    tracks,
    currentTrack,
    setCurrentTrack,
    goToNextTrack,
    goToPreviousTrack,
  } = useMusicalContext();

  useKeyboardShortcuts([
    [{ key: 'ArrowDown', ctrlKey: true }, goToNextTrack],
    [{ key: 'ArrowUp', ctrlKey: true }, goToPreviousTrack],
  ]);

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
