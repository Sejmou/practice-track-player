import { Box, IconButton, SxProps } from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import SkipPreviousIcon from '@mui/icons-material/SkipPrevious';
import SkipNextIcon from '@mui/icons-material/SkipNext';
import Replay5Icon from '@mui/icons-material/Replay5';
import Forward5Icon from '@mui/icons-material/Forward5';
import { useYouTubeStore } from '@frontend/media-playback/use-playback-store';

type Props = {
  sx?: SxProps;
};
const BasicControls = ({ sx }: Props) => {
  const {
    playing,
    seekBackward,
    seekForward,
    togglePlayPause,
    next,
    previous,
  } = useYouTubeStore();

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
        <IconButton
          size="large"
          onClick={() => seekBackward(5)}
          color="primary"
        >
          <Replay5Icon />
        </IconButton>
        <IconButton size="large" onClick={previous} color="primary">
          <SkipPreviousIcon />
        </IconButton>
        <IconButton onClick={togglePlayPause} color="primary" size="large">
          {!playing ? <PlayArrowIcon /> : <PauseIcon />}
        </IconButton>
        <IconButton
          size="large"
          // disabled={nextDisabled}// TODO
          onClick={next}
          color="primary"
        >
          <SkipNextIcon />
        </IconButton>
        <IconButton size="large" onClick={() => seekForward(5)} color="primary">
          <Forward5Icon />
        </IconButton>
      </Box>
    </Box>
  );
};
export default BasicControls;
