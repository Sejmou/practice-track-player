import { PlaybackActions } from './store';
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
    | 'toggleLoop'
    | 'setLoopStartToCurrent'
    | 'setLoopEndToCurrent'
  >,
  active: boolean
) {
  useKeyboardShortcuts(
    [
      [
        { key: ' ' },
        event => {
          if (document.activeElement) {
            const kindaInputElementTagNames = ['input', 'select', 'textarea'];
            const activeElementIsKindaInput = !!kindaInputElementTagNames.find(
              n => n === document.activeElement?.tagName.toLowerCase()
            );
            if (
              activeElementIsKindaInput &&
              !(document.activeElement.getAttribute('type') === 'range') // space key on slider should still trigger playpause toggle, so we add this condition
            ) {
              // user probably wants to interact with element, do nothing
              return;
            }
          }
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
      [{ key: 'ArrowRight', ctrlKey: true }, () => shortcutActions.next()],
      [{ key: 'l' }, () => shortcutActions.toggleLoop()],
      [{ key: ',' }, () => shortcutActions.setLoopStartToCurrent()],
      [{ key: '.' }, () => shortcutActions.setLoopEndToCurrent()],
    ],
    active
  );
}
