import create from 'zustand';
import { subscribeWithSelector, devtools } from 'zustand/middleware';
import {
  BasicPlayback,
  BasicPlaybackActions,
  createBasicPlaybackManipulator,
} from './basic';
import {
  MediaSwitching,
  createMediaSwitcher,
  MediaSwitchingActions,
} from './media-switching';
import {
  createMediaSessionManipulator,
  MediaSessionActions,
  MediaSessionManipulation,
} from './media-session';
import { createLoopManipulator, Loop, LoopActions } from './loop';

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

export type PlaybackActions = BasicPlaybackActions &
  LoopActions &
  MediaSessionActions &
  MediaSwitchingActions;
