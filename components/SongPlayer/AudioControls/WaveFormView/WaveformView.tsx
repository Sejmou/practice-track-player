import React, { Component } from 'react';
import Peaks from 'peaks.js';
import { Box, Button } from '@mui/material';

import { createPointMarker, createSegmentMarker } from './MarkerFactories';
import { createSegmentLabel } from './SegmentLabelFactory';

import classes from './WaveformView.module.css';

type Props = {
  /**
   * URL pointing to the audio file whose waveform data should be displayed by peaks.js
   *
   * See https://github.com/bbc/peaks.js#generating-waveform-data for details on how peaks.js actually generates and displays the audio waveform
   */
  audioUrl: string;
  audioContentType: string;
  audioElement: HTMLAudioElement;
  setSegments: Function;
  setPoints: Function;
  /**
   * Precomputed binary waveform data for the audio file (.dat extension)
   * generated by https://github.com/bbc/audiowaveform
   * and already processed into an ArrayBuffer
   *
   * used by peaks.js to display the waveforms of the audio
   *
   * If supplied, neither audioContext nor audioBuffer are required
   */
  waveformDataBuffer?: ArrayBuffer;
  /**
   * URI pointing to precomputed waveform data (either binary .dat file or JSON) generated by https://github.com/bbc/audiowaveform
   *
   * peaks.js will use it internally to fetch data from the URI and generate the waveforms
   *
   * Caution: will fail if server serving the waveform data is not on same origin and does not support CORS
   *
   * If supplied, neither audioContext nor audioBuffer are required
   */
  // waveformDataUri?: string; // not supported for now, probably better if peaks just gets waveformdata right away instead of fetching internally
  /**
   * used by peaks.js to generate (and then display) the waveform data from the audio file referenced in audioUrl (=== the audio element's src)
   *
   * peaks will fetch the audio via network internally
   *
   * Caution: if the server serving the audio file (under audioUrl) is not on same origin and does not support CORS, this approach will fail!
   *
   * If supplied, neither waveformDataBuffer nor audioBuffer are required
   */
  audioContext?: AudioContext;
  /**
   * audio data retrieved using decodeData() of some AudioContext
   *
   * used by peaks.js to compute the waveform data on the client
   *
   * If supplied, neither waveformDataBuffer nor audioContext are required
   */
  audioBuffer?: AudioBuffer;
};

// this file and all related files were adapted from https://github.com/chrisn/peaksjs-react-example
// the initial code was written in JS and I have very little knowledge of this library
// so, the code that made all of this kinda work is very ugly and hacky lol
class WaveformView extends Component<Props> {
  constructor(props: Props) {
    super(props);

    this.zoomviewWaveformRef = React.createRef();
    this.overviewWaveformRef = React.createRef();
    // this.audioElementRef = React.createRef();
    this.peaks = null;
  }

  zoomviewWaveformRef: any;
  overviewWaveformRef: any;
  // audioElementRef: any;
  peaks: any;

  render() {
    return (
      <div>
        <div
          className={classes['zoomview-container']}
          ref={this.zoomviewWaveformRef}
        ></div>
        <div
          className={classes['overview-container']}
          ref={this.overviewWaveformRef}
        ></div>

        {/* {this.renderButtons()} */}
      </div>
    );
  }

  renderButtons() {
    return (
      <Box>
        <Button onClick={this.zoomIn}>Zoom in</Button>&nbsp;
        <Button onClick={this.zoomOut}>Zoom out</Button>&nbsp;
        <Button onClick={this.addSegment}>Add Segment</Button>&nbsp;
        <Button onClick={this.addPoint}>Add Point</Button>&nbsp;
        <Button onClick={this.logMarkers}>Log segments/points</Button>
      </Box>
    );
  }

  componentDidMount() {
    this.initPeaks();
  }

  componentDidUpdate(prevProps: Props, prevState: any, snapshot: any) {
    if (this.props.audioUrl === prevProps.audioUrl) {
      return;
    }

    this.initPeaks();
  }

  initPeaks() {
    const viewContainerOptions: Peaks.ViewContainerOptions = {
      containers: {
        overview: this.overviewWaveformRef.current,
        zoomview: this.zoomviewWaveformRef.current,
      },
    };

    const { waveformDataBuffer, audioBuffer, audioContext } = this.props;
    const audioOpts = getPeaksAudioOptions({
      waveformDataBuffer,
      audioBuffer,
      audioContext,
    });

    if (!audioOpts) {
      throw Error(
        'Please provide either waveformData, audioBuffer or audioContext!'
      );
    }

    const optionalOptions: Peaks.OptionalOptions = {
      // mediaElement: this.audioElementRef.current,
      mediaElement: this.props.audioElement,
      keyboard: true,
      logger: console.error.bind(console),
      createSegmentMarker: createSegmentMarker,
      createSegmentLabel: createSegmentLabel,
      createPointMarker: createPointMarker,
    };

    const options: Peaks.PeaksOptions = {
      ...viewContainerOptions,
      ...optionalOptions,
      ...audioOpts,
    };

    // this.audioElementRef!.current!.src = this.props.audioUrl;

    if (this.peaks) {
      this.peaks.destroy();
      this.peaks = null;
    }

    Peaks.init(options, (err, peaks) => {
      this.peaks = peaks;
      this.onPeaksReady();
    });
  }

  componentWillUnmount() {
    if (this.peaks) {
      this.peaks.destroy();
    }
  }

  zoomIn() {
    if (this.peaks) {
      this.peaks.zoom.zoomIn();
    }
  }

  zoomOut() {
    if (this.peaks) {
      this.peaks.zoom.zoomOut();
    }
  }

  addSegment() {
    if (this.peaks) {
      const time = this.peaks.player.getCurrentTime();

      this.peaks.segments.add({
        startTime: time,
        endTime: time + 10,
        labelText: 'Test Segment',
        editable: true,
      });
    }
  }

  addPoint() {
    if (this.peaks) {
      const time = this.peaks.player.getCurrentTime();

      this.peaks.points.add({
        time: time,
        labelText: 'Test Point',
        editable: true,
      });
    }
  }

  logMarkers() {
    if (this.peaks) {
      this.props.setSegments(this.peaks.segments.getSegments());
      this.props.setPoints(this.peaks.points.getPoints());
    }
  }

  onPeaksReady() {
    // Do something when the Peaks instance is ready for use
    console.log('Peaks.js is ready');
  }
}

export default WaveformView;

function getPeaksAudioOptions({
  waveformDataBuffer,
  audioBuffer,
  audioContext,
}: {
  waveformDataBuffer: ArrayBuffer | undefined;
  audioBuffer: AudioBuffer | undefined;
  audioContext: AudioContext | undefined;
}): Peaks.AudioOptions | undefined {
  if (waveformDataBuffer) {
    return {
      waveformData: {
        arraybuffer: waveformDataBuffer,
      },
    };
  }
  if (audioBuffer) {
    return {
      webAudio: {
        audioBuffer,
      },
    };
  }
  if (audioContext) {
    return {
      webAudio: {
        audioContext,
      },
    };
  }
}
