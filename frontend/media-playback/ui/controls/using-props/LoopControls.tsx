import { Box, SxProps, ToggleButton } from '@mui/material';
import LoopIcon from '@mui/icons-material/Loop';

type Props = {
  loopActive: boolean;
  loopActiveChange: (newVal: boolean) => void;
  sx?: SxProps;
};
const LoopControls = ({ loopActive, loopActiveChange, sx }: Props) => {
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
        onChange={(_, selected) => loopActiveChange(selected)}
        color="primary"
        size="small"
      >
        <LoopIcon />
      </ToggleButton>
    </Box>
  );
};
export default LoopControls;
