import { useEffect, useState, useRef } from 'react';
import dynamic from 'next/dynamic';
import { Suspense } from 'react';
import { Box, IconButton, Typography } from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import SkipPreviousIcon from '@mui/icons-material/SkipPrevious';
import SkipNextIcon from '@mui/icons-material/SkipNext';

import { SourceData } from '@models';
import {
  KeyboardShortcuts,
  KeyboardShortcut,
} from '@frontend/keyboard-shortcuts';
import PlaybackRatePicker from './PlaybackRatePicker';

const WaveFormView = dynamic(() => import('./WaveFormView/WaveformView'), {
  ssr: false,
});

const shortcuts = new KeyboardShortcuts();

type Props = {
  audioContext?: AudioContext;
  audioElSrcData: SourceData;
  /**
   * required if src provided in audioElSrcData does not support CORS
   */
  audioBuffer?: AudioBuffer;
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
  nextAvailable,
  previousAvailable,
  onNextClicked,
  onPreviousClicked,
}: Props) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
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

  return (
    <div
      onKeyDownCapture={keyboardEvent => shortcuts.applyMatching(keyboardEvent)}
    >
      {audioRef.current && (
        <WaveFormView
          audioElement={audioRef.current}
          audioUrl={audioElSrcData.src}
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
            <PlaybackRatePicker
              playbackRate={playbackRate}
              onPlaybackRateChange={pbr => setPlaybackRate(pbr)}
            />
          </Box>
        </Box>
      </Box>
      <audio ref={audioRef}>
        <source src={audioElSrcData.src} />
      </audio>
    </div>
  );
};
export default AudioControls;

function secondsToMinutesAndSecondsStr(secs: number) {
  let minutes = Math.floor(secs / 60);
  let seconds = Math.round(secs % 60);
  if (seconds == 60) {
    minutes++;
    seconds = 0;
  }
  return `${padTo2Digits(minutes)}:${padTo2Digits(seconds)}`;
}

function padTo2Digits(num: number) {
  return num.toString().padStart(2, '0');
}
