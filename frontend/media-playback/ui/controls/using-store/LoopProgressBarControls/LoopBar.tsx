import { usePlaybackStore } from '@frontend/media-playback/store';
import { Slider, SxProps } from '@mui/material';
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

  const handleChange = (_: Event, newValue: number | number[]) => {
    const [start, end] = (newValue as number[]).map(num =>
      percentageToTime(num, duration)
    );
    if (end === 0) return;
    setLoopStart(start);
    setLoopEnd(end);
  };

  return (
    <Slider
      sx={sx}
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
      onChange={handleChange}
      size="small"
    />
  );
};
export default LoopBar;

function percentageFromTime(time: number, duration: number | null) {
  return (time / (duration ?? 1)) * 100;
}

function percentageToTime(perc: number, duration: number | null) {
  return (perc / 100) * (duration ?? 1);
}
