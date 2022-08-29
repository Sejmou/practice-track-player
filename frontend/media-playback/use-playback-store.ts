import create, { StateCreator } from 'zustand';
import { clamp } from '@util';
import { YouTubePlaylistVideoData, YouTubeVideoData } from '@models';

interface CurrentMediumPlaybackState {
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

interface CurrentMediumPlaybackActions {
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

type CurrentMediumPlaybackSlice = CurrentMediumPlaybackState &
  CurrentMediumPlaybackActions;

const initialMediumPlaybackState: CurrentMediumPlaybackState = {
  lastSeekTime: null,
  minPlaybackRate: 0.5,
  maxPlaybackRate: 1,
  currentTime: 0,
  playing: false,
  playbackRate: 1,
  duration: null,
};

const createCurrentMediumPlaybackSlice: StateCreator<
  CurrentMediumPlaybackSlice & MediaElementsSlice<any>,
  [],
  [],
  CurrentMediumPlaybackSlice
> = (set, get) => ({
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
  jumpToStart: () =>
    set(state => {
      if (!state.duration) return {}; // this should make that action a no-op if duration is not available yet
      get().seekTo(0 + Math.random() * 0.00000001); // making sure "change detection" always trigger by never providing the exact same value
      return {};
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
      return {
        lastSeekTime: clamp(time, 0, state.duration),
      };
    }),
  setDuration: (newDuration: number) => set(() => ({ duration: newDuration })),
  setCurrentTime: (newTime: number) => set(() => ({ currentTime: newTime })),
  resetCurrentPlaybackState: () => set(() => initialMediumPlaybackState),
  ...initialMediumPlaybackState,
});

interface MediaElementsActions<T> {
  switchTo: (newIdx: number) => void;
  next: () => void;
  previous: () => void;
  initialize: (mediaElements: T[], startIdx: number) => void;
  reset: () => void;
}

export type PlaybackActions<T = any> = CurrentMediumPlaybackActions &
  MediaElementsActions<T>;

interface MediaElementsState<T> {
  currIdx: number;
  mediaElements: T[];
  initialized: boolean;
}

type MediaElementsSlice<T> = MediaElementsActions<T> & MediaElementsState<T>;

interface RemoteMediaData {
  url: string;
  contentType?: string;
}

const createMediaElementsSlice: StateCreator<
  CurrentMediumPlaybackSlice & MediaElementsSlice<any>,
  [],
  [],
  MediaElementsSlice<any>
> = (set, get) => ({
  switchTo: (newIdx: number) =>
    set(state => {
      if (state.currIdx === null || !state.mediaElements[newIdx]) return {};
      get().resetCurrentPlaybackState(); // apparently this is a sensible approach for side-effects in zustand: https://github.com/pmndrs/zustand/discussions/307
      return { currIdx: newIdx };
    }),
  next: () =>
    set(state => {
      if (state.currIdx === null || !state.mediaElements[state.currIdx + 1])
        return {};
      return {
        currIdx: state.currIdx + 1,
        lastSeekTime: null,
      };
    }),
  previous: () =>
    set(state => {
      if (state.currIdx === null || !state.mediaElements[state.currIdx - 1])
        return {};
      if (state.currentTime > 2.5) {
        get().jumpToStart();
        return {};
      }
      return {
        currIdx: state.currIdx - 1,
        lastSeekTime: null,
      };
    }),
  initialize: (mediaElements: any[], startIdx: number) =>
    set(() => {
      if (
        startIdx < 0 ||
        mediaElements.length === 0 ||
        !mediaElements[startIdx]
      ) {
        console.warn(
          'Invalid startIdx',
          startIdx,
          'for provided media elements',
          mediaElements
        );
        return {};
      }
      return {
        mediaElements,
        currIdx: startIdx,
        initialized: true,
      };
    }),
  reset: () =>
    set(() => {
      get().resetCurrentPlaybackState();
      return {
        initialized: false,
        currIdx: -1,
        mediaElements: [],
      };
    }),
  initialized: false,
  currIdx: -1,
  mediaElements: [],
});

type YouTubeStore = CurrentMediumPlaybackSlice &
  MediaElementsSlice<YouTubeVideoData | YouTubePlaylistVideoData>;

export const useYouTubeStore = create<YouTubeStore>()((...a) => ({
  ...createCurrentMediumPlaybackSlice(...a),
  ...createMediaElementsSlice(...a),
}));
