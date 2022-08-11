import { Label, Tag } from 'konva/lib/shapes/Label';
import { Line } from 'konva/lib/shapes/Line';
import { Text } from 'konva/lib/shapes/Text';

class CustomPointMarker {
  constructor(options: any) {
    this.options = options;
  }

  private options: any;
  private group: any;
  private label: any;
  private tag: any;
  private text: any;
  private line: any;

  init(group: any) {
    this.group = group;

    this.label = new Label({
      x: 0.5,
      y: 0.5,
    });

    this.tag = new Tag({
      fill: this.options.color,
      stroke: this.options.color,
      strokeWidth: 1,
      pointerDirection: 'down',
      pointerWidth: 10,
      pointerHeight: 10,
      lineJoin: 'round',
      shadowColor: 'black',
      shadowBlur: 10,
      shadowOffsetX: 3,
      shadowOffsetY: 3,
      shadowOpacity: 0.3,
    });

    this.label.add(this.tag);

    this.text = new Text({
      text: this.options.point.labelText,
      fontFamily: 'Calibri',
      fontSize: 14,
      padding: 5,
      fill: 'white',
    });

    this.label.add(this.text);

    // Vertical Line - create with default y and points, the real values
    // are set in fitToView().
    this.line = new Line({
      x: 0,
      y: 0,
      stroke: this.options.color,
      strokeWidth: 1,
    });

    group.add(this.label);
    group.add(this.line);

    this.fitToView();

    this.bindEventHandlers();
  }

  bindEventHandlers() {
    this.group.on('mouseenter', () => {
      document.body.style.cursor = 'move';
    });

    this.group.on('mouseleave', () => {
      document.body.style.cursor = 'default';
    });
  }

  fitToView() {
    const height = this.options.layer.getHeight();

    const labelHeight = this.text.height() + 2 * this.text.padding();
    const offsetTop = 14;
    const offsetBottom = 26;

    this.group.y(offsetTop + labelHeight + 0.5);

    this.line.points([
      0.5,
      0,
      0.5,
      height - labelHeight - offsetTop - offsetBottom,
    ]);
  }
}

export default CustomPointMarker;
