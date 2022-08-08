import { useEffect, useRef, useState } from 'react';
import {
  LinearProgress,
  Box,
  IconButton,
  Typography,
  Slider,
} from '@mui/material';
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
  audioData,
  nextAvailable,
  previousAvailable,
  onNextClicked,
  onPreviousClicked,
}: Props) => {
  const audioElRef = useRef<HTMLAudioElement>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(1);
  const [playbackRate, setPlaybackRate] = useState(1);

  const handlePlayPauseToggle = () => {
    setIsPlaying(previous => !previous);
  };

  const handleProgressSliderChange = (
    event: Event,
    newValue: number | number[]
  ) => {
    const newTime = (duration * (newValue as number)) / 100;
    console.log(newTime);
    setCurrentTime(newTime);
  };

  const audioElement = audioElRef.current;
  const audioElTime = audioElement?.currentTime;

  useEffect(() => {
    console.log('audio element', audioElement);
    if (audioElement) {
      const { duration, currentTime, playbackRate } = audioElement;
      console.log({ duration, currentTime, playbackRate });

      setCurrentTime(currentTime);
      setDuration(duration);
      setPlaybackRate(playbackRate);
    }
  }, [audioElement]);

  useEffect(() => {
    if (audioElRef.current) {
      audioElRef.current.currentTime = currentTime;
    }
  }, [currentTime]);

  useEffect(() => {
    shortcuts.set([
      new KeyboardShortcut({ code: 'Space' }, () => {
        handlePlayPauseToggle();
      }),
    ]);
  }, []);

  useEffect(() => {
    if (isPlaying) {
      audioElRef.current?.play();
    } else {
      audioElRef.current?.pause();
    }
  }, [isPlaying]);

  const { src, type } = audioData;
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
          <IconButton size="large" onClick={onPreviousClicked} color="primary">
            <SkipPreviousIcon />
          </IconButton>
          <IconButton
            onClick={handlePlayPauseToggle}
            color="primary"
            size="large"
          >
            {!isPlaying ? <PlayArrowIcon /> : <PauseIcon />}
          </IconButton>
          <IconButton size="large" onClick={onNextClicked} color="primary">
            <SkipNextIcon />
          </IconButton>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', mt: '-4px' }}>
          <Box sx={{ minWidth: 35 }}>
            <Typography variant="body2" color="text.secondary">
              {secondsToMinutesAndSecondsStr(currentTime)}
            </Typography>
          </Box>
          <Box sx={{ width: '100%', mr: 2, ml: 2 }}>
            <Slider
              sx={{ p: '5px 0' }}
              value={(currentTime / duration) * 100}
              onChange={handleProgressSliderChange}
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
      <audio ref={audioElRef}>
        <source src={src} type={type} />
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
