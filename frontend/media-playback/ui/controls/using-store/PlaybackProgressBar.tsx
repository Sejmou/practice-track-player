import { usePlaybackStore } from '@frontend/media-playback/use-playback-store';
import { Box, Slider, SxProps, Typography } from '@mui/material';
import { SyntheticEvent, useState } from 'react';

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

type Props = {
  sx?: SxProps;
  seekImmediately?: boolean;
};

const PlaybackProgressBar = (props: Props) => {
  const seekImmediately = props.seekImmediately ?? true;
  const [userInteracting, setUserInteracting] = useState(false);

  const {
    currentElementData: { currentTime, duration, lastSeekTime },
    seekTo,
    seekBackward,
    seekForward,
  } = usePlaybackStore();

  const handleChange = (_: Event, newValue: number | number[]) => {
    setUserInteracting(true);
    if (duration && seekImmediately)
      seekTo(((newValue as number) / 100) * duration);
  };

  const handleChangeCommmitted = (
    ev: Event | SyntheticEvent<Element, Event>,
    newValue: number | number[]
  ) => {
    if (duration) seekTo(((newValue as number) / 100) * duration);
    setUserInteracting(false);
  };

  return (
    <Box sx={{ ...containerStyles, ...props.sx }}>
      <Typography sx={currentTimeStyles}>
        {secondsToMinutesAndSecondsStr(currentTime)}
      </Typography>
      <Slider
        sx={progressBarStyles}
        onKeyDownCapture={ev => {
          // prevent everything except TAB -> may be used to skip through focusable elements on page
          // left/right arrow interactions would trigger slider movement -> does not work well with
          // "global keyboard shortcuts" for skipping through media (also bound to left/right)
          if (ev.key === 'ArrowLeft') {
            seekBackward(5);
            ev.preventDefault();
          }
          if (ev.key === 'ArrowRight') {
            seekForward(5);
            ev.preventDefault();
          }
        }}
        value={
          !currentTime || !duration
            ? 0
            : ((userInteracting && lastSeekTime ? lastSeekTime : currentTime) /
                duration) *
              100
        }
        onChange={handleChange}
        onChangeCommitted={handleChangeCommmitted}
        size="small"
      />
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
