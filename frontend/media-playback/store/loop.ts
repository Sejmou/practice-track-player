import { clamp } from '@util';
import { PlaybackStateManipulator } from '.';
import { BasicPlayback } from './basic';

interface LoopState {
  loopActive: boolean;
  loopStart: number;
  loopEnd: number;
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
}

export type Loop = LoopState & LoopActions;

const initialLoopState: LoopState = {
  loopActive: false,
  loopStart: 0,
  loopEnd: 0,
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
      set(() => ({ loopActive: true, loopStart: currTime, loopEnd: duration }));
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
  ...initialLoopState,
});
