import {
  Button,
  List,
  ListItemButton,
  ListItemText,
  Popover,
} from '@mui/material';
import SlowMotionVideoIcon from '@mui/icons-material/SlowMotionVideo';
import { useState } from 'react';

type Props = {
  playbackRate: number;
  onPlaybackRateChange: (pbr: number) => void;
};
const PlaybackRatePicker = ({ playbackRate, onPlaybackRateChange }: Props) => {
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);
  const id = open ? 'simple-popover' : undefined;

  const playbackRateOptions = [0.5, 0.75, 1, 1.25, 1.5];

  return (
    <div>
      <Button
        size="small"
        sx={{ textTransform: 'none' }}
        variant="outlined"
        onClick={handleClick}
        startIcon={<SlowMotionVideoIcon />}
      >
        {playbackRate}x
      </Button>
      <Popover
        id={id}
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
      >
        <List dense={true}>
          {playbackRateOptions.map(opt => (
            <ListItemButton
              onClick={() => {
                handleClose();
                onPlaybackRateChange(opt);
              }}
              key={opt}
            >
              <ListItemText primary={`${opt}x`} />
            </ListItemButton>
          ))}
        </List>
      </Popover>
    </div>
  );
};
export default PlaybackRatePicker;
