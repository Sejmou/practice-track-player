import { Box, IconButton, SxProps } from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import SkipPreviousIcon from '@mui/icons-material/SkipPrevious';
import SkipNextIcon from '@mui/icons-material/SkipNext';
import Replay5Icon from '@mui/icons-material/Replay5';
import Forward5Icon from '@mui/icons-material/Forward5';

type Props = {
  previousAvailable?: boolean;
  nextAvailable?: boolean;
  playing: boolean;
  onNext: () => void;
  onPrevious: () => void;
  onPlayPause: () => void;
  onForward5: () => void;
  onBackward5: () => void;
  sx?: SxProps;
};
const BasicControls = ({
  previousAvailable,
  nextAvailable,
  playing,
  onNext,
  onPrevious,
  onPlayPause,
  onForward5,
  onBackward5,
  sx,
}: Props) => {
  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        ...sx,
      }}
    >
      <Box sx={{ width: 'max-content' }}>
        <IconButton size="large" onClick={onBackward5} color="primary">
          <Replay5Icon />
        </IconButton>
        <IconButton size="large" onClick={onPrevious} color="primary">
          <SkipPreviousIcon />
        </IconButton>
        <IconButton onClick={onPlayPause} color="primary" size="large">
          {!playing ? <PlayArrowIcon /> : <PauseIcon />}
        </IconButton>
        <IconButton
          size="large"
          disabled={!nextAvailable}
          onClick={onNext}
          color="primary"
        >
          <SkipNextIcon />
        </IconButton>
        <IconButton size="large" onClick={onForward5} color="primary">
          <Forward5Icon />
        </IconButton>
      </Box>
    </Box>
  );
};
export default BasicControls;
