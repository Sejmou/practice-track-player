import create from 'zustand';
import { clamp } from '@util';

export interface PlaybackState {
  playing: boolean;
  currentTime: number;
  lastSeekTime: number;
  maxPlaybackRate: number;
  minPlaybackRate: number;
  playbackRate: number;
  duration: number;
  loading: boolean;
}

export interface PlaybackActions {
  play: () => void;
  pause: () => void;
  togglePlayPause: () => void;
  increasePlaybackRate: (amount: number) => void;
  decreasePlaybackRate: (amount: number) => void;
  changePlaybackRate: (newPBR: number) => void;
  // next: () => void;
  // previous: () => void;
  seekForward: (amount: number) => void;
  seekBackward: (amount: number) => void;
  seekTo: (time: number) => void;
  setLoading: (newVal: boolean) => void;
  setDuration: (newDuration: number) => void;
  setCurrentTime: (newTime: number) => void;
}

type CurrentMediumPlaybackStore = PlaybackState & PlaybackActions;

export const usePlaybackStore = create<CurrentMediumPlaybackStore>(set => ({
  play: () =>
    set(() => {
      if (navigator?.mediaSession?.playbackState) {
        navigator.mediaSession.playbackState = 'playing';
      }
      return { playing: true };
    }),
  pause: () =>
    set(() => {
      if (navigator?.mediaSession?.playbackState) {
        navigator.mediaSession.playbackState = 'paused';
      }
      return { playing: false };
    }),
  togglePlayPause: () => set(state => ({ playing: !state.playing })),
  changePlaybackRate: (newPBR: number) =>
    set(state => ({
      playbackRate: clamp(newPBR, state.minPlaybackRate, state.maxPlaybackRate),
    })),
  increasePlaybackRate: (amount: number) =>
    set(state => ({
      playbackRate: Math.min(
        state.playbackRate + amount,
        state.maxPlaybackRate
      ),
    })),
  decreasePlaybackRate: (amount: number) =>
    set(state => ({
      playbackRate: Math.max(
        state.playbackRate - amount,
        state.minPlaybackRate
      ),
    })),
  seekBackward: (amount: number) =>
    set(state => ({ currentTime: Math.max(0, state.currentTime - amount) })),
  seekForward: (amount: number) =>
    set(state => ({
      currentTime: Math.min(state.duration, state.currentTime + amount),
    })),
  seekTo: (time: number) =>
    set(state => ({ currentTime: clamp(time, 0, state.duration) })),
  setLoading: (newVal: boolean) => set(() => ({ loading: newVal })),
  setDuration: (newDuration: number) => set(() => ({ duration: newDuration })),
  setCurrentTime: (newTime: number) => set(() => ({ currentTime: newTime })),
  lastSeekTime: 0,
  minPlaybackRate: 0.5,
  maxPlaybackRate: 1,
  currentTime: 0,
  playing: false,
  playbackRate: 1,
  duration: 0,
  loading: true,
}));
