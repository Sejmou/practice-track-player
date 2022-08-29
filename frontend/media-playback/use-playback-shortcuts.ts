import { PlaybackActions } from './use-playback-store';
import { useKeyboardShortcuts } from '../util/use-keyboard-shortcuts';

export function usePlaybackShortcuts(
  shortcutActions: Pick<
    PlaybackActions,
    | 'togglePlayPause'
    | 'seekForward'
    | 'seekBackward'
    | 'increasePlaybackRate'
    | 'decreasePlaybackRate'
    | 'previous'
    | 'next'
  >,
  active: boolean
) {
  useKeyboardShortcuts(
    [
      [
        { key: ' ' },
        event => {
          // spacebar causes page scroll per default -> we don't want that!
          event.preventDefault();
          shortcutActions.togglePlayPause();
        },
      ],
      [{ key: 'ArrowLeft' }, () => shortcutActions.seekBackward(5)],
      [{ key: 'ArrowRight' }, () => shortcutActions.seekForward(5)],
      [{ key: '-' }, () => shortcutActions.decreasePlaybackRate(0.05)],
      [{ key: '+' }, () => shortcutActions.increasePlaybackRate(0.05)],
      [{ key: 'ArrowLeft', ctrlKey: true }, () => shortcutActions.previous()],
      [{ key: 'ArrowRight', ctrlKey: true }, () => shortcutActions.next()],
    ],
    active
  );
}
