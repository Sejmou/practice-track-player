import { clamp } from '@util';
import { PlaybackStateManipulator } from '.';
import { BasicPlayback } from './basic';

interface LoopState {
  loopActive: boolean;
  loopStart: number;
  loopEnd: number;
  loopZoomLevel: number;
  loopZoomViewLowerLimit: number;
  loopZoomViewUpperLimit: number;
}

export interface LoopActions {
  enableLoop: () => void;
  disableLoop: () => void;
  toggleLoop: () => void;
  resetLoop: () => void;
  setLoopStart: (newTime: number) => void;
  setLoopEnd: (newTime: number) => void;
  setLoopStartToCurrent: () => void;
  setLoopEndToCurrent: () => void;
  increaseLoopZoom: () => void;
  decreaseLoopZoom: () => void;
  resetLoopZoom: () => void;
}

export type Loop = LoopState & LoopActions;

const initialLoopState: LoopState = {
  loopActive: false,
  loopStart: 0,
  loopEnd: 0,
  loopZoomLevel: 0,
  loopZoomViewLowerLimit: 0,
  loopZoomViewUpperLimit: 0,
};

export const createLoopManipulator: PlaybackStateManipulator<
  Loop,
  BasicPlayback
> = (set, get) => ({
  enableLoop: () => {
    const duration = get().duration;
    if (!duration) return;
    const prevStart = get().loopStart;
    const prevEnd = get().loopEnd;
    const loopInInitialState = prevStart === 0 && prevEnd === 0;
    if (loopInInitialState) {
      const currTime = get().currentTime;
      console.log(
        'first time setting loop start and end; initializing with current time and duration:',
        currTime,
        duration
      );
      set(() => ({
        loopActive: true,
        loopStart: currTime,
        loopEnd: duration,
        loopZoomViewLowerLimit: 0,
        loopZoomViewUpperLimit: duration,
        zoomLevel: 0,
      }));
    }
    set(() => ({ loopActive: true }));
  },
  disableLoop: () => {
    console.log('disabling loop');
    set(() => ({ loopActive: false }));
  },
  toggleLoop: () => {
    if (get().loopActive) {
      get().disableLoop();
    } else {
      get().enableLoop();
    }
  },
  resetLoop: () => {
    set(() => initialLoopState);
  },
  setLoopStart: (newTime: number) => {
    const loopStart = clamp(newTime, 0, get().loopEnd);
    set(() => ({
      loopStart,
    }));
    get().seekTo(loopStart);
  },
  setLoopEnd: (newTime: number) => {
    set(() => ({
      loopEnd: clamp(
        newTime,
        get().loopStart,
        get().duration ?? get().currentTime
      ),
    }));
  },
  setLoopStartToCurrent: () => {
    set(() => ({
      loopStart: get().currentTime,
    }));
  },
  setLoopEndToCurrent: () => {
    set(() => ({
      loopEnd: get().currentTime,
    }));
  },
  increaseLoopZoom: () => {
    const currTime = get().currentTime;
    set(state => ({
      loopZoomLevel: state.loopZoomLevel + 1,
      ...calculateNewLoopZoomViewBorders({
        changeType: 'zoom-in',
        currLower: state.loopZoomViewLowerLimit,
        currUpper: state.loopZoomViewUpperLimit,
        currTime,
      }),
    }));
  },
  decreaseLoopZoom: () => {
    const currTime = get().currentTime;
    set(state => ({
      loopZoomLevel:
        state.loopZoomLevel > 0 ? state.loopZoomLevel - 1 : state.loopZoomLevel,
      ...calculateNewLoopZoomViewBorders({
        changeType: 'zoom-out',
        currLower: state.loopZoomViewLowerLimit,
        currUpper: state.loopZoomViewUpperLimit,
        currTime,
      }),
    }));
  },
  resetLoopZoom: () => {
    set(() => ({ loopZoomLevel: 0 }));
  },
  ...initialLoopState,
});

function calculateNewLoopZoomViewBorders(data: {
  changeType: 'zoom-in' | 'zoom-out';
  currLower: number;
  currTime: number;
  currUpper: number;
}) {
  const { changeType, currLower, currTime, currUpper } = data;
  if (changeType === 'zoom-in') {
    const loopViewLowerLimit = currLower + (currTime - currLower) / 2;
    const loopViewUpperLimit = currUpper - (currTime + currUpper) / 2;
    return { loopViewLowerLimit, loopViewUpperLimit };
  } else if (changeType === 'zoom-out') {
    const loopViewLowerLimit = currLower + (currTime - currLower) * 2;
    const loopViewUpperLimit = currUpper - (currTime + currUpper) * 2;
    return { loopViewLowerLimit, loopViewUpperLimit };
  }
}
