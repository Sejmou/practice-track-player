import { StateCreator } from 'zustand';
import { PlaybackStore } from '.';

export interface MediaElementsActions<T> {
  switchTo: (newIdx: number) => void;
  next: () => void;
  previous: () => void;
  initialize: (mediaElements: T[], startIdx: number) => void;
  reset: () => void;
}

interface MediaElementsState<T> {
  currIdx: number;
  mediaElements: T[];
  initialized: boolean;
}

export type MediaElementsSlice<T> = MediaElementsActions<T> &
  MediaElementsState<T>;

export const createMediaElementsSlice: StateCreator<
  PlaybackStore,
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
      get().addCustomMediaSessionData();
      return {
        mediaElements,
        currIdx: startIdx,
        initialized: true,
      };
    }),
  reset: () =>
    set(() => {
      get().resetCurrentPlaybackState();
      get().removeCustomMediaSessionData();
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
