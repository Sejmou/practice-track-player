import { Box, Slider, SxProps } from '@mui/material';
import { useState } from 'react';

type Props = {
  currentTime: number;
  duration: number;
  onSeeked: (newTime: number) => void;
  sx?: SxProps;
  sendSeekedUpdateOnChangeCommitted?: boolean;
};
const PlaybackProgressBar = (props: Props) => {
  const sendSeekedUpdateOnChangeCommitted =
    props.sendSeekedUpdateOnChangeCommitted ?? false;
  const [userInteracting, setUserInteracting] = useState(false);
  const [seekedPercent, setSeekedPercent] = useState(0);

  const handleChange = (_: Event, newValue: number | number[]) => {
    setSeekedPercent(newValue as number);
    setUserInteracting(true);
    if (!sendSeekedUpdateOnChangeCommitted)
      props.onSeeked((seekedPercent / 100) * props.duration);
  };

  const handleChangeCommmitted = () => {
    if (sendSeekedUpdateOnChangeCommitted)
      props.onSeeked((seekedPercent / 100) * props.duration);
    setUserInteracting(false);
  };

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
        value={
          userInteracting
            ? seekedPercent
            : (props.currentTime / props.duration) * 100
        }
        onChange={handleChange}
        onChangeCommitted={handleChangeCommmitted}
        size="small"
      />
    </Box>
  );
};
export default PlaybackProgressBar;
