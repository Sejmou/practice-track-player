import { Box, Slider, SxProps } from '@mui/material';
import { useEffect, useState } from 'react';

type Props = {
  currentTime: number;
  duration: number;
  onSeeked: (newTime: number) => void;
  sx?: SxProps;
};
const PlaybackProgressBar = (props: Props) => {
  const [userInteracting, setUserInteracting] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);

  useEffect(() => {
    if (!userInteracting) {
      setCurrentTime(props.currentTime);
    }
  }, [userInteracting, props.currentTime]);

  return (
    <Box sx={{ width: '100%', mr: 2, ml: 2, ...props.sx }}>
      <Slider
        onKeyDownCapture={ev => {
          // prevent everything except TAB -> may be used to skip through focusable elements on page
          // left/right arrow interactions would trigger slider movement -> does not work well with
          // "global keyboard shortcuts" for skipping through media (also bound to left/right)
          if (ev.key !== 'Tab       ') ev.preventDefault();
        }}
        sx={{ p: '5px 0' }}
        value={(currentTime / props.duration) * 100}
        onChange={() => {
          setUserInteracting(true);
        }}
        onChangeCommitted={(_, newValue) => {
          props.onSeeked(((newValue as number) / 100) * props.duration);
          setUserInteracting(false);
        }}
        size="small"
      />
    </Box>
  );
};
export default PlaybackProgressBar;
