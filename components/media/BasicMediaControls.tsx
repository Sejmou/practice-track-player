import { BasicMediaControlsProps } from '@frontend/hooks/media-playback';
import { Box, SxProps } from '@mui/material';
import BasicControls from './media-controls/BasicControls';
import PlaybackProgressBar from './media-controls/PlaybackProgressBar';

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

const BasicMediaPlayerUI = (props: BasicMediaControlsProps) => {
  return (
    <Box sx={controlsContainerStyles}>
      <BasicControls
        playing={props.isPlaying}
        onNext={props.handleNext}
        onPrevious={props.handlePrevious}
        onForward5={props.handleForward5}
        onBackward5={props.handleBackward5}
        onPlayPause={props.handlePlayPauseToggle}
        sx={basicControlsStyles}
      />
      <PlaybackProgressBar
        currentTime={props.currentTime}
        duration={props.duration}
        onSeeked={props.handleSeek}
        sx={progressBarStyles}
      />
    </Box>
  );
};
export default BasicMediaPlayerUI;
