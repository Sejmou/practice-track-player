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

export type PlaybackStore = CurrentMediumPlaybackSlice &
  MediaElementsSlice<any> &
  MediaSessionSlice;

type YouTubeStore = CurrentMediumPlaybackSlice &
  MediaElementsSlice<YouTubeVideoData | YouTubePlaylistVideoData> &
  MediaSessionSlice;

export const useYouTubeStore = create<YouTubeStore>()((...a) => ({
  ...createCurrentMediumPlaybackSlice(...a),
  ...createMediaElementsSlice(...a),
  ...createMediaSessionSlice(...a),
}));

export type PlaybackActions<T = any> = CurrentMediumPlaybackActions &
  MediaElementsActions<T>;
