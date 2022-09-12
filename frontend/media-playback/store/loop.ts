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
  resetLoop: () => void;
  setLoopStart: (newTime: number) => void;
  setLoopEnd: (newTime: number) => void;
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
    const currTime = get().currentTime;
    const loopStart = loopInInitialState ? currTime : 0;
    const loopEnd = loopInInitialState ? duration : 0;
    console.log('enabling loop');
    set(() => ({ loopActive: true, loopStart, loopEnd }));
  },
  disableLoop: () => {
    console.log('disabling loop');
    set(() => ({ loopActive: false }));
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
  ...initialLoopState,
});
