import { Box, SxProps, ToggleButton, Typography } from '@mui/material';
import LoopIcon from '@mui/icons-material/Loop';
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
  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
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
    </Box>
  );
};
export default LoopControls;
