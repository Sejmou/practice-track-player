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
};
