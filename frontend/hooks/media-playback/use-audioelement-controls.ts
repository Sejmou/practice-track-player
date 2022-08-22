import { useEffect, useState, useRef, useCallback } from 'react';

import { SourceData } from '@models';
import { useKeyboardShortcuts } from '@frontend/hooks/use-keyboard-shortcuts';
import {
  BasicMediaControlHookProps,
  BasicMediaControlsProps,
  useMediaControlsBase,
} from '.';
import { clamp } from '@util';

type BasicAudioControlsProps = BasicMediaControlHookProps & {
  /**
   * data relevant for the internally used HTMLAudioElement
   */
  audioElSrcData: SourceData;
};

// TODO: actually test this lol
export const useBasicAudioPlaybackControls: (
  props: BasicAudioControlsProps
) => BasicMediaControlsProps = props => {
  const {
    addKeyboardShortcuts,
    isPlaying,
    maxPlaybackRate,
    minPlaybackRate,
    onNext,
    onPrevious,
    playbackRate,
    setIsPlaying,
    setPlaybackRate,
    handlePlaybackRateChange,
    lastSeekTime,
    setLastSeekTime,
    currentTime,
    setCurrentTime,
  } = useMediaControlsBase(props);

  const { audioElSrcData } = props;

  // isReady state is actually irrelevant, I'm just abusing useState to trigger a rerender of components using hook once the audio element's metadata is loaded
  const [isReady, setIsReady] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  const handleMetadataLoaded = () => {
    setIsReady(true);
  };

  const handlePlay = useCallback(async () => {
    const audioEl = audioRef.current;
    if (audioEl) {
      await audioEl.play();
      if (navigator?.mediaSession?.playbackState)
        navigator.mediaSession.playbackState = 'playing';
      setIsPlaying(true);
    }
  }, [setIsPlaying]);

  const handlePause = useCallback(() => {
    const audioEl = audioRef.current;
    if (audioEl) {
      audioEl.pause();
      if (navigator?.mediaSession?.playbackState)
        navigator.mediaSession.playbackState = 'paused';
      setIsPlaying(false);
    }
  }, [setIsPlaying]);

  const handlePlayPauseToggle = useCallback(() => {
    if (isPlaying) handlePause();
    else handlePlay();
  }, [handlePause, handlePlay, isPlaying]);

  const handlePrevious = useCallback(() => {
    if (audioRef.current && audioRef.current.currentTime > 1) {
      // picked some arbitrary value a little bit larger than 0 to allow for going to previous song by double-clicking
      audioRef.current.currentTime = 0;
    } else {
      onPrevious();
    }
  }, [onPrevious]);

  const handleBackward5 = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.currentTime = Math.max(
        audioRef.current.currentTime - 5,
        0
      );
    }
  }, []);

  const handleForward5 = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.currentTime = Math.min(
        audioRef.current.currentTime + 5,
        audioRef.current.duration
      );
    }
  }, []);

  const handleNext = useCallback(() => {
    onNext();
  }, [onNext]);

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
    const audio = new Audio(audioElSrcData.src);
    audio.load();
    audio.addEventListener('canplaythrough', () =>
      console.log('can play through')
    );
    audio.addEventListener('loadedmetadata', handleMetadataLoaded);

    audioRef.current = audio;

    return () => {
      audioRef.current?.pause();
      setIsPlaying(false);
    };
  }, [audioElSrcData.src, setIsPlaying]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.playbackRate = playbackRate;
    }
  }, [playbackRate]);

  const handleSeek = (newTime: number) => {
    if (audioRef.current) {
      setLastSeekTime(clamp(newTime, 0, audioRef.current.duration));
    }
  };

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.currentTime = lastSeekTime;
    }
  }, [lastSeekTime]);

  useEffect(() => {
    const updateCurrentTime = () => {
      if (audioRef.current) {
        setCurrentTime(audioRef.current.currentTime);
      }
    };
    const id = setInterval(updateCurrentTime, 500);
    return () => {
      clearInterval(id);
    };
  }, [setCurrentTime]);

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

  const [duration, setDuration] = useState(1);
  useEffect(() => {
    if (audioRef.current) {
      setDuration(audioRef.current?.duration);
    }
  }, [audioElSrcData.src]);

  return {
    handlePlay,
    handlePause,
    handlePlayPauseToggle,
    handleNext,
    handlePrevious,
    handleForward5,
    handleBackward5,
    handlePlaybackRateChange,
    handleSeek,
    playbackRate,
    currentTime,
    isPlaying,
    maxPlaybackRate,
    minPlaybackRate,
    duration,
  };
};
