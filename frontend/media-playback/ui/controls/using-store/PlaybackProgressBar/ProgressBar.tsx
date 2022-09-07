import { usePlaybackStore } from '@frontend/media-playback/store';
import { Slider, SxProps } from '@mui/material';
import { SyntheticEvent, useState } from 'react';
type Props = {
  sx?: SxProps;
  seekImmediately?: boolean;
};

const ProgressBar = ({ sx, seekImmediately: seekProps }: Props) => {
  const seekImmediately = seekProps ?? true;
  const [userInteracting, setUserInteracting] = useState(false);

  const currentTime = usePlaybackStore(state => state.currentTime);
  const duration = usePlaybackStore(state => state.duration);
  const lastSeekTime = usePlaybackStore(state => state.lastSeekTime);
  const seekTo = usePlaybackStore(state => state.seekTo);
  const seekBackward = usePlaybackStore(state => state.seekBackward);
  const seekForward = usePlaybackStore(state => state.seekForward);

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
    <Slider
      sx={sx}
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
  );
};
export default ProgressBar;
