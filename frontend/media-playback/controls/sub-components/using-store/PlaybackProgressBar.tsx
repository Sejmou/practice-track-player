import { usePlaybackStore } from '@frontend/media-playback/use-playback-store';
import { Box, Slider, SxProps, Typography } from '@mui/material';
import { SyntheticEvent, useState } from 'react';

type Props = {
  sx?: SxProps;
  seekImmediately?: boolean;
};
const PlaybackProgressBar = (props: Props) => {
  const seekImmediately = props.seekImmediately ?? true;
  const [userInteracting, setUserInteracting] = useState(false);

  const {
    currentTime,
    duration,
    seekTo,
    seekBackward,
    seekForward,
    lastSeekTime: lastSeekTime,
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
    <Box sx={{ width: '100%', ...props.sx }}>
      <Slider
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
        sx={{ p: '5px 0' }}
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
      <Typography textAlign="left">{currentTime}</Typography>
      {/* <Typography textAlign="right">{lastSeekTime}</Typography> */}
      <Typography textAlign="right">{duration}</Typography>
    </Box>
  );
};
export default PlaybackProgressBar;
