import { Box, SxProps } from '@mui/material';
import { usePlaybackStore } from '../use-playback-store';
import BasicControls from './sub-components/using-props/BasicControls';
import PlaybackProgressBar from './sub-components/using-store/PlaybackProgressBar';

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

// TODO: implement with new approach (components for UI, hooks for adding logic to components)

const BasicMediaPlayerUI = () => {
  const { playing, seekForward, seekBackward, togglePlayPause } =
    usePlaybackStore();

  return (
    <Box sx={controlsContainerStyles}>
      <BasicControls
        playing={playing}
        onNext={() => {
          console.log('next');
        }}
        onPrevious={() => {
          console.log('previous');
        }}
        onForward5={() => seekForward(5)}
        onBackward5={() => seekBackward(5)}
        onPlayPause={togglePlayPause}
        sx={basicControlsStyles}
      />
      <PlaybackProgressBar sx={progressBarStyles} />
    </Box>
  );
};
export default BasicMediaPlayerUI;
