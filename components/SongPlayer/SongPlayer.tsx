import { Box, Typography, useMediaQuery, useTheme } from '@mui/material';
import React, { useImperativeHandle } from 'react';
import { useRef } from 'react';

import { Song, SourceData } from '@models';
import AudioControls from './AudioControls/AudioControls';
import { copyAndDispatchKeyboardEvent } from '@frontend';

type Props = {
  song: Song;
  /**
   * src and content type information for the <audio/> element that is used internally by the player
   */
  audioElSrcData: SourceData;
  /**
   * Precomputed binary waveform data for the audio file (.dat extension)
   * generated by https://github.com/bbc/audiowaveform and used by player's WaveformView
   *
   * Either this or audioBuffer is required!
   */
  waveformData?: ArrayBuffer;
  /**
   * Audio buffer containing the decoded audio samples
   *
   * Player's WaveformView uses it to display the waveform of the audio
   *
   * Either this or waveformData is required!
   */
  audioBuffer?: AudioBuffer;
  previousSongAvailable?: boolean;
  nextSongAvailable?: boolean;
  onNextSong: () => void;
  onPreviousSong: () => void;
  /**
   * The number of seconds the player should seek to
   *
   * Every time this prop changes, the player seeks the track to the new value
   *
   */
  seekTime?: number;
};

// forwarded to parent to allow it to call function imperatively
// See also: https://stackoverflow.com/a/37950970/13727176 https://stackoverflow.com/a/69292925/13727176
export type SongPlayerHandle = {
  handleKeyDown: (event: KeyboardEvent) => void;
};

const SongPlayer = React.forwardRef<SongPlayerHandle, Props>(
  (
    {
      song,
      audioElSrcData,
      waveformData,
      audioBuffer,
      previousSongAvailable,
      nextSongAvailable,
      onNextSong,
      onPreviousSong,
      seekTime,
    }: Props,
    ref
  ) => {
    const theme = useTheme();
    const narrowViewport = useMediaQuery(theme.breakpoints.down('md'));
    const controlsContainerRef = useRef<HTMLDivElement>(null);

    useImperativeHandle(ref, () => ({
      handleKeyDown: ev => {
        if (ev.target === controlsContainerRef.current) {
          // event is actually one we dispatched ourselves (see next if)
          // event is apparently not really dispatched only on child?
          // instead, it gets triggered from body downwards again?
          return;
        }
        // try to forward keydown event to controls
        if (controlsContainerRef.current) {
          copyAndDispatchKeyboardEvent(ev, controlsContainerRef.current);
        }
        if (ev.key === ' ') {
          // in any case, prevent default behavior of hitting space key ( == scrolling page)
          ev.preventDefault();
        }
      },
    }));

    return (
      <Box>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <Typography variant={narrowViewport ? 'body2' : 'body1'}>
            Current Song:
          </Typography>
          <Typography variant={narrowViewport ? 'h6' : 'h5'}>
            {song.no}. {song.title}
          </Typography>
        </Box>
        <AudioControls
          ref={controlsContainerRef} // TODO: refactor this to use useImperativeHandle internally
          audioElSrcData={audioElSrcData}
          audioBuffer={audioBuffer}
          onNext={onNextSong}
          onPrevious={onPreviousSong}
          nextAvailable={nextSongAvailable}
          previousAvailable={previousSongAvailable}
          waveformDataBuffer={waveformData}
          seekTime={seekTime}
        />
      </Box>
    );
  }
);

SongPlayer.displayName = 'SongPlayer';

export default SongPlayer;
