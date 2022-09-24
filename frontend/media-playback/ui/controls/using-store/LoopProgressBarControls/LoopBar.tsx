import { Box, Slider, SxProps, Typography, Stack } from '@mui/material';
import { useCallback, useEffect, useMemo } from 'react';
import { usePlaybackStore } from '@frontend/media-playback/store';
import { secondsToMinutesAndSecondsStr } from '@frontend/media-playback/ui/format-time';

type Props = {
  sx?: SxProps;
};

const LoopBar = ({ sx }: Props) => {
  const loopStart = usePlaybackStore(state => state.loopStart);
  const setLoopStart = usePlaybackStore(state => state.setLoopStart);
  const loopEnd = usePlaybackStore(state => state.loopEnd);
  const setLoopEnd = usePlaybackStore(state => state.setLoopEnd);

  const currentTime = usePlaybackStore(state => state.currentTime);
  const zoomLowerLimit = usePlaybackStore(
    store => store.loopZoomViewLowerLimit
  );
  const zoomUpperLimit = usePlaybackStore(
    store => store.loopZoomViewUpperLimit
  );

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
      const [start, end] = (newValue as number[]).map(
        num =>
          percentageToTime(num, zoomUpperLimit - zoomLowerLimit) +
          zoomLowerLimit
      );
      if (end === 0) return;
      if (loopStartInZoomView && start !== loopStart) setLoopStart(start);
      if (loopEndInZoomView && end !== loopEnd) setLoopEnd(end);
    },
    [
      loopStartInZoomView,
      loopStart,
      setLoopStart,
      loopEndInZoomView,
      loopEnd,
      setLoopEnd,
      zoomUpperLimit,
      zoomLowerLimit,
    ]
  );

  useEffect(() => {
    console.log('zoom view limits', zoomLowerLimit, zoomUpperLimit);
  }, [zoomLowerLimit, zoomUpperLimit]);

  // TODO: investigate the weird rendering issues that caused me to just use those almost exact but unique integers as a workaround
  // got the "Encountered Two Children with the Same Key" error beforehand (probably has something to do with internal implementation of slider markers)
  const sliderMarks = useMemo(
    () => [
      {
        value: 0.0000000001,
        label: secondsToMinutesAndSecondsStr(zoomLowerLimit),
      },
      {
        value:
          currentTime < zoomLowerLimit
            ? 0 + 0.000000000000001
            : currentTime > zoomUpperLimit
            ? 100 - 0.000000000000001
            : percentageFromTime(
                currentTime - zoomLowerLimit,
                zoomUpperLimit - zoomLowerLimit
              ),
        label: (
          <Stack sx={{ mt: -5, alignItems: 'center' }}>
            {/* <Typography variant="caption" sx={{ mb: -1 }}>
              current:
            </Typography> */}
            <Typography variant="caption">
              {currentTime < zoomLowerLimit && '<< '}
              {(currentTime < zoomLowerLimit || currentTime > zoomUpperLimit) &&
                'current: '}
              {secondsToMinutesAndSecondsStr(currentTime)}
              {currentTime > zoomUpperLimit && ' >>'}
            </Typography>
          </Stack>
        ),
      },
      {
        value: 100 - 0.0000001,
        label: secondsToMinutesAndSecondsStr(zoomUpperLimit),
      },
    ],
    [currentTime, zoomLowerLimit, zoomUpperLimit]
  );

  const formatSliderValue = useCallback(
    (percValue: number) =>
      secondsToMinutesAndSecondsStr(
        percentageToTime(percValue, zoomUpperLimit - zoomLowerLimit) +
          zoomLowerLimit
      ),
    [zoomLowerLimit, zoomUpperLimit]
  );

  return (
    <Box sx={{ width: '100%', ...sx }}>
      <Slider
        sx={{
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
          percentageFromTime(
            loopStart - zoomLowerLimit,
            zoomUpperLimit - zoomLowerLimit
          ),
          percentageFromTime(
            loopEnd - zoomLowerLimit,
            zoomUpperLimit - zoomLowerLimit
          ),
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

function percentageFromTime(time: number, maxTimeValue: number | null) {
  return (time / (maxTimeValue ?? 1)) * 100;
}

function percentageToTime(perc: number, maxTimeValue: number | null) {
  return (perc / 100) * (maxTimeValue ?? 1);
}
