import { useEffect, useState, useRef } from 'react';
import dynamic from 'next/dynamic';
import { Box, IconButton } from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import SkipPreviousIcon from '@mui/icons-material/SkipPrevious';
import SkipNextIcon from '@mui/icons-material/SkipNext';

import { SourceData } from '@models';
import {
  KeyboardShortcuts,
  KeyboardShortcut,
} from '@frontend/keyboard-shortcuts';
import PlaybackRateSlider from './PlaybackRateSlider';

const WaveFormView = dynamic(() => import('./WaveFormView/WaveformView'), {
  ssr: false,
});

const shortcuts = new KeyboardShortcuts();

type Props = {
  audioContext?: AudioContext;
  audioElSrcData: SourceData;
  /**
   * either this or waveformDataUri is required if src of audioElSrcData does not support CORS!
   */
  audioBuffer?: AudioBuffer;
  /**
   * either this or audioBuffer is required if src of audioElSrcData does not support CORS!
   */
  waveformDataBuffer?: ArrayBuffer;
  nextAvailable?: boolean;
  previousAvailable?: boolean;
  onNextClicked: () => void;
  onPreviousClicked: () => void;
};
const AudioControls = ({
  // TODO: improve perfomance of this; current code is probably not very efficient I guess
  audioContext,
  audioElSrcData,
  audioBuffer,
  waveformDataBuffer,
  nextAvailable,
  previousAvailable,
  onNextClicked,
  onPreviousClicked,
}: Props) => {
  const [isPlaying, setIsPlaying] = useState(false);

  // isReady state is actually irrelevant, I'm just abusing useState to trigger a rerender once the audio element's metadata is loaded
  const [isReady, setIsReady] = useState(false);

  const [playbackRate, setPlaybackRate] = useState(1);

  const audioRef = useRef<HTMLAudioElement>(null);

  const handlePlayPauseToggle = () => {
    setIsPlaying(previous => !previous);
  };

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.src = audioElSrcData.src;
    }
  }, [audioElSrcData]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.playbackRate = playbackRate;
    }
  }, [playbackRate]);

  useEffect(() => {
    shortcuts.set([
      new KeyboardShortcut({ code: 'Space' }, () => {
        handlePlayPauseToggle();
      }),
    ]);
  }, []);

  useEffect(() => {
    if (isPlaying) {
      audioRef.current?.play();
    } else {
      audioRef.current?.pause();
    }
  }, [isPlaying]);

  const metadataLoadedHandler = () => {
    setIsReady(true);
  };

  return (
    <div
      onKeyDownCapture={keyboardEvent => shortcuts.applyMatching(keyboardEvent)}
    >
      {audioRef.current && (
        <WaveFormView
          audioElement={audioRef.current}
          audioUrl={audioElSrcData.src}
          waveformDataBuffer={waveformDataBuffer}
          audioContentType={audioElSrcData.type}
          setSegments={() => {}}
          setPoints={() => {}}
          audioContext={audioContext}
          audioBuffer={audioBuffer}
        />
      )}
      <Box sx={{ display: 'flex', flexDirection: 'column' }}>
        <Box
          sx={{
            display: 'grid',
            width: '100%',
            gridTemplateColumns: '1fr 1fr 1fr',
          }}
        >
          <Box></Box>
          <Box sx={{ display: 'flex', justifyContent: 'center' }}>
            <IconButton
              size="large"
              disabled={!previousAvailable}
              onClick={onPreviousClicked}
              color="primary"
            >
              <SkipPreviousIcon />
            </IconButton>
            <IconButton
              onClick={handlePlayPauseToggle}
              color="primary"
              size="large"
            >
              {!isPlaying ? <PlayArrowIcon /> : <PauseIcon />}
            </IconButton>
            <IconButton
              size="large"
              disabled={!nextAvailable}
              onClick={onNextClicked}
              color="primary"
            >
              <SkipNextIcon />
            </IconButton>
          </Box>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <PlaybackRateSlider
              playbackRate={playbackRate}
              onPlaybackRateChange={pbr => setPlaybackRate(pbr)}
            />
          </Box>
        </Box>
      </Box>
      <audio ref={audioRef} onLoadedMetadata={metadataLoadedHandler}>
        <source src={audioElSrcData.src} />
      </audio>
    </div>
  );
};
export default AudioControls;
