import { PlaybackStateManipulator } from '.';
import { clamp } from '@util';
import { MediaSessionManipulation } from './media-session';
import { Loop } from './loop';

interface BasicPlaybackState {
  playing: boolean;
  /**
   * The current playback time for the medium that the player should play
   */
  currentTime: number;
  /**
   * The last point in time the user seeked to for the currently playing medium
   */
  lastSeekTime: number | null;
  maxPlaybackRate: number;
  minPlaybackRate: number;
  playbackRate: number;
  /**
   * The total length of the medium
   *
   * May be null while medium is not yet available to player
   */
  duration: number | null;
}

export interface BasicPlaybackActions {
  play: () => void;
  pause: () => void;
  togglePlayPause: () => void;
  increasePlaybackRate: (amount: number) => void;
  decreasePlaybackRate: (amount: number) => void;
  changePlaybackRate: (newPBR: number) => void;
  seekForward: (amount: number) => void;
  seekBackward: (amount: number) => void;
  seekTo: (time: number) => void;
  jumpToStart: () => void;
  setDuration: (newDuration: number) => void;
  setCurrentTime: (newTime: number) => void;
  resetCurrentPlaybackState: () => void;
}

export type BasicPlayback = BasicPlaybackState & BasicPlaybackActions;

const initialMediumPlaybackState: BasicPlaybackState = {
  lastSeekTime: null,
  minPlaybackRate: 0.5,
  maxPlaybackRate: 1,
  currentTime: 0,
  playing: false,
  playbackRate: 1,
  duration: null,
};

export const createBasicPlaybackManipulator: PlaybackStateManipulator<
  BasicPlayback,
  MediaSessionManipulation & Loop
> = (set, get) => ({
  play: () => {
    if (get().loopActive) {
      get().seekTo(get().loopStart);
    }
    set(state => ({ playing: true }));
    get().updateMediaSessionPlaybackState();
  },
  pause: () => {
    set(state => ({ playing: false }));
    get().updateMediaSessionPlaybackState();
  },
  togglePlayPause: () => {
    if (get().playing) {
      get().pause();
    } else {
      get().play();
    }
  },
  jumpToStart: () =>
    set(state => {
      if (!state.duration) return {}; // this should make that action a no-op if duration is not available yet
      get().seekTo(0 + Math.random() * 0.00000001); // making sure "change detection" always trigger by never providing the exact same value
      return {};
    }),
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
    set(state => ({
      lastSeekTime: Math.max(
        0 + 0.000001 * Math.random(),
        state.currentTime - amount
      ),
    })),
  seekForward: (amount: number) =>
    set(state => {
      if (!state.duration) return {}; // this should make that action a no-op if duration is not available yet
      return {
        lastSeekTime:
          Math.min(state.duration, state.currentTime + amount) -
          0.000001 * Math.random(),
      };
    }),
  seekTo: (time: number) =>
    set(state => {
      if (!state.duration) return {}; // this should make that action a no-op if duration is not available yet
      if (time === state.duration) {
        return {
          lastSeekTime: clamp(
            time - Math.random() * 0.00000001,
            0,
            state.duration
          ),
        };
      }
      return {
        lastSeekTime: clamp(
          time + Math.random() * 0.00000001,
          0,
          state.duration
        ),
      };
    }),
  setDuration: (newDuration: number) => set(() => ({ duration: newDuration })),
  setCurrentTime: (newTime: number) => set(() => ({ currentTime: newTime })),
  resetCurrentPlaybackState: () => set(() => initialMediumPlaybackState),
  ...initialMediumPlaybackState,
});
