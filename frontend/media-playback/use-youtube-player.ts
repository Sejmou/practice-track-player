import { useEffect } from 'react';
import { usePlaybackStore } from './current-medium-state';

export const useYouTubePlayer = (player?: YouTubePlayer) => {
  const {
    setDuration,
    setCurrentTime,
    setLoading,
    playbackRate,
    playing,
    lastSeekTime,
  } = usePlaybackStore();

  useEffect(() => {
    try {
      player?.setPlaybackRate(playbackRate);
    } catch (error) {
      console.error('Could not set playback rate on YouTube Player', error);
    }
  }, [player, playbackRate]);

  useEffect(() => {
    try {
      if (playing) {
        player?.playVideo();
      } else {
        player?.pauseVideo();
      }
    } catch (error) {
      console.error('Could not change playback state on YouTube Player', error);
    }
  }, [player, playing]);

  useEffect(() => {
    try {
      player?.seekTo(lastSeekTime, true);
    } catch (error) {
      console.error('Could not seek YouTube Player', error);
    }
  }, [player, lastSeekTime]);

  useEffect(() => {
    const stateChangeListener = ({ data }: any) => {
      if (data !== YouTubePlayerState.UNSTARTED) {
        const duration = player?.getDuration();
        if (duration) setDuration(duration);
      }
    };
    if (player) {
      setLoading(false);
      setCurrentTime(player.getCurrentTime());
      player.addEventListener(
        'onStateChange',
        stateChangeListener as unknown as string
      ); // for some reason official(!) API types event listener as string
    }

    return () => {
      setLoading(true);
      try {
        player?.removeEventListener(
          'onStateChange',
          stateChangeListener as unknown as string
        );
      } catch (error) {
        console.log(
          'Error removing player event listener for onStateChange',
          error
        );
      }
    };
  }, [player, setCurrentTime, setDuration, setLoading]);
};

/**
 * Public API for the YouTube Iframe Player
 *
 * A player instance that exposes this exact API is provided via the target prop of the even object passed to every callback supported by react-youtube (https://github.com/tjallingt/react-youtube#controlling-the-player)
 *
 * This is simply a list of all API methods, copied from https://developers.google.com/youtube/iframe_api_reference
 */
export type YouTubePlayer = {
  cueVideoById: (videoId: string, startSeconds: number) => void;
  cuePlaylist: (
    playlist: string | any[],
    index: number,
    startSeconds: number
  ) => void;
  loadPlaylist: (
    playlist: string | any[],
    index: number,
    startSeconds: number
  ) => void;
  playVideo: () => void;
  pauseVideo: () => void;
  stopVideo: () => void;
  seekTo: (seconds: number, allowSeekAhead: boolean) => void;
  getSphericalProperties(): object;
  setSphericalProperties: (properties: object) => void;
  nextVideo: () => void;
  previousVideo: () => void;
  playVideoAt: (index: number) => void;
  mute: () => void;
  unMute: () => void;
  isMuted: () => boolean;
  setVolume: (volume: number) => void;
  getVolume: () => number;
  setSize(width: number, height: number): object;
  getPlaybackRate: () => number;
  setPlaybackRate: (suggestedRate: number) => void;
  getAvailablePlaybackRates: () => number[];
  setLoop: (loopPlaylists: boolean) => void;
  setShuffle: (shufflePlaylist: boolean) => void;
  getVideoLoadedFraction: () => number;
  getPlayerState: () => YouTubePlayerState;
  getCurrentTime: () => number;
  getVideoStartBytes: () => number;
  getVideoBytesLoaded: () => number;
  getVideoBytesTotal: () => number;
  getDuration: () => number;
  getVideoUrl(): string;
  getVideoEmbedCode(): string;
  getPlaylist: () => any[];
  getPlaylistIndex: () => number;
  addEventListener: (event: string, listener: string) => void;
  removeEventListener: (event: string, listener: string) => void;
  getIframe(): object;
  destroy: () => void;
  onReady: () => void;
  onStateChange: () => void;
  onPlaybackQualityChange: () => YouTubePlayerState;
  onPlaybackRateChange: () => void;
  onError: () => void;
  onApiChange: () => void;
};

enum YouTubePlayerState {
  UNSTARTED = -1,
  ENDED = 0,
  PLAYING = 1,
  PAUSED = 2,
  BUFFERING = 3,
  VIDEO_CUED = 5,
}
