import { Line } from 'konva/lib/shapes/Line';

class SimplePointMarker {
  constructor(options: any) {
    this.options = options;
  }

  private options: any;
  private group: any;
  private _line: any;

  init(group: any) {
    this.group = group;

    // Vertical Line - create with default y and points, the real values
    // are set in fitToView().
    this._line = new Line({
      x: 0,
      y: 0,
      stroke: this.options.color,
      strokeWidth: 1,
    });

    group.add(this._line);

    this.fitToView();
  }
  fitToView() {
    const height = this.options.layer.getHeight();

    this._line.points([0.5, 0, 0.5, height]);
  }
}

export default SimplePointMarker;
