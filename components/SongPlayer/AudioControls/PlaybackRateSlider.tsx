import { Box, Grid, Slider, Stack, SxProps, Typography } from '@mui/material';
// import SlowMotionVideoIcon from '@mui/icons-material/SlowMotionVideo';
import SpeedIcon from '@mui/icons-material/Speed';

type Props = {
  playbackRate: number;
  onPlaybackRateChange: (pbr: number) => void;
  sx?: SxProps;
};
const PlaybackRateSlider = ({
  playbackRate,
  onPlaybackRateChange,
  sx,
}: Props) => {
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
        sx={{ ml: '16px !important' }}
        value={playbackRate}
        min={0.5}
        max={1}
        step={0.05}
        size="small"
        onChange={handleSliderChange}
        aria-labelledby="input-slider"
      />
    </Stack>
  );
};
export default PlaybackRateSlider;
