import React, { Component } from 'react';
import { Box, Button } from '@mui/material';

import { createPointMarker, createSegmentMarker } from './MarkerFactories';
import { createSegmentLabel } from './SegmentLabelFactory';

import classes from './WaveformView.module.css';
import Peaks from 'peaks.js';

type Props = {
  audioUrl: string;
  audioContentType: string;
  waveformDataUrl?: string;
  audioContext?: AudioContext;
  audioElement: HTMLAudioElement;
  setSegments: Function;
  setPoints: Function;
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
    console.log('WaveformView.render, current props:', this.props);

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

        {/* <audio ref={this.audioElementRef} controls>
          <source
            src={this.props.audioUrl}
            type={this.props.audioContentType}
          />
          Your browser does not support the audio element.
        </audio> */}

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
    console.log('WaveformComponent.componentDidMount');

    this.initPeaks();
  }

  componentDidUpdate(prevProps: Props, prevState: any, snapshot: any) {
    console.log('WaveformComponent.componentDidUpdate');

    if (this.props.audioUrl === prevProps.audioUrl) {
      return;
    }

    console.log('props', this.props);
    console.log('prevProps', prevProps);

    this.initPeaks();
  }

  initPeaks() {
    const viewContainerOptions: Peaks.ViewContainerOptions = {
      containers: {
        overview: this.overviewWaveformRef.current,
        zoomview: this.zoomviewWaveformRef.current,
      },
    };

    let webAudioOpts: Peaks.WebAudioOptions | null = null;

    if (this.props.audioContext) {
      webAudioOpts = {
        webAudio: {
          audioContext: this.props.audioContext,
        },
      };
    }

    let remoteWaveformDataOpts: Peaks.RemoteWaveformDataOptions | null = null;

    if (this.props.waveformDataUrl) {
      remoteWaveformDataOpts = {
        dataUri: {
          arraybuffer: this.props.waveformDataUrl,
        },
      };
    }

    const audioOpts = webAudioOpts
      ? webAudioOpts
      : remoteWaveformDataOpts
      ? remoteWaveformDataOpts
      : null;
    if (!audioOpts) {
      throw Error('Please provide either waveformDataUrl or audioContext!');
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
    console.log('WaveformView.componentWillUnmount');

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
