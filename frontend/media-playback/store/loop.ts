import { clamp } from '@util';
import { StateCreator } from 'zustand';
import { PlaybackStateManipulator, PlaybackStore } from '.';
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
  moveLoopStart: (newTime: number) => void;
  moveLoopEnd: (newTime: number) => void;
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
    const prevStart = get().loopStart;
    const prevEnd = get().loopEnd;
    const loopInInitialState = prevStart === 0 && prevEnd === 0;
    const currTime = get().currentTime;
    const loopStart = loopInInitialState ? currTime : 0;
    const loopEnd = loopInInitialState
      ? Math.min(get().duration ?? currTime, currTime + 5)
      : 0;
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
  moveLoopStart: (newTime: number) => {
    set(() => ({
      loopStart: clamp(newTime, 0, get().loopEnd),
    }));
  },
  moveLoopEnd: (newTime: number) => {
    set(() => ({
      loopEnd: clamp(
        newTime,
        get().loopEnd,
        get().duration ?? get().currentTime
      ),
    }));
  },
  ...initialLoopState,
});
