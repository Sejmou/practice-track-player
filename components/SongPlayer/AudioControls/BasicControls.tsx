import { Box, IconButton } from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import SkipPreviousIcon from '@mui/icons-material/SkipPrevious';
import SkipNextIcon from '@mui/icons-material/SkipNext';

type Props = {
  previousAvailable?: boolean;
  nextAvailable?: boolean;
  playing: boolean;
  onNext: () => void;
  onPrevious: () => void;
  onPlayPause: () => void;
};
const BasicControls = ({
  previousAvailable,
  nextAvailable,
  playing,
  onNext,
  onPrevious,
  onPlayPause,
}: Props) => {
  return (
    <Box
      sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}
    >
      <Box>
        <IconButton
          size="large"
          disabled={!previousAvailable}
          onClick={onPrevious}
          color="primary"
        >
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
      </Box>
    </Box>
  );
};
export default BasicControls;
