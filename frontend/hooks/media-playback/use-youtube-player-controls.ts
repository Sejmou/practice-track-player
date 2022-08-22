import { useCallback, useEffect } from 'react';

import {
  BaseMediaControlsProps,
  BasicMediaControlsReturnValues,
  useMediaControlsBase,
} from '.';
import { useKeyboardShortcuts } from '../use-keyboard-shortcuts';

type YouTubePlayerControlsProps = BaseMediaControlsProps & {
  player?: YouTubePlayer;
};

export const useYouTubePlayerControls: (
  props: YouTubePlayerControlsProps
) => BasicMediaControlsReturnValues = props => {
  const {
    addKeyboardShortcuts,
    isPlaying,
    maxPlaybackRate,
    minPlaybackRate,
    onNext,
    onPrevious,
    playbackRate,
    seekTime,
    setIsPlaying,
    setPlaybackRate,
  } = useMediaControlsBase(props);

  const { player } = props;

  const handlePlay = useCallback(async () => {
    if (player) {
      player.playVideo();
      if (navigator?.mediaSession?.playbackState)
        navigator.mediaSession.playbackState = 'playing';
      setIsPlaying(true);
    }
  }, [player, setIsPlaying]);

  const handlePause = useCallback(() => {
    if (player) {
      player.pauseVideo();
      if (navigator?.mediaSession?.playbackState)
        navigator.mediaSession.playbackState = 'paused';
      setIsPlaying(false);
    }
  }, [player, setIsPlaying]);

  const handlePlayPauseToggle = () => {
    if (isPlaying) handlePause();
    else handlePlay();
  };

  const handlePrevious = useCallback(() => {
    if (player && player.getCurrentTime() > 1) {
      // picked some arbitrary value a little bit larger than 0 to allow for going to previous song by double-clicking
      player.seekTo(0, true);
    } else {
      onPrevious();
    }
  }, [onPrevious, player]);

  const handleBackward5 = useCallback(() => {
    if (player) {
      player.seekTo(player.getCurrentTime() - 5, true);
    }
  }, [player]);

  const handleForward5 = useCallback(() => {
    if (player) {
      player.seekTo(player.getCurrentTime() + 5, true);
    }
  }, [player]);

  const handleNext = useCallback(() => {
    onNext();
  }, [onNext]);

  const handlePlaybackRateChange = useCallback(
    (pbr: number) => setPlaybackRate(pbr),
    [setPlaybackRate]
  );

  const handlePlaybackRateIncrease = useCallback(() => {
    setPlaybackRate(prev => Math.min(prev + 0.05, maxPlaybackRate));
  }, [maxPlaybackRate, setPlaybackRate]);

  const handlePlaybackRateDecrease = useCallback(() => {
    setPlaybackRate(prev => Math.max(prev - 0.05, minPlaybackRate));
  }, [minPlaybackRate, setPlaybackRate]);

  useKeyboardShortcuts(
    addKeyboardShortcuts
      ? [
          [
            { key: ' ' },
            event => {
              // spacebar causes page scroll per default -> we don't want that!
              handlePlayPauseToggle();
              event.preventDefault();
            },
          ],
          [{ key: 'ArrowLeft' }, handleBackward5],
          [{ key: 'ArrowRight' }, handleForward5],
          [{ key: '-' }, handlePlaybackRateDecrease],
          [{ key: '+' }, handlePlaybackRateIncrease],
          [{ key: 'ArrowLeft', ctrlKey: true }, handlePrevious],
          [{ key: 'ArrowRight', ctrlKey: true }, handleNext],
        ]
      : []
  );

  useEffect(() => {
    if (player) {
      try {
        // TODO: investigate the error that is thrown further
        player.setPlaybackRate(playbackRate);
      } catch (error) {}
    }
  }, [playbackRate, player]);

  useEffect(() => {
    if (player && seekTime) {
      player.seekTo(seekTime, true);
    }
  }, [player, seekTime]);

  useEffect(() => {
    const actionHandlers: [
      action: MediaSessionAction,
      handler: MediaSessionActionHandler
    ][] = [
      ['play', handlePlay],
      ['pause', handlePause],
      ['nexttrack', handleNext],
      ['previoustrack', handlePrevious],
      ['seekbackward', handleBackward5],
      ['seekforward', handleForward5],
    ];

    for (const [action, handler] of actionHandlers) {
      try {
        navigator.mediaSession.setActionHandler(action, handler);
      } catch (error) {
        console.log(
          `The media session action "${action}" is not supported yet.`
        );
      }
    }
  }, [
    handleBackward5,
    handleForward5,
    handleNext,
    handlePause,
    handlePlay,
    handlePrevious,
  ]);

  return {
    handlePlay,
    handlePause,
    handlePlayPauseToggle,
    handleNext,
    handlePrevious,
    handleForward5,
    handleBackward5,
  };
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
  getPlayerState: () => number;
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
