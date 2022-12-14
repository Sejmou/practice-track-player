import { Box, Typography, useMediaQuery, useTheme } from '@mui/material';

import { SourceData } from '@models';
import AudioControls from './ui/controls/using-props/AudioControls';
import { WaveformViewPoint } from './ui/controls/using-props/WaveFormView/WaveformView';

// TODO: refactor this to use new approach to media playback

type Props = {
  mainTitle: string;
  subTitle?: string;
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
   * Used by Player's WaveformView to compute and display the waveform of the audio referenced in the audioElSrcData
   */
  audioContext?: AudioContext;
  /**
   * Audio buffer containing the decoded audio samples
   *
   * Player's WaveformView uses it to display the waveform of the audio
   *
   * Either this or waveformData is required!
   */
  audioBuffer?: AudioBuffer;
  /**
   * Whether the "next" button should be disabled
   *
   * Defaults to false
   *
   * Note: previousDisabled prop does not exist on purpose
   * - jumping to beginning of track with previous button should always be possible!
   */
  nextDisabled?: boolean;
  onNext: () => void;
  onPrevious: () => void;
  /**
   * The number of seconds the player should seek to
   *
   * Every time this prop changes, the player seeks the track to the new value
   *
   */
  seekTime?: number;
  /**
   * Notable points in time for the current audio; displayed in the WaveformView of the player
   */
  points?: WaveformViewPoint[];
};

const AudioPlayer = ({
  mainTitle,
  subTitle,
  audioElSrcData,
  audioContext,
  waveformData,
  audioBuffer,
  nextDisabled: nextDisabledProp,
  onNext,
  onPrevious,
  seekTime,
  points,
}: Props) => {
  const theme = useTheme();
  const narrowViewport = useMediaQuery(theme.breakpoints.down('md'));

  const nextDisabled =
    nextDisabledProp !== undefined ? nextDisabledProp : false;

  return (
    <Box>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          mb: 2,
        }}
      >
        <Typography variant={narrowViewport ? 'h6' : 'h5'}>
          {mainTitle}
        </Typography>
        {subTitle && (
          <Typography variant={narrowViewport ? 'subtitle2' : 'subtitle1'}>
            {subTitle}
          </Typography>
        )}
      </Box>
      <AudioControls
        audioElSrcData={audioElSrcData}
        onNext={onNext}
        onPrevious={onPrevious}
        nextDisabled={nextDisabled}
        audioContext={audioContext}
        audioBuffer={audioBuffer}
        waveformDataBuffer={waveformData}
        points={points}
        seekTime={seekTime}
      />
    </Box>
  );
};

AudioPlayer.displayName = 'AudioPlayer';

export default AudioPlayer;
