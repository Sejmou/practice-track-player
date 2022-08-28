import create from 'zustand';
import { clamp } from '@util';
import { produce } from 'immer';

interface RemoteMediaElementData {
  url: string;
  contentType?: string;
}

interface MediaElementPlaybackData {
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

type CurrentMediaElementPlaybackData = MediaElementPlaybackData &
  Partial<RemoteMediaElementData>;

export interface PlaybackState {
  currentElementData: CurrentMediaElementPlaybackData;
  mediaElements: RemoteMediaElementData[];
}

export interface PlaybackActions {
  play: () => void;
  pause: () => void;
  togglePlayPause: () => void;
  increasePlaybackRate: (amount: number) => void;
  decreasePlaybackRate: (amount: number) => void;
  changePlaybackRate: (newPBR: number) => void;
  changeCurrentMediaElement: (newIdx: number) => void;
  next: () => void;
  previous: () => void;
  initialize: (
    mediaElementData: RemoteMediaElementData[],
    startIdx: number
  ) => void;
  seekForward: (amount: number) => void;
  seekBackward: (amount: number) => void;
  seekTo: (time: number) => void;
  jumpToEnd: () => void;
  setDuration: (newDuration: number) => void;
  setCurrentTime: (newTime: number) => void;
  reset: () => void;
}

type PlaybackStore = PlaybackState & PlaybackActions;

const initialCurrentElementPlaybackState: CurrentMediaElementPlaybackData = {
  lastSeekTime: null,
  minPlaybackRate: 0.5,
  maxPlaybackRate: 1,
  currentTime: 0,
  playing: false,
  playbackRate: 1,
  duration: null,
  url: undefined,
  contentType: undefined,
};

export const usePlaybackStore = create<PlaybackStore>((set, get) => ({
  play: () =>
    set(
      produce((state: PlaybackState) => {
        if (navigator?.mediaSession?.playbackState) {
          navigator.mediaSession.playbackState = 'playing';
        }
        state.currentElementData.playing = true;
      })
    ),
  pause: () =>
    set(
      produce((state: PlaybackState) => {
        if (navigator?.mediaSession?.playbackState) {
          navigator.mediaSession.playbackState = 'paused';
        }
        state.currentElementData.playing = false;
      })
    ),
  jumpToEnd: () =>
    set(
      produce(state => {
        if (!state.currentElementData.duration) return; // this should make that action a no-op if duration is not available yet
        state.currentElementData.playing = false;
        state.currentElementData.currentTime =
          state.currentElementData.duration;
      })
    ),
  togglePlayPause: () =>
    set(
      produce((state: PlaybackState) => {
        state.currentElementData.playing = !state.currentElementData.playing;
      })
    ),
  changePlaybackRate: (newPBR: number) =>
    set(
      produce((state: PlaybackState) => {
        state.currentElementData.playbackRate = clamp(
          newPBR,
          state.currentElementData.minPlaybackRate,
          state.currentElementData.maxPlaybackRate
        );
      })
    ),
  increasePlaybackRate: (amount: number) =>
    set(
      produce((state: PlaybackState) => {
        state.currentElementData.playbackRate = Math.min(
          state.currentElementData.playbackRate + amount,
          state.currentElementData.maxPlaybackRate
        );
      })
    ),
  decreasePlaybackRate: (amount: number) =>
    set(
      produce((state: PlaybackState) => {
        state.currentElementData.playbackRate = Math.max(
          state.currentElementData.playbackRate - amount,
          state.currentElementData.minPlaybackRate
        );
      })
    ),
  seekBackward: (amount: number) =>
    set(
      produce((state: PlaybackState) => {
        state.currentElementData.lastSeekTime = Math.max(
          0 + 0.000001 * Math.random(),
          state.currentElementData.currentTime - amount
        );
      })
    ),
  seekForward: (amount: number) =>
    set(
      produce((state: PlaybackState) => {
        if (!state.currentElementData.duration) return; // this should make that action a no-op if duration is not available yet
        state.currentElementData.lastSeekTime =
          Math.min(
            state.currentElementData.duration,
            state.currentElementData.currentTime + amount
          ) -
          0.000001 * Math.random();
      })
    ),
  seekTo: (time: number) =>
    set(
      produce((state: PlaybackState) => {
        if (!state.currentElementData.duration) return; // this should make that action a no-op if duration is not available yet
        state.currentElementData.lastSeekTime = clamp(
          time,
          0,
          state.currentElementData.duration
        );
      })
    ),
  setDuration: (newDuration: number) =>
    set(
      produce((state: PlaybackState) => {
        state.currentElementData.duration = newDuration;
      })
    ),
  setCurrentTime: (newTime: number) =>
    set(
      produce((state: PlaybackState) => {
        state.currentElementData.currentTime = newTime;
      })
    ),
  next: () =>
    set(
      produce((state: PlaybackState) => {
        const currentUrl = state.currentElementData.url;
        if (!currentUrl) return;
        const currentIdx = state.mediaElements.findIndex(
          el => el.url === currentUrl
        );
        if (currentIdx === -1) return;
        const next = state.mediaElements[currentIdx + 1];
        if (!next) return;
        state.currentElementData.url = next.url;
        state.currentElementData.contentType = next.contentType;
      })
    ),
  previous: () =>
    set(
      produce((state: PlaybackState) => {
        const currentUrl = state.currentElementData.url;
        if (!currentUrl) return;
        const currentIdx = state.mediaElements.findIndex(
          el => el.url === currentUrl
        );
        if (currentIdx === -1) return;
        const previous = state.mediaElements[currentIdx - 1];
        if (!previous) return;
        state.currentElementData.url = previous.url;
        state.currentElementData.contentType = previous.contentType;
      })
    ),
  changeCurrentMediaElement: (newIdx: number) =>
    set(state => {
      if (!state.mediaElements[newIdx]) return {};
      return {
        currentElementData: {
          ...initialCurrentElementPlaybackState,
          url: state.mediaElements[newIdx].url,
          contentType: state.mediaElements[newIdx].contentType,
        },
      };
    }),
  initialize: (mediaElements: RemoteMediaElementData[], startIdx: number) =>
    set(() => {
      if (!mediaElements[startIdx]) return {};
      return {
        currentElementData: {
          ...initialCurrentElementPlaybackState,
          url: mediaElements[startIdx].url,
          contentType: mediaElements[startIdx].contentType,
        },
        mediaElements,
      };
    }),
  reset: () =>
    set(() => ({
      currentElementData: initialCurrentElementPlaybackState,
      mediaElements: [],
    })),
  currentElementData: initialCurrentElementPlaybackState,
  mediaElements: [],
}));
