import create from 'zustand';
import {
  createCurrentMediumPlaybackSlice,
  CurrentMediumPlaybackActions,
  CurrentMediumPlaybackSlice,
} from './current-medium-slice';
import {
  createMediaElementsSlice,
  MediaElementsActions,
  MediaElementsSlice,
} from './media-elements-slice';
import {
  createMediaSessionSlice,
  MediaSessionSlice,
} from './media-session-slice';
import { YouTubeVideoData, YouTubePlaylistVideoData } from '@models';
import { createLoopSlice, LoopSlice } from './loop-slice';

export type PlaybackStore = CurrentMediumPlaybackSlice &
  LoopSlice &
  MediaElementsSlice<any> &
  MediaSessionSlice;

type YouTubeStore = CurrentMediumPlaybackSlice &
  LoopSlice &
  MediaElementsSlice<YouTubeVideoData | YouTubePlaylistVideoData> &
  MediaSessionSlice;

export const useYouTubeStore = create<YouTubeStore>()((...a) => ({
  ...createCurrentMediumPlaybackSlice(...a),
  ...createMediaElementsSlice(...a),
  ...createMediaSessionSlice(...a),
  ...createLoopSlice(...a),
}));

export type PlaybackActions<T = any> = CurrentMediumPlaybackActions &
  MediaElementsActions<T>;
