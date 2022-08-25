import create from 'zustand';
import { clamp } from '@util';

export interface PlaybackState {
  playing: boolean;
  /**
   * The current playback time for the medium that is loaded
   *
   * Value is meaningless while mediumLoaded is false
   */
  currentTime: number;
  lastSeekTime: number | null;
  maxPlaybackRate: number;
  minPlaybackRate: number;
  playbackRate: number;
  /**
   * The total length of the medium that is loaded
   *
   * Value is meaningless while mediumLoaded is false
   */
  duration: number;
  /**
   * Becomes true once the current medium (e.g. audio file or YouTube video) to be played has actually loaded.
   *
   * Only if this is true, current time and duration have meaningful values!
   *
   * For instance, this value should remain false while a YouTube player only displays the thumbnail of a video,
   * but video playback has not started yet as some of the actual video information (i.e. length) has not
   * been loaded by the player at all at this point.
   */
  mediumLoaded: boolean;
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
  setMediumLoaded: (newVal: boolean) => void;
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
  setMediumLoaded: (newVal: boolean) => set(() => ({ mediumLoaded: newVal })),
  setDuration: (newDuration: number) => set(() => ({ duration: newDuration })),
  setCurrentTime: (newTime: number) => set(() => ({ currentTime: newTime })),
  lastSeekTime: null,
  minPlaybackRate: 0.5,
  maxPlaybackRate: 1,
  currentTime: 0,
  playing: false,
  playbackRate: 1,
  duration: 1,
  mediumLoaded: true,
}));
