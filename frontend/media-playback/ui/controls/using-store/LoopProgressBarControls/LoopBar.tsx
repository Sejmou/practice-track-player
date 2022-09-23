import { Box, Slider, SxProps, Typography, Stack } from '@mui/material';
import { useCallback, useEffect, useMemo } from 'react';
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

  const currentTime = usePlaybackStore(state => state.currentTime);
  const formatSliderValue = useCallback(
    (percValue: number) =>
      secondsToMinutesAndSecondsStr(percentageToTime(percValue, duration)),
    [duration]
  );
  const zoomLowerLimit = usePlaybackStore(
    store => store.loopZoomViewLowerLimit
  );
  const zoomUpperLimit = usePlaybackStore(
    store => store.loopZoomViewUpperLimit
  );

  // TODO
  // const loopStartSliderValue =
  //   zoomLowerLimit < loopStart
  //     ? percentageFromTime(loopStart, zoomUpperLimit)
  //     : 0;
  // const loopEndSliderValue =
  //   zoomUpperLimit > loopEnd
  //     ? percentageFromTime(loopEnd, zoomUpperLimit)
  //     : 100;

  const loopStartInZoomView = useMemo(
    () => loopStart >= zoomLowerLimit && loopStart <= zoomUpperLimit,
    [loopStart, zoomLowerLimit, zoomUpperLimit]
  );

  const loopEndInZoomView = useMemo(
    () => loopEnd >= zoomLowerLimit && loopEnd <= zoomUpperLimit,
    [loopEnd, zoomLowerLimit, zoomUpperLimit]
  );

  const handleChange = useCallback(
    (_: Event, newValue: number | number[]) => {
      const [start, end] = (newValue as number[]).map(num =>
        percentageToTime(num, duration)
      );
      if (end === 0) return;
      if (loopStartInZoomView && start !== loopStart) setLoopStart(start);
      if (loopEndInZoomView && end !== loopEnd) setLoopEnd(end);
    },
    [
      duration,
      setLoopEnd,
      setLoopStart,
      loopStart,
      loopEnd,
      loopStartInZoomView,
      loopEndInZoomView,
    ]
  );

  useEffect(() => {
    console.log('zoom view limits', zoomLowerLimit, zoomUpperLimit);
  }, [zoomLowerLimit, zoomUpperLimit]);

  const sliderMarks = useMemo(
    () => [
      {
        value: percentageFromTime(zoomLowerLimit, duration),
        label: secondsToMinutesAndSecondsStr(zoomLowerLimit),
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
        value: percentageFromTime(zoomUpperLimit, duration),
        label: secondsToMinutesAndSecondsStr(zoomUpperLimit),
      },
    ],
    [currentTime, duration, zoomLowerLimit, zoomUpperLimit]
  );

  return (
    <Box sx={{ width: '100%', ...sx }}>
      <Slider
        sx={{
          mx: 2,
          mb: 2,
          '& .MuiSlider-thumb[data-index="0"]': {
            display: loopStartInZoomView ? undefined : 'none',
          },
          '& .MuiSlider-thumb[data-index="1"]': {
            display: loopEndInZoomView ? undefined : 'none',
          },
        }}
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
        value={[
          percentageFromTime(loopStart, duration),
          percentageFromTime(loopEnd, duration),
        ]}
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
