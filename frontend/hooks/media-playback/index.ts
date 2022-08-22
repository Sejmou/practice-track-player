import { Dispatch, SetStateAction, useState } from 'react';

export type BaseMediaControlsProps = {
  /**
   * Action to take if handleNext fires
   */
  onNext: () => void;
  /**
   * Action to take if handlePrevious fires
   */
  onPrevious: () => void;
  /**
   * The number of seconds any controls for seeking the media should be seeked to
   *
   * Provide as input to any control displaying/interacting with the current seekTime
   *
   */
  seekTime?: number;
  /**
   * Whether keyboard shortcuts for the controls should be added. Defaults to true
   */
  addKeyboardShortcuts?: boolean;
  /**
   * minimum media playback rate; defaults to 0.5
   */
  minPlaybackRate: number;
  /**
   * maximum media playback rate; defaults to 1
   */
  maxPlaybackRate: number;
};

export type BasicMediaControlsReturnValues = {
  handlePlay: () => void;
  handlePause: () => void;
  handlePlayPauseToggle: () => void;
  handleNext: () => void;
  handlePrevious: () => void;
  handleForward5: () => void;
  handleBackward5: () => void;
};

export function useMediaControlsBase(
  props: BaseMediaControlsProps
): Required<BaseMediaControlsProps> & {
  playbackRate: number;
  setPlaybackRate: Dispatch<SetStateAction<number>>;
  isPlaying: boolean;
  setIsPlaying: Dispatch<SetStateAction<boolean>>;
} {
  const { onNext, onPrevious } = props;

  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);

  return {
    onNext,
    onPrevious,
    seekTime: props.seekTime ?? 0,
    addKeyboardShortcuts: props.addKeyboardShortcuts ?? true,
    maxPlaybackRate: props.maxPlaybackRate ?? 1,
    minPlaybackRate: props.minPlaybackRate ?? 0.5,
    playbackRate,
    setPlaybackRate,
    isPlaying,
    setIsPlaying,
  };
}
