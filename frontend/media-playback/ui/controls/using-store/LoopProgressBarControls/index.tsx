import { Box, SxProps, Stack } from '@mui/material';
import { usePlaybackStore } from '@frontend/media-playback/store';
import PlaybackProgressBar from '../PlaybackProgressBar';
import LoopBar from './LoopBar';
import LoopBarScroll from './LoopBarScroll';

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
      {loopActive ? (
        <Stack width="100%">
          <LoopBarScroll sx={{ mb: 1 }} />
          <LoopBar />
        </Stack>
      ) : (
        <PlaybackProgressBar />
      )}
    </Box>
  );
};
export default LoopProgressBarControls;
