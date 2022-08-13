import { useEffect, useState, useRef } from 'react';
import dynamic from 'next/dynamic';
import { Box, SxProps } from '@mui/material';

import { SourceData } from '@models';
import {
  KeyboardShortcuts,
  KeyboardShortcut,
} from '@frontend/keyboard-shortcuts';
import PlaybackRateSlider from './PlaybackRateSlider';
import BasicControls from './BasicControls';

const WaveFormView = dynamic(() => import('./WaveFormView/WaveformView'), {
  ssr: false,
});

const shortcuts = new KeyboardShortcuts();

const controlsContainerStyles: SxProps = {
  display: 'grid',
  width: '100%',
  gridAutoColumns: 'minmax(0, 1fr)', // this makes columns exactly the same width https://stackoverflow.com/a/61240964/13727176
  gridTemplateAreas: { xs: '"pbr" "basic"', sm: '"1fr basic  pbr"' },
};

const basicControlsStyles: SxProps = {
  gridArea: 'basic',
};

const playbackRatePickerStyles: SxProps = {
  gridArea: 'pbr',
};

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
  onNext: () => void;
  onPrevious: () => void;
};
const AudioControls = ({
  // TODO: improve perfomance of this; current code is probably not very efficient I guess
  audioContext,
  audioElSrcData,
  audioBuffer,
  waveformDataBuffer,
  nextAvailable,
  previousAvailable,
  onNext,
  onPrevious,
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
      <Box sx={controlsContainerStyles}>
        <BasicControls
          previousAvailable={previousAvailable}
          nextAvailable={nextAvailable}
          playing={isPlaying}
          onNext={onNext}
          onPrevious={onPrevious}
          onPlayPause={() => setIsPlaying(prev => !prev)}
          sx={basicControlsStyles}
        />
        <PlaybackRateSlider
          sx={playbackRatePickerStyles}
          playbackRate={playbackRate}
          onPlaybackRateChange={pbr => setPlaybackRate(pbr)}
        />
      </Box>
      {/* As we have no controls attribute on the audio element, it is invisible, which is what we want here */}
      <audio ref={audioRef} onLoadedMetadata={metadataLoadedHandler}>
        <source src={audioElSrcData.src} />
      </audio>
    </div>
  );
};
export default AudioControls;