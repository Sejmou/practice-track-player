import { PlaybackStateManipulator } from '.';
import { BasicPlayback } from './basic';
import { MediaSwitching } from './media-switching';

export interface MediaSessionActions {
  addCustomMediaSessionData: () => void;
  removeCustomMediaSessionData: () => void;
  updateMediaSessionPlaybackState: () => void;
}

interface MediaSessionState {
  /**
   * See description of MediaSessionSlice for details on why this exists
   */
  mediaSessionMockAudio: HTMLAudioElement | null;
}

/**
 * This slice is responsible for showing meaningful Media Data + Playback Controls
 * to the user via the Media Session API (https://web.dev/media-session/)
 *
 * Sometimes we also might not have actual audio/video elements when we play media,
 * or we want to just redefine and customize
 * the media session related behavior that some API already provides.
 * In this project, the latter is the case with the YouTube Iframe player API.
 *
 * For this, we use an audio element playing silent audio in a loop as a workaround.
 */
export type MediaSessionManipulation = MediaSessionActions & MediaSessionState;

// TODO: write this
export const createMediaSessionManipulator: PlaybackStateManipulator<
  MediaSessionManipulation,
  BasicPlayback & MediaSwitching
> = (set, get) => ({
  addCustomMediaSessionData: () => {
    const mockAudio =
      get().mediaSessionMockAudio ?? new Audio('/mp3/silence.mp3');
    if (!get().mediaSessionMockAudio) {
      set(() => ({
        mediaSessionMockAudio: mockAudio,
      }));
    }

    mockAudio.loop = true;
    mockAudio.play().then(() => {
      navigator.mediaSession.metadata = new MediaMetadata({
        artist: 'Test',
        title: 'Something',
      });

      get().updateMediaSessionPlaybackState();

      const actionHandlersArr: [
        action: MediaSessionAction,
        handler: MediaSessionActionHandler
      ][] = [
        [
          'play',
          () => {
            console.log('play');
            get().play();
          },
        ],
        [
          'pause',
          () => {
            console.log('pause');
            get().pause();
          },
        ],
        [
          'nexttrack',
          () => {
            console.log('next track');
            get().goToNext();
          },
        ],
        [
          'previoustrack',
          () => {
            console.log('previous track');
            get().goToPrevious();
          },
        ],
        //['seekto', playbackActions.seekTo],//TODO if motivated
        // ['seekbackward', handleBackward5],// will disabling those but enabling the two above cause prev./next buttons to show up on mobile?
        // ['seekforward', handleForward5],
      ];
      for (const [action, handler] of actionHandlersArr) {
        try {
          console.log('Adding action handler for', action);
          navigator.mediaSession.setActionHandler(action, null);
          navigator.mediaSession.setActionHandler(action, handler);
        } catch (error) {
          console.log(
            `The media session action "${action}" is not supported yet.`
          );
        }
      }
    });
  },
  mediaSessionMockAudio: null,
  removeCustomMediaSessionData: () => {
    const actions: MediaSessionAction[] = [
      'play',
      'pause',
      'nexttrack',
      'previoustrack',
    ];
    for (const action of actions) {
      navigator.mediaSession.setActionHandler(action, null);
    }
    get().mediaSessionMockAudio?.pause(); // not really necessary - mockAudio should be silent anyway lol
  },
  updateMediaSessionPlaybackState: () => {
    if (navigator?.mediaSession?.playbackState) {
      navigator.mediaSession.playbackState = get().playing
        ? 'playing'
        : 'paused';
    }
  },
});
