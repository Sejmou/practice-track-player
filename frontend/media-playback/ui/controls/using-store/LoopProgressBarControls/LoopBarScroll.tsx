import { Box, SxProps } from '@mui/material';
import { useMemo, useRef } from 'react';
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
    if (!duration) return 0;
    const parentContainerWidth = containerRef.current?.offsetWidth || 0;
    console.log('parent width', parentContainerWidth);
    const zoomTimeIntervalSize = zoomUpperLimit - zoomLowerLimit;
    const totalTimeIntervalSize = duration;
    const scrollContainerWidth =
      (totalTimeIntervalSize / zoomTimeIntervalSize) * parentContainerWidth;
    console.log('scroll container width', scrollContainerWidth);
    return scrollContainerWidth;
  }, [duration, zoomLowerLimit, zoomUpperLimit]);

  return (
    <Box
      ref={containerRef}
      sx={{ ...sx, width: '100%', overflowX: 'auto' }}
      onScroll={ev => {
        console.log(ev);
        console.log('native', ev.nativeEvent);
        const containerWidth = containerRef.current?.offsetWidth;
        if (!containerWidth) return;
        console.log('container width', containerWidth);
        console.log('scroll left', containerRef.current?.scrollLeft);
        const scrollPercentage =
          (containerRef.current?.scrollLeft || 0) / scrollContainerWidth;
        console.log('current scroll percent', scrollPercentage);
        setZoomViewScroll(scrollPercentage);
      }}
    >
      <Box sx={{ width: scrollContainerWidth, height: '1px' }}></Box>
    </Box>
  );
};
export default LoopBarScroll;
