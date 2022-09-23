import { usePlaybackStore } from '@frontend/media-playback/store';
import { Box, SxProps } from '@mui/material';
import PlaybackProgressBar from '../PlaybackProgressBar';
import LoopBar from './LoopBar';

//TODO: this is very similar to PlaybackProgressBar/index.tsx, maybe refactor one day

const containerStyles: SxProps = {
  display: 'flex',
  width: '100%',
};

type Props = { sx?: SxProps };

const LoopProgressBarControls = ({ sx }: Props) => {
  const loopActive = usePlaybackStore(state => state.loopActive);

  return (
    <Box sx={{ ...containerStyles, ...sx }}>
      {loopActive ? <LoopBar /> : <PlaybackProgressBar />}
    </Box>
  );
};
export default LoopProgressBarControls;
