import { useEffect, useState, useRef } from 'react';
import { Box, IconButton, Typography, Slider } from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import SkipPreviousIcon from '@mui/icons-material/SkipPrevious';
import SkipNextIcon from '@mui/icons-material/SkipNext';

import { SourceData } from '@models';
import {
  KeyboardShortcuts,
  KeyboardShortcut,
} from '@frontend/keyboard-shortcuts';

const shortcuts = new KeyboardShortcuts();

type Props = {
  audioData: SourceData;
  nextAvailable?: boolean;
  previousAvailable?: boolean;
  onNextClicked: () => void;
  onPreviousClicked: () => void;
};
const AudioControls = ({
  // TODO: improve perfomance of this; current code is probably not very efficient I guess
  audioData,
  nextAvailable,
  previousAvailable,
  onNextClicked,
  onPreviousClicked,
}: Props) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0.0001);
  const [playbackRate, setPlaybackRate] = useState(1);

  const intervalRef = useRef<NodeJS.Timer>();

  const startProgressUpdateTimer = () => {
    clearInterval(intervalRef.current);
    const newTimer = setInterval(() => {
      if (audioRef.current) {
        setProgress(audioRef.current.currentTime);
      }
    }, 100);
    intervalRef.current = newTimer;
  };

  const audioRef = useRef<HTMLAudioElement>(null);

  const handleMetadataLoaded = () => {
    setDuration(audioRef.current!.duration);
  };

  const handlePlayPauseToggle = () => {
    setIsPlaying(previous => !previous);
  };

  const handleProgressSliderChange = (
    event: Event,
    newValue: number | number[]
  ) => {
    clearInterval(intervalRef.current);
    const newTime = (duration * (newValue as number)) / 100;
    if (audioRef.current) {
      audioRef.current.currentTime = newTime;
    }
    setProgress(newTime);
  };

  const handleProgressSliderChangeEnd = () => {
    startProgressUpdateTimer();
  };

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.src = audioData.src;
    }
  }, [audioData]);

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
      startProgressUpdateTimer();
    } else {
      audioRef.current?.pause();
    }
  }, [isPlaying]);

  useEffect(() => {
    const intervalTimer = intervalRef.current;
    return () => {
      clearInterval(intervalTimer);
    };
  }, []);

  return (
    <div
      onKeyDownCapture={keyboardEvent => shortcuts.applyMatching(keyboardEvent)}
    >
      <Box sx={{ display: 'flex', flexDirection: 'column' }}>
        <Box
          sx={{
            display: 'flex',
            width: '100%',
            justifyContent: 'center',
          }}
        >
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
        <Box sx={{ display: 'flex', alignItems: 'center', mt: '-4px' }}>
          <Box sx={{ minWidth: 35 }}>
            <Typography variant="body2" color="text.secondary">
              {secondsToMinutesAndSecondsStr(progress)}
            </Typography>
          </Box>
          <Box sx={{ width: '100%', mr: 2, ml: 2 }}>
            <Slider
              sx={{ p: '5px 0' }}
              value={(progress / duration) * 100}
              onChange={handleProgressSliderChange}
              onKeyUp={handleProgressSliderChangeEnd}
              onMouseUp={handleProgressSliderChangeEnd}
              size="small"
            />
          </Box>
          <Box sx={{ minWidth: 35 }}>
            <Typography variant="body2" color="text.secondary">
              {secondsToMinutesAndSecondsStr(duration)}
            </Typography>
          </Box>
        </Box>
      </Box>
      <audio onLoadedMetadata={handleMetadataLoaded} ref={audioRef}>
        <source src={audioData.src} />
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
