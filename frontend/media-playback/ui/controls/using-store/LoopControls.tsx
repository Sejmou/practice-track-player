import { Box, SxProps, ToggleButton } from '@mui/material';
import LoopIcon from '@mui/icons-material/Loop';
import { usePlaybackStore } from '@frontend/media-playback/store';

type Props = {
  sx?: SxProps;
};
const LoopControls = ({ sx }: Props) => {
  const { enableLoop, disableLoop, loopActive } = usePlaybackStore(
    ({ loopActive, enableLoop, disableLoop }) => ({
      loopActive,
      enableLoop,
      disableLoop,
    })
  );
  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
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
    </Box>
  );
};
export default LoopControls;
