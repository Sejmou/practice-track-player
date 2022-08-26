import { Slider, Stack, SxProps, Typography } from '@mui/material';
// import SlowMotionVideoIcon from '@mui/icons-material/SlowMotionVideo';
import SpeedIcon from '@mui/icons-material/Speed';
import React from 'react';

type Props = {
  playbackRate: number;
  min: number;
  max: number;
  onPlaybackRateChange: (pbr: number) => void;
  sx?: SxProps;
};
const PlaybackRateSlider = React.forwardRef<HTMLInputElement, Props>(
  ({ playbackRate, onPlaybackRateChange, sx, min, max }: Props, ref) => {
    const handleSliderChange = (event: Event, newValue: number | number[]) => {
      onPlaybackRateChange(newValue as number);
    };

    return (
      <Stack
        width="100%"
        spacing={1}
        direction="row"
        sx={{ p: '16px', ...sx }}
        alignItems="center"
      >
        <SpeedIcon color="primary" />
        <Typography>{playbackRate.toFixed(2)}x</Typography>
        <Slider
          ref={ref} // forwardRef; used to forward KeyboardEvents from parent component
          sx={{ ml: '16px !important' }}
          value={playbackRate}
          min={min}
          max={max}
          step={0.05}
          size="small"
          onChange={handleSliderChange}
          aria-labelledby="input-slider"
        />
      </Stack>
    );
  }
);
PlaybackRateSlider.displayName = 'PlaybackRateSlider';

export default PlaybackRateSlider;
