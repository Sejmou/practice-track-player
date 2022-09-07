import create from 'zustand';
import { subscribeWithSelector, devtools } from 'zustand/middleware';
import { BasicPlayback, createBasicPlaybackManipulator } from './basic';
import { MediaSwitching, createMediaSwitcher } from './media-switching';
import {
  createMediaSessionManipulator,
  MediaSessionManipulation,
} from './media-session';
import { createLoopManipulator, Loop } from './loop';

export type PlaybackStore = BasicPlayback &
  Loop &
  MediaSwitching &
  MediaSessionManipulation;

export const usePlaybackStore = create<PlaybackStore>()(
  devtools(
    subscribeWithSelector((set, get) => ({
      ...createBasicPlaybackManipulator(set, get),
      ...createLoopManipulator(set, get),
      ...createMediaSessionManipulator(set, get),
      ...createMediaSwitcher(set, get),
    })),
    {
      name: 'YouTubePlayerStore',
    }
  )
);
type PlaybackStatePart =
  | BasicPlayback
  | Loop
  | MediaSwitching
  | MediaSessionManipulation;

export type PlaybackStateManipulator<
  T extends PlaybackStatePart,
  AdditionalManipulatedState extends PlaybackStatePart = PlaybackStatePart
> = (
  set: <
    A extends
      | string
      | {
          type: unknown;
        }
  >(
    partial:
      | PlaybackStore
      | Partial<PlaybackStore>
      | ((state: PlaybackStore) => PlaybackStore | Partial<PlaybackStore>),
    replace?: boolean | undefined,
    action?: A | undefined
  ) => void,
  get: () => T & AdditionalManipulatedState
) => T;
