import CustomPointMarker from './CustomPointMarker';
import SimplePointMarker from './SimplePointMarker';
import CustomSegmentMarker from './CustomSegmentMarker';
import { CreatePointMarkerOptions, CreateSegmentMarkerOptions } from 'peaks.js';

export function createPointMarker(options: CreatePointMarkerOptions) {
  if (options.view === 'zoomview') {
    return new CustomPointMarker(options);
  } else {
    return new SimplePointMarker(options);
  }
}

export function createSegmentMarker(options: CreateSegmentMarkerOptions) {
  // if (options.view === 'zoomview') {
  //   return new CustomSegmentMarker(options);
  // }

  // return null;
  return new CustomSegmentMarker(options);
}
