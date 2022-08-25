import { addEventListenerWithRemoveCallback } from '@util';
import { useEffect } from 'react';
import { usePlaybackStore } from './current-medium-state';

export const useYouTubePlayer = (player?: YouTubePlayer) => {
  const {
    setDuration,
    setCurrentTime,
    setMediumLoaded,
    playbackRate,
    playing,
    lastSeekTime,
  } = usePlaybackStore();

  useEffect(() => {
    if (player) {
      const updatePlaybackRate = () => {
        player.setPlaybackRate(playbackRate);
        console.log('playback rate set to', playbackRate);
      };
      if (player.getPlayerState() !== YouTubePlayerState.VIDEO_CUED) {
        updatePlaybackRate();
      } else {
        // need to listen for change of player to state which supports playback rate change and setPlaybackRate() afterwards
        // afterwards, we should remove the event listener for that
        // for some super weird reason my remove listener callback implementation that
        // would be useful for this doesn't work with the YouTube Player API while it works perfectly with the DOM API
        // TODO: figure out why
        let playbackRateUpdated = false; // TODO: part of workaround, remove later
        const stateChangeListener = (
          { data }: any,
          removeListenerCallback: () => void
        ) => {
          if (playbackRateUpdated) return; // TODO: part of workaround, remove later
          if (data !== YouTubePlayerState.VIDEO_CUED) {
            if (player) {
              updatePlaybackRate();
              playbackRateUpdated = true; // TODO: part of workaround, remove later
              removeListenerCallback(); // this actually doesn't work lol
            }
          }
        };
        addEventListenerWithRemoveCallback(
          player as any,
          'onStateChange',
          stateChangeListener
        );
      }
    }
  }, [player, playbackRate]);

  useEffect(() => {
    if (player) {
      if (playing) {
        logPlayerStateAtAction('before schedule playback start', player);
        player.playVideo();
        logPlayerStateAtAction('after schedule playback start', player);
      } else {
        const playerState = player.getPlayerState();
        if (playerState === YouTubePlayerState.VIDEO_CUED) return; // player effectively "paused" (playback actually not started yet) - will error if we try to pause!
        logPlayerStateAtAction('before schedule playback pause', player);
        player.pauseVideo();
        logPlayerStateAtAction('after schedule playback pause', player);
      }
    }
  }, [player, playing]);

  useEffect(() => {
    if (player && lastSeekTime !== null) {
      player.seekTo(lastSeekTime, true);
    }
  }, [player, lastSeekTime]);

  useEffect(() => {
    if (player) {
      const stateChangeListener = ({ data }: any) => {
        if (data !== YouTubePlayerState.UNSTARTED) {
          const duration = player.getDuration();
          if (duration) setDuration(duration);
        }
      };

      const currentTimeTimer = setInterval(() => {
        const currentTime = player.getCurrentTime();
        if (currentTime) setCurrentTime(currentTime);
      }, 50);

      setMediumLoaded(true);

      player.addEventListener(
        'onStateChange',
        stateChangeListener as unknown as string
      ); // for some reason official(!) API types event listener as string

      return () => {
        setMediumLoaded(false);
        try {
          player.removeEventListener(
            'onStateChange',
            stateChangeListener as unknown as string
          );
        } catch (error) {}
        clearInterval(currentTimeTimer);
      };
    }
  }, [player, setCurrentTime, setDuration, setMediumLoaded]);

  // usePlaybackShortcuts(playbackAc);
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

function logPlayerStateAtAction(action: string, player: YouTubePlayer) {
  console.log(
    action + ', player state: ' + YouTubePlayerState[player.getPlayerState()]
  );
}
