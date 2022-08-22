import { clamp } from '@util';
import { Dispatch, SetStateAction, useCallback, useState } from 'react';

export type BasicMediaControlHookProps = {
  /**
   * Action to take if handleNext fires
   */
  onNext: () => void;
  /**
   * Action to take if handlePrevious fires
   */
  onPrevious: () => void;
  /**
   * The number of seconds the media should initially be seeked to
   */
  initialSeekTime?: number;
  /**
   * Whether keyboard shortcuts for the controls should be added. Defaults to true
   */
  addKeyboardShortcuts?: boolean;
  /**
   * minimum media playback rate; defaults to 0.5
   */
  minPlaybackRate?: number;
  /**
   * maximum media playback rate; defaults to 1
   */
  maxPlaybackRate?: number;
};

export type BasicMediaControlsProps = {
  handlePlay: () => void;
  handlePause: () => void;
  handlePlayPauseToggle: () => void;
  handleNext: () => void;
  handlePrevious: () => void;
  handleForward5: () => void;
  handleBackward5: () => void;
  handleSeek: (newTime: number) => void;
  handlePlaybackRateChange: (newPlaybackRate: number) => void;
  playbackRate: number;
  currentTime: number;
  isPlaying: boolean;
  maxPlaybackRate: number;
  minPlaybackRate: number;
  duration: number;
};

export function useMediaControlsBase(
  props: BasicMediaControlHookProps
): Required<Omit<BasicMediaControlHookProps, 'initialSeekTime'>> & {
  playbackRate: number;
  setPlaybackRate: Dispatch<SetStateAction<number>>;
  isPlaying: boolean;
  setIsPlaying: Dispatch<SetStateAction<boolean>>;
  handlePlaybackRateChange: (newPlaybackRate: number) => void;
  lastSeekTime: number;
  setLastSeekTime: (newTime: number) => void;
  currentTime: number;
  setCurrentTime: (newTime: number) => void;
} {
  const { onNext, onPrevious } = props;

  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);

  const maxPlaybackRate = props.maxPlaybackRate ?? 1;
  const minPlaybackRate = props.minPlaybackRate ?? 0.5;

  const handlePlaybackRateChange = useCallback(
    (pbr: number) =>
      setPlaybackRate(clamp(pbr, minPlaybackRate, maxPlaybackRate)),
    [maxPlaybackRate, minPlaybackRate]
  );

  const [lastSeekTime, setLastSeekTime] = useState(props.initialSeekTime ?? 0);
  const [currentTime, setCurrentTime] = useState(props.initialSeekTime ?? 0);

  return {
    onNext,
    onPrevious,
    addKeyboardShortcuts: props.addKeyboardShortcuts ?? true,
    maxPlaybackRate,
    minPlaybackRate,
    playbackRate,
    setPlaybackRate,
    isPlaying,
    setIsPlaying,
    handlePlaybackRateChange,
    lastSeekTime,
    setLastSeekTime,
    currentTime,
    setCurrentTime,
  };
}
