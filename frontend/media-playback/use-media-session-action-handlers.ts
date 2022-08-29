import { useEffect } from 'react';
import { PlaybackActions } from './use-playback-store';

export function useMediaSessionActionHandlers(
  actionHandlerFns: Pick<
    PlaybackActions,
    'play' | 'pause' | 'next' | 'previous'
  >
) {
  useEffect(() => {
    const actionHandlers: [
      action: MediaSessionAction,
      handler: MediaSessionActionHandler
    ][] = [
      ['play', actionHandlerFns.play],
      ['pause', actionHandlerFns.pause],
      ['nexttrack', actionHandlerFns.next],
      ['previoustrack', actionHandlerFns.previous],
      //['seekto', playbackActions.seekTo],//TODO if motivated
      // ['seekbackward', handleBackward5],// will disabling those but enabling the two above cause prev./next buttons to show up on mobile?
      // ['seekforward', handleForward5],
    ];

    for (const [action, handler] of actionHandlers) {
      try {
        console.log('Adding action handler for', action);
        navigator.mediaSession.setActionHandler(action, handler);
      } catch (error) {
        console.log(
          `The media session action "${action}" is not supported yet.`
        );
      }
    }

    return () => {
      for (const [action, handler] of actionHandlers) {
        try {
          console.log('Removing action handler for', action);
          navigator.mediaSession.setActionHandler(action, null);
        } catch (error) {
          console.log(`Could not remove action handler for "${action}".`);
        }
      }
    };
  }, [actionHandlerFns]);
}
