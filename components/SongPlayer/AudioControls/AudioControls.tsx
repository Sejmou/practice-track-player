import { useEffect, useState, useRef, useMemo, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { Box, SxProps, useTheme } from '@mui/material';

import { SourceData } from '@models';
import {
  KeyboardShortcuts,
  KeyboardShortcut,
} from '@frontend/keyboard-shortcuts';
import PlaybackRateSlider from './PlaybackRateSlider';
import BasicControls from './BasicControls';
import { PeaksInstance } from 'peaks.js';
import WaveformViewZoomControls from './WaveformViewZoomControls';

const WaveFormView = dynamic(() => import('./WaveFormView/WaveformView'), {
  ssr: false,
});

const shortcuts = new KeyboardShortcuts();

const controlsContainerStyles: SxProps = {
  display: 'grid',
  width: '100%',
  gridAutoColumns: 'minmax(0, 1fr)', // this makes columns exactly the same width https://stackoverflow.com/a/61240964/13727176
  gridTemplateAreas: {
    xs: '"zoom pbr pbr" "basic basic basic"',
    sm: '"zoom basic  pbr"',
  },
};

const basicControlsStyles: SxProps = {
  gridArea: 'basic',
};

const playbackRatePickerStyles: SxProps = {
  gridArea: 'pbr',
};

const zoomControlsStyles: SxProps = {
  gridArea: 'zoom',
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
  const [peaks, setPeaks] = useState<PeaksInstance>();
  const [zoomLevel, setZoomLevel] = useState(0);

  const peaksLoadedHandler = (peaks: PeaksInstance) => {
    setPeaks(peaks);
    setZoomLevel(peaks.zoom.getZoom());
  };

  const handlePlayPauseToggle = () => {
    setIsPlaying(previous => !previous);
  };

  const handleZoomIn = () => {
    if (peaks) {
      peaks.zoom.zoomIn();
      setZoomLevel(peaks.zoom.getZoom());
      console.log(peaks.zoom.getZoom());
    }
  };

  const handleZoomOut = () => {
    if (peaks) {
      peaks.zoom.zoomOut();
      setZoomLevel(peaks.zoom.getZoom());
    }
  };

  const handlePrevious = useCallback(() => {
    console.log(audioRef.current);
    console.log(audioRef.current?.currentTime);
    if (audioRef.current && audioRef.current.currentTime > 1) {
      // picked some arbitrary value a little bit larger than 0 to allow for going to previous song by double-clicking
      console.log(audioRef.current.currentTime);
      audioRef.current.currentTime = 0;
    } else {
      console.log('go to previous');
      onPrevious();
    }
  }, [onPrevious]);

  const zoomOutEnabled = useMemo(() => {
    if (!peaks) {
      return false;
    }
    return zoomLevel < 3;
  }, [peaks, zoomLevel]);

  const zoomInEnabled = useMemo(() => {
    if (!peaks) {
      return false;
    }
    return zoomLevel > 0;
  }, [peaks, zoomLevel]);

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

  const theme = useTheme();
  const primaryColor = useMemo(() => theme.palette.primary.main, [theme]);

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
          waveformZoomviewColor={primaryColor}
          onPeaksReady={peaksLoadedHandler}
        />
      )}
      <Box sx={controlsContainerStyles}>
        <WaveformViewZoomControls
          onZoomIn={handleZoomIn}
          onZoomOut={handleZoomOut}
          zoomInEnabled={zoomInEnabled}
          zoomOutEnabled={zoomOutEnabled}
          sx={zoomControlsStyles}
        />
        <BasicControls
          previousAvailable={previousAvailable}
          nextAvailable={nextAvailable}
          playing={isPlaying}
          onNext={onNext}
          onPrevious={handlePrevious}
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
