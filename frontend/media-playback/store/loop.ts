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

export const initialLoopState: LoopState = {
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
    console.log('increasing zoom');
    const {
      newLower: loopZoomViewLowerLimit,
      newUpper: loopZoomViewUpperLimit,
    } = calculateNewLoopZoomViewBorders({
      changeType: 'zoom-in',
      currLower: get().loopZoomViewLowerLimit,
      currUpper: get().loopZoomViewUpperLimit,
      currTime,
    });
    set(state => ({
      loopZoomLevel: state.loopZoomLevel + 1,
      loopZoomViewLowerLimit,
      loopZoomViewUpperLimit,
    }));
  },
  decreaseLoopZoom: () => {
    if (get().loopZoomLevel === 0) {
      console.log('cannot decrease loop zoom; already zoomed out completely!');
      return;
    }
    console.log(
      'restting zoom, as I have no idea how to decrease the zoom (yet)'
    );
    const duration = get().duration;
    if (!duration) {
      console.log('cannot reset zoom; duration not available!');
      return;
    }
    set(state => ({
      loopZoomLevel: 0,
      loopZoomViewLowerLimit: 0,
      loopZoomViewUpperLimit: duration,
    }));
    // console.log('decreasing zoom');
    // const currTime = get().currentTime;
    // const {
    //   newLower: loopZoomViewLowerLimit,
    //   newUpper: loopZoomViewUpperLimit,
    // } = calculateNewLoopZoomViewBorders({
    //   changeType: 'zoom-out',
    //   currLower: get().loopZoomViewLowerLimit,
    //   currUpper: get().loopZoomViewUpperLimit,
    //   currTime,
    // });
    // set(state => ({
    //   loopZoomLevel: state.loopZoomLevel - 1,
    //   loopZoomViewLowerLimit,
    //   loopZoomViewUpperLimit,
    // }));
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
    const newLower = currLower + (currTime - currLower) / 2;
    const newUpper = currUpper - (currUpper - currTime) / 2;
    console.log('computing new loop zoom view borders for zooming in');
    console.log('old', currLower, currUpper);
    console.log('new', newLower, newUpper);
    return { newLower, newUpper };
  } else {
    // TODO: figure that out
    const newLower = 1 / (currLower + (currTime - currLower) / 2);
    const newUpper = 1 / (currUpper - (currTime + currUpper) / 2);
    console.log('computing new loop zoom view borders for zooming out');
    console.log('old', currLower, currUpper);
    console.log('new', newLower, newUpper);
    return { newLower, newUpper };
  }
}
