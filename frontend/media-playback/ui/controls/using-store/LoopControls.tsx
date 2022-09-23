import {
  Box,
  SxProps,
  ToggleButton,
  Typography,
  Stack,
  IconButton,
} from '@mui/material';
import LoopIcon from '@mui/icons-material/Loop';
import ZoomInIcon from '@mui/icons-material/ZoomIn';
import ZoomOutIcon from '@mui/icons-material/ZoomOut';
import { usePlaybackStore } from '@frontend/media-playback/store';
import { secondsToMinutesAndSecondsStr } from '../../format-time';

type Props = {
  sx?: SxProps;
};
const LoopControls = ({ sx }: Props) => {
  const loopActive = usePlaybackStore(state => state.loopActive);
  const enableLoop = usePlaybackStore(state => state.enableLoop);
  const disableLoop = usePlaybackStore(state => state.disableLoop);
  const loopStart = usePlaybackStore(state => state.loopStart);
  const loopEnd = usePlaybackStore(state => state.loopEnd);
  const increaseLoopViewZoom = usePlaybackStore(
    state => state.increaseLoopZoom
  );
  const decreaseLoopViewZoom = usePlaybackStore(
    state => state.decreaseLoopZoom
  );
  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        justifySelf: 'flex-start',
        gap: 1,
        ...sx,
      }}
    >
      <ToggleButton
        value="test"
        selected={loopActive}
        onClick={() => {
          loopActive ? disableLoop() : enableLoop();
        }}
        color="primary"
        size="small"
      >
        <LoopIcon />
      </ToggleButton>
      <Typography variant="body2">
        {loopActive
          ? `Looping (${secondsToMinutesAndSecondsStr(
              loopStart
            )} - ${secondsToMinutesAndSecondsStr(loopEnd)})`
          : 'Not looping'}
      </Typography>
      {loopActive && (
        <Stack direction="row">
          <IconButton color="primary" onClick={increaseLoopViewZoom}>
            <ZoomInIcon />
          </IconButton>
          <IconButton color="primary" onClick={decreaseLoopViewZoom}>
            <ZoomOutIcon />
          </IconButton>
        </Stack>
      )}
    </Box>
  );
};
export default LoopControls;
