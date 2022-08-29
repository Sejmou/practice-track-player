import { useEffect, useMemo, useRef } from 'react';
import { useMediaSessionActionHandlers } from './use-media-session-action-handlers';
import { usePlaybackShortcuts } from './use-playback-shortcuts';
import { useYouTubeStore } from './use-playback-store';

export const useYouTubePlayer = (player?: YouTubePlayer) => {
  const {
    setDuration,
    setCurrentTime,
    resetCurrentPlaybackState: resetCurrent,
    playing,
    lastSeekTime,
    playbackRate,
    play,
    pause,
    togglePlayPause,
    seekForward,
    seekBackward,
    next,
    previous,
    increasePlaybackRate,
    decreasePlaybackRate,
    currIdx,
  } = useYouTubeStore();

  const playbackFns = useMemo(() => {
    return {
      togglePlayPause,
      seekForward,
      seekBackward,
      next,
      previous,
      increasePlaybackRate,
      decreasePlaybackRate,
      play,
      pause,
    };
  }, [
    togglePlayPause,
    seekForward,
    seekBackward,
    next,
    previous,
    increasePlaybackRate,
    decreasePlaybackRate,
    play,
    pause,
  ]);

  usePlaybackShortcuts(playbackFns, true);

  useMediaSessionActionHandlers(playbackFns);

  const playerRef = useRef<YouTubePlayer | undefined>(player);
  const playerState = useRef<YouTubePlayerState>(YouTubePlayerState.UNSTARTED);
  const playScheduled = useRef(false);
  const scheduledSeekTime = useRef<number | null>(null);
  const scheduledNewPbr = useRef<number | null>(null);
  const lastIdx = useRef<number | null>(null);

  // TODOs:
  // verify that player functions are only called when player can actually execute them

  useEffect(() => {
    if (player && !playScheduled.current) {
      if (playing) {
        logPlayerState('playing', player);
        if (!isPlaying(player)) {
          if (canPlay(player)) {
            console.log('player should play video');
            player.playVideo();
          } else {
            playScheduled.current = true;
          }
        }
      } else {
        logPlayerState('not playing', player);
        if (isPlaying(player)) {
          if (canPause(player)) {
            console.log('player should pause');
            player.pauseVideo();
          }
        }
      }
    }
  }, [player, playing]);

  useEffect(() => {
    const previousIdx = lastIdx.current;
    if (playing && previousIdx !== currIdx) {
      playScheduled.current = true;
    }
    lastIdx.current = currIdx;
  }, [playing, currIdx]);

  useEffect(() => {
    if (lastSeekTime !== null && player) {
      logPlayerState('lastSeekTime changed to ' + lastSeekTime, player);
      if (isVideoAvailable(player)) {
        player.seekTo(lastSeekTime, true);
      } else {
        scheduledSeekTime.current = lastSeekTime;
      }
    }
  }, [player, lastSeekTime]);

  useEffect(() => {
    if (player) {
      if (isVideoAvailable(player)) player.setPlaybackRate(playbackRate);
      else scheduledNewPbr.current = playbackRate;
    }
  }, [player, playbackRate]);

  // removing event listeners from YouTube Iframe API does not work - see https://stackoverflow.com/a/25928370/13727176
  // so, my workaround is to just pass an event listener once and change the function the reference points to on every fresh call to useEffect
  const stateChangeListenerRef =
    useRef<(data: { data: YouTubePlayerState }) => void>();

  useEffect(() => {
    if (player) {
      const playerRefChanged = player !== playerRef.current;
      playerRef.current = player;
      const listenerId = Math.round(Math.random() * 1000);
      stateChangeListenerRef.current = ({ data }: any) => {
        logPlayerState(
          `state change listener with random ID ${listenerId} triggered`,
          player
        );
        playerState.current = data;
        if (playerState.current !== YouTubePlayerState.UNSTARTED) {
          setDuration(player.getDuration());
        }
        const playerPlaying = isPlaying(player);

        if (!playScheduled.current) {
          if (playerPlaying && !playing) {
            play();
          } else if (!playerPlaying && playing) {
            pause();
          }
        } else if (playScheduled.current) {
          if (!playerPlaying && canPlay(player)) {
            player.playVideo();
          } else if (playerPlaying) {
            playScheduled.current = false;
          }
        }

        const videoAvailable = isVideoAvailable(player);

        if (videoAvailable) {
          if (scheduledNewPbr.current !== null) {
            player.setPlaybackRate(scheduledNewPbr.current);
            scheduledNewPbr.current = null;
          }

          if (scheduledSeekTime.current !== null) {
            player.seekTo(scheduledSeekTime.current, true);
            scheduledSeekTime.current = null;
          }
        }
      };

      const currentTimeTimer = setInterval(() => {
        const currentTime = player.getCurrentTime();
        if (currentTime) setCurrentTime(currentTime);
      }, 50);

      if (playerRefChanged) {
        console.log('player ref changed!');
        resetCurrent();
        const helper = (event: any) => {
          // will call the current state change listener every time - part of workaround for non-functional event listener removal from YouTube Iframe API
          stateChangeListenerRef.current?.(event);
        };
        player.addEventListener('onStateChange', helper as unknown as string); // for some reason official(!) API types event listener as string
      }

      return () => {
        clearInterval(currentTimeTimer);
      };
    }
  }, [pause, play, player, playing, resetCurrent, setCurrentTime, setDuration]);
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

function logPlayerState(desc: string, player: YouTubePlayer) {
  console.log(
    desc + ', player state: ' + YouTubePlayerState[player.getPlayerState()]
  );
}

function isPlaying(player: YouTubePlayer) {
  const playerState = player.getPlayerState();
  return (
    playerState === YouTubePlayerState.PLAYING ||
    playerState === YouTubePlayerState.BUFFERING
  );
}

function canPlay(player: YouTubePlayer) {
  const playerState = player.getPlayerState();
  return playerState !== YouTubePlayerState.UNSTARTED;
}

function isVideoAvailable(player: YouTubePlayer) {
  const playerState = player.getPlayerState();
  return (
    playerState !== YouTubePlayerState.UNSTARTED &&
    playerState !== YouTubePlayerState.VIDEO_CUED
  );
}

function canPause(player: YouTubePlayer) {
  const playerState = player.getPlayerState();
  return (
    playerState !== YouTubePlayerState.ENDED &&
    playerState !== YouTubePlayerState.VIDEO_CUED &&
    playerState !== YouTubePlayerState.UNSTARTED &&
    playerState !== YouTubePlayerState.PAUSED
  );
}
