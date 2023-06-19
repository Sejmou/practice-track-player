import {
  Box,
  SxProps,
  ToggleButton,
  Typography,
  Stack,
  IconButton,
  Button,
} from '@mui/material';
import LoopIcon from '@mui/icons-material/Loop';
import ZoomInIcon from '@mui/icons-material/ZoomIn';
import ZoomOutIcon from '@mui/icons-material/ZoomOut';
import { usePlaybackStore } from '@frontend/media-playback/store';
import { secondsToTimeStr } from '../../../../util/format-time';

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
  const setStartCurrent = usePlaybackStore(
    state => state.setLoopStartToCurrent
  );
  const setEndCurrent = usePlaybackStore(state => state.setLoopEndToCurrent);

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        justifySelf: 'flex-start',
        flexDirection: {
          xs: 'column',
          md: 'row',
        },
        gap: 1,
        ...sx,
      }}
    >
      <Stack direction="row" alignItems="center" spacing={1}>
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
            ? `${secondsToTimeStr(loopStart)} - ${secondsToTimeStr(loopEnd)}`
            : 'Not looping'}
        </Typography>
      </Stack>
      {loopActive && (
        <>
          <Stack direction="row">
            <IconButton color="primary" onClick={increaseLoopViewZoom}>
              <ZoomInIcon />
            </IconButton>
            <IconButton color="primary" onClick={decreaseLoopViewZoom}>
              <ZoomOutIcon />
            </IconButton>
          </Stack>
          <Stack direction="row">
            <Button color="primary" onClick={setStartCurrent}>
              Start Now
            </Button>
            <Button color="primary" onClick={setEndCurrent}>
              End Now
            </Button>
          </Stack>
        </>
      )}
    </Box>
  );
};
export default LoopControls;
