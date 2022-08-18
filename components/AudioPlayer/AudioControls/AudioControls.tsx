import {
  useEffect,
  useState,
  useRef,
  useMemo,
  useCallback,
  KeyboardEvent,
} from 'react';
import dynamic from 'next/dynamic';
import { Box, SxProps, useTheme } from '@mui/material';

import { SourceData } from '@models';
import PlaybackRateSlider from './PlaybackRateSlider';
import BasicControls from './BasicControls';
import { PeaksInstance } from 'peaks.js';
import WaveformViewZoomControls from './WaveformViewZoomControls';
import React from 'react';
import { useKeyboardShortcuts } from '@frontend/hooks/use-keyboard-shortcuts';
import { WaveformViewPoint } from './WaveFormView/WaveformView';
import SuspenseContainer from '@components/SuspenseContainer/SuspenseContainer';

const WaveFormView = dynamic(() => import('./WaveFormView/WaveformView'), {
  ssr: false,
});

const controlsContainerStyles: SxProps = {
  display: 'grid',
  width: '100%',
  gridAutoColumns: 'minmax(0, 1fr)', // this makes columns exactly the same width https://stackoverflow.com/a/61240964/13727176
  gridTemplateAreas: {
    xs: '"zoom pbr pbr" "basic basic basic"',
    sm: '"zoom basic  pbr"',
  },
  mt: 1,
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
  /**
   * The number of seconds the controls should seek to
   *
   * Every time this prop changes, the controls seek their audioElement to the new value
   *
   */
  seekTime?: number;
  points?: WaveformViewPoint[];
};

const AudioControls = React.forwardRef<HTMLDivElement, Props>(
  (
    {
      // TODO: improve perfomance of this; current code is probably not very efficient I guess
      audioContext,
      audioElSrcData,
      audioBuffer,
      waveformDataBuffer,
      nextAvailable,
      previousAvailable,
      onNext,
      onPrevious,
      seekTime,
      points,
    }: Props,
    ref
  ) => {
    const [isPlaying, setIsPlaying] = useState(false);
    // isReady state is actually irrelevant, I'm just abusing useState to trigger a rerender once the audio element's metadata is loaded
    const [isReady, setIsReady] = useState(false);
    const [playbackRate, setPlaybackRate] = useState(1);
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const sliderRef = useRef<HTMLInputElement>(null);
    const [peaks, setPeaks] = useState<PeaksInstance>();
    const [zoomLevel, setZoomLevel] = useState(0);

    const maxPlaybackRate = 1;
    const minPlaybackRate = 0.5;

    const handlePeaksLoaded = useCallback((peaks: PeaksInstance) => {
      setPeaks(peaks);
      setZoomLevel(peaks.zoom.getZoom());
    }, []);

    const handleMetadataLoaded = () => {
      setIsReady(true);
    };

    const handlePlayPauseToggle = () => {
      setIsPlaying(previous => !previous);
    };

    const handleZoomIn = () => {
      if (peaks) {
        peaks.zoom.zoomIn();
        setZoomLevel(peaks.zoom.getZoom());
      }
    };

    const handleZoomOut = () => {
      if (peaks) {
        peaks.zoom.zoomOut();
        setZoomLevel(peaks.zoom.getZoom());
      }
    };

    const handlePrevious = useCallback(() => {
      if (audioRef.current && audioRef.current.currentTime > 1) {
        // picked some arbitrary value a little bit larger than 0 to allow for going to previous song by double-clicking
        audioRef.current.currentTime = 0;
      } else {
        onPrevious();
        setIsPlaying(false);
      }
    }, [onPrevious]);

    const handleBackward5 = useCallback(() => {
      if (audioRef.current) {
        audioRef.current.currentTime = Math.max(
          audioRef.current.currentTime - 5,
          0
        );
      }
    }, []);

    const handleForward5 = useCallback(() => {
      if (audioRef.current) {
        audioRef.current.currentTime = Math.min(
          audioRef.current.currentTime + 5,
          audioRef.current.duration
        );
      }
    }, []);

    const handleNext = useCallback(() => {
      onNext();
      setIsPlaying(false);
    }, [onNext]);

    const handlePlaybackRateChange = useCallback(
      (pbr: number) => setPlaybackRate(pbr),
      []
    );

    const handlePlaybackRateIncrease = useCallback(() => {
      setPlaybackRate(prev => Math.min(prev + 0.05, 1));
    }, []);

    const handlePlaybackRateDecrease = useCallback(() => {
      setPlaybackRate(prev => Math.max(prev - 0.05, 0.5));
    }, []);

    useKeyboardShortcuts([
      [
        { key: ' ' },
        event => {
          // spacebar causes page scroll per default -> we don't want that!
          handlePlayPauseToggle();
          event.preventDefault();
        },
      ],
      [{ key: 'ArrowLeft' }, handleBackward5],
      [{ key: 'ArrowRight' }, handleForward5],
      [{ key: '-' }, handlePlaybackRateDecrease],
      [{ key: '+' }, handlePlaybackRateIncrease],
      [
        { key: '-', ctrlKey: true },
        ev => {
          ev.preventDefault();
          handleZoomOut();
        },
      ], // TODO: implement with mouse wheel scroll
      [
        { key: '+', ctrlKey: true },
        ev => {
          ev.preventDefault();
          handleZoomIn();
        },
      ],
      [{ key: 'ArrowLeft', ctrlKey: true }, handlePrevious],
      [{ key: 'ArrowRight', ctrlKey: true }, handleNext],
    ]);

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
      const audio = new Audio(audioElSrcData.src);
      audio.load();
      audio.addEventListener('canplaythrough', () =>
        console.log('can play through')
      );
      audio.addEventListener('loadedmetadata', handleMetadataLoaded);

      audioRef.current = audio;
    }, [audioElSrcData]);

    useEffect(() => {
      if (audioRef.current) {
        audioRef.current.playbackRate = playbackRate;
      }
    }, [playbackRate]);

    useEffect(() => {
      if (isPlaying) {
        audioRef.current?.play();
      } else {
        audioRef.current?.pause();
      }
    }, [isPlaying]);

    useEffect(() => {
      if (audioRef.current && seekTime) {
        audioRef.current.currentTime = seekTime;
      }
    }, [seekTime]);

    const theme = useTheme();
    const primaryColor = useMemo(() => theme.palette.primary.main, [theme]);

    return (
      <Box>
        {(audioRef.current && (
          <WaveFormView
            audioElement={audioRef.current}
            waveformDataBuffer={waveformDataBuffer}
            audioUrl={audioElSrcData.src}
            audioContext={audioContext}
            audioBuffer={audioBuffer}
            waveformZoomviewColor={primaryColor}
            onPeaksReady={handlePeaksLoaded}
            points={points}
          />
        )) || (
          <SuspenseContainer
            height={'309px'}
            status="loading"
            loadingMessage="Loading audio"
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
            onNext={handleNext}
            onPrevious={handlePrevious}
            onForward5={handleForward5}
            onBackward5={handleBackward5}
            onPlayPause={handlePlayPauseToggle}
            sx={basicControlsStyles}
          />
          <PlaybackRateSlider
            ref={sliderRef}
            sx={playbackRatePickerStyles}
            playbackRate={playbackRate}
            min={minPlaybackRate}
            max={maxPlaybackRate}
            onPlaybackRateChange={handlePlaybackRateChange}
          />
        </Box>
      </Box>
    );
  }
);

AudioControls.displayName = 'AudioControls';

export default AudioControls;

function createKeybindingMapKey(
  props: Pick<KeyboardEvent, 'key'> &
    Partial<Pick<KeyboardEvent, 'altKey' | 'ctrlKey' | 'metaKey' | 'shiftKey'>>
) {
  const { key, altKey, ctrlKey, metaKey, shiftKey } = props;
  return [key, !!altKey, !!ctrlKey, !!metaKey, !!shiftKey].join();
}
