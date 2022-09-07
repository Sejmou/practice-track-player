import create from 'zustand';
import { subscribeWithSelector, devtools } from 'zustand/middleware';
import {
  BasicPlaybackActions,
  BasicPlayback,
  createBasicPlaybackManipulator,
} from './basic';
import {
  MediaSwitchingActions,
  MediaSwitching,
  createMediaSwitcher,
} from './media-switching';
import {
  createMediaSessionManipulator,
  MediaSessionManipulation,
} from './media-session';
import { YouTubeVideoData, YouTubePlaylistVideoData } from '@models';
import { createLoopManipulator, Loop } from './loop';

export type PlaybackStore<T = any> = BasicPlayback &
  Loop &
  MediaSwitching<T> &
  MediaSessionManipulation;

type YouTubeStore = PlaybackStore<YouTubeVideoData | YouTubePlaylistVideoData>;

export const useYouTubeStore = create<YouTubeStore>()(
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
type PlaybackStatePart<T = any> =
  | BasicPlayback
  | Loop
  | MediaSwitching<T>
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

export type PlaybackActions<T = any> = BasicPlaybackActions &
  MediaSwitchingActions<T>;
