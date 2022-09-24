import { clamp } from '@util';
import { PlaybackStateManipulator } from '.';
import { BasicPlayback } from './basic';

interface LoopState {
  loopActive: boolean;
  loopStart: number;
  loopEnd: number;
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
  setLoopZoomViewScroll: (percentage: number) => void;
}

export type Loop = LoopState & LoopActions;

export const initialLoopState: LoopState = {
  loopActive: false,
  loopStart: 0,
  loopEnd: 0,
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
      }));
    }
    set(() => ({ loopActive: true }));
  },
  disableLoop: () => {
    console.log('disabling loop');
    set(() => ({ loopActive: false }));
    get().resetLoopZoom();
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
    const duration = get().duration;
    if (!duration) {
      console.log('cannot increase zoom; duration not available!');
      return;
    }
    console.log('increasing zoom');
    const {
      newLower: loopZoomViewLowerLimit,
      newUpper: loopZoomViewUpperLimit,
    } = calculateNewLoopZoomViewBorders({
      changeType: 'zoom-in',
      currLower: get().loopZoomViewLowerLimit,
      currUpper: get().loopZoomViewUpperLimit,
      currTime,
      duration,
    });
    set(() => ({
      loopZoomViewLowerLimit,
      loopZoomViewUpperLimit,
    }));
  },
  decreaseLoopZoom: () => {
    if (
      get().loopZoomViewLowerLimit === 0 &&
      get().loopZoomViewUpperLimit === get().duration
    ) {
      console.log('cannot decrease loop zoom; already zoomed out completely!');
      return;
    }
    const currTime = get().currentTime;
    const duration = get().duration;
    if (!duration) {
      console.log('cannot reset zoom; duration not available!');
      return;
    }
    console.log('decreasing zoom');
    const {
      newLower: loopZoomViewLowerLimit,
      newUpper: loopZoomViewUpperLimit,
    } = calculateNewLoopZoomViewBorders({
      changeType: 'zoom-out',
      currLower: get().loopZoomViewLowerLimit,
      currUpper: get().loopZoomViewUpperLimit,
      currTime,
      duration,
    });
    set(() => ({
      loopZoomViewLowerLimit,
      loopZoomViewUpperLimit,
    }));
  },
  resetLoopZoom: () => {
    const duration = get().duration;
    if (!duration) {
      console.log('cannot reset zoom; duration not available!');
      return;
    }
    set(() => ({
      loopZoomViewLowerLimit: 0,
      loopZoomViewUpperLimit: duration,
    }));
  },
  setLoopZoomViewScroll: (percentage: number) => {
    const duration = get().duration;
    if (!duration) {
      console.error('cannot set zoom view scroll, duration not avaiable!');
      return;
    }
    const zoomLowerLimit = get().loopZoomViewLowerLimit;
    const zoomUpperLimit = get().loopZoomViewUpperLimit;
    const zoomTimeInterval = zoomUpperLimit - zoomLowerLimit;
    const min = 0;
    const max = (duration - zoomTimeInterval) / duration;
    const newScrollPercentage = clamp(percentage, min, max);
    console.log('new scroll percentage', newScrollPercentage);
    const newZoomLower = newScrollPercentage * duration;
    const newZoomUpper = zoomTimeInterval + newScrollPercentage * duration;
    console.log('new zoom view limits', newZoomLower, newZoomUpper);
    set(() => ({
      loopZoomViewLowerLimit: newZoomLower,
      loopZoomViewUpperLimit: newZoomUpper,
    }));
  },
  ...initialLoopState,
});

function calculateNewLoopZoomViewBorders(data: {
  changeType: 'zoom-in' | 'zoom-out';
  currLower: number;
  currTime: number;
  currUpper: number;
  duration: number;
}) {
  const { changeType, currLower, currTime, currUpper, duration } = data;
  if (changeType === 'zoom-in') {
    console.log('computing new loop zoom view borders for zooming in');
    const newLower = currLower + (currTime - currLower) / 2;
    const newUpper = currUpper - (currUpper - currTime) / 2;
    console.log('old', currLower, currUpper);
    console.log('new', newLower, newUpper);
    return { newLower, newUpper };
  } else {
    console.log('computing new loop zoom view borders for zooming out');
    const currTimeInView = currTime >= currLower && currTime <= currUpper;
    const currZoomTimeInterval = currUpper - currLower;
    const newLower = Math.max(
      currLower -
        (currTimeInView ? currTime - currLower : currZoomTimeInterval),
      0
    );
    const newUpper = Math.min(
      currUpper +
        (currTimeInView ? currTime + currUpper : currZoomTimeInterval),
      duration
    );
    console.log('old', currLower, currUpper);
    console.log('new', newLower, newUpper);
    return { newLower, newUpper };
  }
}
