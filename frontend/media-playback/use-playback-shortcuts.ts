import { PlaybackActions } from './current-medium-state';
import { useKeyboardShortcuts } from './use-keyboard-shortcuts';

export function usePlaybackShortcuts(playbackActions: PlaybackActions) {
  useKeyboardShortcuts([
    [
      { key: ' ' },
      event => {
        // spacebar causes page scroll per default -> we don't want that!
        event.preventDefault();
        playbackActions.togglePlayPause();
      },
    ],
    [{ key: 'ArrowLeft' }, () => playbackActions.seekBackward(5)],
    [{ key: 'ArrowRight' }, () => playbackActions.seekForward(5)],
    [{ key: '-' }, () => playbackActions.increasePlaybackRate(0.05)],
    [{ key: '+' }, () => playbackActions.decreasePlaybackRate(0.05)],
    // [
    //   { key: 'ArrowLeft', ctrlKey: true },
    //   () => playbackActions.previous(),
    // ],
    // [
    //   { key: 'ArrowRight', ctrlKey: true },
    //   () => playbackActions.next(),
    // ],
  ]);
}
