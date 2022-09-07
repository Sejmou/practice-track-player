import { usePlaybackStore } from '@frontend/media-playback/store';
import { secondsToMinutesAndSecondsStr } from '@frontend/media-playback/ui/format-time';
import { Box, SxProps, Typography } from '@mui/material';
import ProgressBar from '../PlaybackProgressBar/ProgressBar';
import LoopBar from './LoopBar';

//TODO: this is very similar to PlaybackProgressBar/index.tsx, maybe refactor one day

const containerStyles: SxProps = {
  display: 'grid',
  width: '100%',
  gridTemplateColumns: '48px 1fr 48px',
  gridTemplateAreas: {
    xs: '"bar bar bar" "loopbar loopbar loopbar" "cur . dur"',
    sm: `"cur bar dur" ". loopbar ."`,
  },
  gap: { sm: 1, xs: 0 },
  mt: 1,
  alignItems: 'center',
};

const currentTimeStyles: SxProps = {
  gridArea: 'cur',
  justifySelf: { xs: 'flex-start', sm: 'flex-end' },
  typography: { xs: 'body2', sm: 'body1' },
};

const durationStyles: SxProps = {
  gridArea: 'dur',
  justifySelf: { xs: 'flex-end', sm: 'flex-start' },
  typography: { xs: 'body2', sm: 'body1' },
};

const progressBarStyles: SxProps = { gridArea: 'bar', p: '5px 0' };

const loopBarStyles: SxProps = { gridArea: 'loopbar', p: '5px 0' };

type Props = { sx?: SxProps };

const PlaybackProgressBar = ({ sx }: Props) => {
  const currentTime = usePlaybackStore(state => state.currentTime);
  const duration = usePlaybackStore(state => state.duration);
  const loopActive = usePlaybackStore(state => state.loopActive);

  return (
    <Box sx={{ ...containerStyles, ...sx }}>
      <Typography sx={currentTimeStyles}>
        {secondsToMinutesAndSecondsStr(currentTime)}
      </Typography>
      <ProgressBar sx={progressBarStyles} />
      <Typography sx={durationStyles}>
        {duration ? secondsToMinutesAndSecondsStr(duration) : '--:--'}
      </Typography>
      <LoopBar
        sx={{ ...loopBarStyles, display: loopActive ? 'block' : 'none' }}
      />
    </Box>
  );
};
export default PlaybackProgressBar;
