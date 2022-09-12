import { Box, SxProps } from '@mui/material';
import BasicControls from './controls/using-store/BasicControls';
import LoopControls from './controls/using-store/LoopControls';
import LoopProgressBarControls from './controls/using-store/LoopProgressBarControls';
import PlaybackProgressBar from './controls/using-store/PlaybackProgressBar';
import PlaybackRateSlider from './controls/using-store/PlaybackRateSlider';

const controlsContainerStyles: SxProps = {
  display: 'grid',
  width: '100%',
  gridAutoColumns: 'minmax(0, 1fr)', // this makes columns exactly the same width https://stackoverflow.com/a/61240964/13727176
  gridTemplateAreas: {
    xs: '"loop pbr" "progress progress" "basic basic"',
    sm: '"progress progress progress" "loop basic pbr"',
  },
  mt: 1,
};

const basicControlsStyles: SxProps = {
  gridArea: 'basic',
};

const playbackRateSliderStyles: SxProps = {
  gridArea: 'pbr',
};

const progressBarStyles: SxProps = {
  gridArea: 'progress',
};

const loopControlsStyles: SxProps = {
  gridArea: 'loop',
};

const PBRAndLoopPlayerUI = () => (
  <Box sx={controlsContainerStyles}>
    <BasicControls sx={basicControlsStyles} />
    <LoopControls sx={loopControlsStyles} />
    <LoopProgressBarControls sx={progressBarStyles} />
    <PlaybackRateSlider sx={playbackRateSliderStyles} />
  </Box>
);
export default PBRAndLoopPlayerUI;
