import { usePlaybackStore } from '@frontend/media-playback/store';
import { Box, SxProps, Typography } from '@mui/material';
import ProgressBar from './ProgressBar';

const containerStyles: SxProps = {
  display: 'grid',
  width: '100%',
  gridTemplateColumns: '48px 1fr 48px', // this makes columns exactly the same width https://stackoverflow.com/a/61240964/13727176
  gridTemplateAreas: {
    xs: '"bar bar bar" "cur 1fr dur"',
    sm: `"cur bar dur"`,
  },
  gap: { sm: 1, xs: 0 },
  mt: 1,
  // justifyContent: 'center',
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

type Props = { sx?: SxProps };

const PlaybackProgressBar = ({ sx }: Props) => {
  const currentTime = usePlaybackStore(state => state.currentTime);
  const duration = usePlaybackStore(state => state.duration);

  return (
    <Box sx={{ ...containerStyles, ...sx }}>
      <Typography sx={currentTimeStyles}>
        {secondsToMinutesAndSecondsStr(currentTime)}
      </Typography>
      <ProgressBar sx={progressBarStyles} />
      <Typography sx={durationStyles}>
        {duration ? secondsToMinutesAndSecondsStr(duration) : '--:--'}
      </Typography>
    </Box>
  );
};
export default PlaybackProgressBar;

function secondsToMinutesAndSecondsStr(secs: number) {
  let minutes = Math.floor(secs / 60);
  let seconds = Math.round(secs % 60);
  if (seconds == 60) {
    minutes++;
    seconds = 0;
  }
  return `${padTo2Digits(minutes)}:${padTo2Digits(seconds)}`;
}

function padTo2Digits(num: number) {
  return num.toString().padStart(2, '0');
}
