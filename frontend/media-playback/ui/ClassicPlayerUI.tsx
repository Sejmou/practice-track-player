import { Box, SxProps } from '@mui/material';
import BasicControls from './controls/using-store/BasicControls';
import PlaybackProgressBar from './controls/using-store/PlaybackProgressBar';

const controlsContainerStyles: SxProps = {
  display: 'grid',
  width: '100%',
  gridAutoColumns: 'minmax(0, 1fr)', // this makes columns exactly the same width https://stackoverflow.com/a/61240964/13727176
  gridTemplateAreas: '"basic" "progress"',
  mt: 1,
};

const basicControlsStyles: SxProps = {
  gridArea: 'basic',
};

const progressBarStyles: SxProps = {
  gridArea: 'progress',
};

const ClassicPlayerUI = () => (
  <Box sx={controlsContainerStyles}>
    <BasicControls sx={basicControlsStyles} />
    <PlaybackProgressBar sx={progressBarStyles} />
  </Box>
);
export default ClassicPlayerUI;
