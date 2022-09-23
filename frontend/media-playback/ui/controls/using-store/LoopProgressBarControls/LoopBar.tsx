import { Box, Slider, SxProps, Typography, Stack } from '@mui/material';
import { useCallback, useMemo } from 'react';
import { usePlaybackStore } from '@frontend/media-playback/store';
import { secondsToMinutesAndSecondsStr } from '@frontend/media-playback/ui/format-time';

type Props = {
  sx?: SxProps;
};

const LoopBar = ({ sx }: Props) => {
  const duration = usePlaybackStore(state => state.duration);
  const loopStart = usePlaybackStore(state => state.loopStart);
  const setLoopStart = usePlaybackStore(state => state.setLoopStart);
  const loopEnd = usePlaybackStore(state => state.loopEnd);
  const setLoopEnd = usePlaybackStore(state => state.setLoopEnd);

  const loopStartPerc = percentageFromTime(loopStart, duration);
  const loopEndPerc = percentageFromTime(loopEnd, duration);

  const handleChange = useCallback(
    (_: Event, newValue: number | number[]) => {
      const [start, end] = (newValue as number[]).map(num =>
        percentageToTime(num, duration)
      );
      if (end === 0) return;
      if (start !== loopStart) setLoopStart(start);
      if (end !== loopEnd) setLoopEnd(end);
    },
    [duration, setLoopEnd, setLoopStart, loopStart, loopEnd]
  );

  const currentTime = usePlaybackStore(state => state.currentTime);
  const formatSliderValue = useCallback(
    (percValue: number) =>
      secondsToMinutesAndSecondsStr(percentageToTime(percValue, duration)),
    [duration]
  );
  const sliderMarks = useMemo(
    () => [
      {
        value: 0,
        label: formatSliderValue(0),
      },
      {
        value: percentageFromTime(currentTime, duration),
        label: (
          <Stack sx={{ mt: -5, alignItems: 'center' }}>
            {/* <Typography variant="caption" sx={{ mb: -1 }}>
              current:
            </Typography> */}
            <Typography variant="caption">
              {secondsToMinutesAndSecondsStr(currentTime)}
            </Typography>
          </Stack>
        ),
      },
      {
        value: 100,
        label: formatSliderValue(100),
      },
    ],
    [currentTime, duration, formatSliderValue]
  );

  const lowerLimit = usePlaybackStore(store => store.loopZoomViewLowerLimit);
  const upperLimit = usePlaybackStore(store => store.loopZoomViewUpperLimit);

  return (
    <Box sx={{ width: '100%', ...sx }}>
      <Slider
        sx={{ mx: 2, mb: 2 }}
        onKeyDownCapture={ev => {
          // prevent everything except TAB -> may be used to skip through focusable elements on page
          // left/right arrow interactions would trigger slider movement -> does not work well with
          // "global keyboard shortcuts" for skipping through media (also bound to left/right)
          if (ev.key === 'ArrowLeft') {
            ev.preventDefault();
          }
          if (ev.key === 'ArrowRight') {
            ev.preventDefault();
          }
        }}
        value={[loopStartPerc, loopEndPerc]}
        valueLabelDisplay="auto"
        valueLabelFormat={formatSliderValue}
        onChange={handleChange}
        size="small"
        marks={sliderMarks}
      />
    </Box>
  );
};
export default LoopBar;

function percentageFromTime(time: number, duration: number | null) {
  return (time / (duration ?? 1)) * 100;
}

function percentageToTime(perc: number, duration: number | null) {
  return (perc / 100) * (duration ?? 1);
}
