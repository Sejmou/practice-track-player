import { Box, Typography, useMediaQuery, useTheme } from '@mui/material';

import { Song, SourceData } from '@models';
import AudioControls from './AudioControls/AudioControls';
import { WaveformViewPoint } from './AudioControls/WaveFormView/WaveformView';

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
  /**
   * Notable points in time for the current song; displayed in the WaveformView of the player
   */
  points?: WaveformViewPoint[];
};

const SongPlayer = ({
  song,
  audioElSrcData,
  waveformData,
  audioBuffer,
  previousSongAvailable,
  nextSongAvailable,
  onNextSong,
  onPreviousSong,
  seekTime,
  points,
}: Props) => {
  const theme = useTheme();
  const narrowViewport = useMediaQuery(theme.breakpoints.down('md'));

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
        audioElSrcData={audioElSrcData}
        audioBuffer={audioBuffer}
        onNext={onNextSong}
        onPrevious={onPreviousSong}
        nextAvailable={nextSongAvailable}
        previousAvailable={previousSongAvailable}
        waveformDataBuffer={waveformData}
        points={points}
        seekTime={seekTime}
      />
    </Box>
  );
};

SongPlayer.displayName = 'SongPlayer';

export default SongPlayer;
