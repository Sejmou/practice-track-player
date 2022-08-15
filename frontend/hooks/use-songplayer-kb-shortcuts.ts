import { SongPlayerHandle } from '@components/SongPlayer/SongPlayer';
import { RefObject, useEffect } from 'react';

/**
 * Enables use of SongPlayer keyboard shortcuts on whole page (while component using this hook is mounted)
 *
 * @param songPlayerRef a song player handle obtained via
 * const ref = useRef<SongPlayerHandle>(null) + providing ref as SongPlayer ref prop in JSX return;
 */
export function useSongPlayerKeyboardShortcuts(
  songPlayerRef: RefObject<SongPlayerHandle>
) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // in all cases, prevent default behavior of hitting space bar (== page scroll)
      if (event.key === ' ') event.preventDefault();

      // forward all Keyboard events to the SongPlayer (if we have the ref)
      songPlayerRef.current?.handleKeyDown(event);
    };

    document.body.addEventListener('keydown', handleKeyDown, true);

    // remove listener
    return () => {
      document.body.removeEventListener('keydown', handleKeyDown, true);
    };
  }, [songPlayerRef]);
}
