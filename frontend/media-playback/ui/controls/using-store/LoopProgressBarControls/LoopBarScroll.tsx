import { Box, SxProps } from '@mui/material';
import { useEffect, useMemo, useRef } from 'react';
import { usePlaybackStore } from '@frontend/media-playback/store';

type Props = { sx?: SxProps };
const LoopBarScroll = ({ sx }: Props) => {
  const containerRef = useRef<HTMLDivElement>();

  const zoomLowerLimit = usePlaybackStore(
    store => store.loopZoomViewLowerLimit
  );
  const zoomUpperLimit = usePlaybackStore(
    store => store.loopZoomViewUpperLimit
  );
  const duration = usePlaybackStore(store => store.duration);
  const setZoomViewScroll = usePlaybackStore(
    store => store.setLoopZoomViewScroll
  );

  const scrollContainerWidth = useMemo(() => {
    // return the required width for the empty "scroll container container"
    // we set the container to exactly the "correct" width to create the horizontal scrollbar
    // that can be used by the user to scroll through the timeline of the currently playing medium
    // this scrollbar container calculation is only necessary if the user has zoomed into the timeline in the loop view
    if (!duration) return 0;
    const parentContainerWidth = containerRef.current?.offsetWidth || 0;
    const zoomTimeIntervalSize = zoomUpperLimit - zoomLowerLimit;
    const totalTimeIntervalSize = duration;
    const scrollContainerWidth =
      (totalTimeIntervalSize / zoomTimeIntervalSize) * parentContainerWidth;
    return scrollContainerWidth;
  }, [duration, zoomLowerLimit, zoomUpperLimit]);

  useEffect(() => {
    // if the zoom level changes, the zoom limits may also change, which also means that the scroll bar needs to move
    if (!duration) return;
    const scroll = zoomLowerLimit / duration;
    console.log('new scroll % (LoopBarScroll useEffect)', scroll);
    containerRef.current?.scrollTo({ left: scrollContainerWidth * scroll });
  }, [zoomLowerLimit, duration, scrollContainerWidth]);

  return (
    <Box
      ref={containerRef}
      sx={{ ...sx, width: '100%', overflowX: 'auto' }}
      onScroll={() => {
        const containerWidth = containerRef.current?.offsetWidth;
        if (!containerWidth) return;
        const scrollPercentage =
          (containerRef.current?.scrollLeft || 0) / scrollContainerWidth;
        console.log('scroll % (LoopBarScroll onScroll)', scrollPercentage);
        setZoomViewScroll(scrollPercentage);
      }}
    >
      <Box sx={{ width: scrollContainerWidth, height: '1px' }}></Box>
    </Box>
  );
};
export default LoopBarScroll;
