import { Slider, Stack, SxProps, Typography } from '@mui/material';
import SpeedIcon from '@mui/icons-material/Speed';
import React from 'react';
import { useYouTubeStore } from '@frontend/media-playback/store';

type Props = {
  sx?: SxProps;
};
const PlaybackRateSlider = React.forwardRef<HTMLInputElement, Props>(
  ({ sx }: Props, ref) => {
    const {
      changePlaybackRate,
      playbackRate,
      minPlaybackRate,
      maxPlaybackRate,
    } = useYouTubeStore();

    const handleSliderChange = (event: Event, newValue: number | number[]) => {
      changePlaybackRate(newValue as number);
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
          min={minPlaybackRate}
          max={maxPlaybackRate}
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
