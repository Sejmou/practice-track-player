import { useEffect } from 'react';
import { PlaybackActions } from './use-playback-store';

export function useMediaSessionActionHandlers(
  playbackActions: PlaybackActions
) {
  useEffect(() => {
    const actionHandlers: [
      action: MediaSessionAction,
      handler: MediaSessionActionHandler
    ][] = [
      ['play', playbackActions.play],
      ['pause', playbackActions.pause],
      // ['nexttrack', playbackActions.next], // TODO
      // ['previoustrack', handlePrevious],
      // ['seekbackward', handleBackward5],// will disabling those but enabling the two above cause prev./next buttons to show up on mobile?
      // ['seekforward', handleForward5],
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
  }, [playbackActions.pause, playbackActions.play]);
}
