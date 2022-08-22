import { useEffect, useState, useRef, useCallback } from 'react';

import { SourceData } from '@models';
import { useKeyboardShortcuts } from '@frontend/hooks/use-keyboard-shortcuts';
import { BaseMediaControlsProps } from '.';

type BasicAudioControlsProps = BaseMediaControlsProps & {
  /**
   * data relevant for the internally used HTMLAudioElement
   */
  audioElSrcData: SourceData;
};

// TODO: actually test this lol
export const useBasicAudioPlaybackControls = ({
  audioElSrcData,
  onNext,
  onPrevious,
  seekTime,
  addKeyboardShortcuts: addKeyboardShortcutsProp,
}: BasicAudioControlsProps) => {
  const addKeyboardShortcuts = addKeyboardShortcutsProp
    ? addKeyboardShortcutsProp
    : true;
  const [isPlaying, setIsPlaying] = useState(false);
  // isReady state is actually irrelevant, I'm just abusing useState to trigger a rerender of components using hook once the audio element's metadata is loaded
  const [isReady, setIsReady] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);

  const minPlaybackRate = 0.5;
  const maxPlaybackRate = 1;

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
  }, []);

  const handlePause = () => {
    const audioEl = audioRef.current;
    if (audioEl) {
      audioEl.pause();
      if (navigator?.mediaSession?.playbackState)
        navigator.mediaSession.playbackState = 'paused';
      setIsPlaying(false);
    }
  };

  const handlePlayPauseToggle = () => {
    if (isPlaying) handlePause();
    else handlePlay();
  };

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

  const handlePlaybackRateChange = useCallback(
    (pbr: number) => setPlaybackRate(pbr),
    []
  );

  const handlePlaybackRateIncrease = useCallback(() => {
    setPlaybackRate(prev => Math.min(prev + 0.05, 1));
  }, []);

  const handlePlaybackRateDecrease = useCallback(() => {
    setPlaybackRate(prev => Math.max(prev - 0.05, 0.5));
  }, []);

  useKeyboardShortcuts([
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
  ]);

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
  }, [audioElSrcData.src]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.playbackRate = playbackRate;
    }
  }, [playbackRate]);

  useEffect(() => {
    if (audioRef.current && seekTime) {
      audioRef.current.currentTime = seekTime;
    }
  }, [seekTime]);

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
  }, [handleBackward5, handleForward5, handleNext, handlePlay, handlePrevious]);

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
