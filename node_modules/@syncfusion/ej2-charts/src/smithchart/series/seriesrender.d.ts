import { Smithchart } from '../../smithchart';
import { SmithchartRect, Point, LineSegment, PointRegion } from '../../smithchart/utils/utils';
import { AxisRender } from '../../smithchart/axis/axisrender';
export declare class SeriesRender {
    xValues: number[];
    yValues: number[];
    pointsRegion: PointRegion[][];
    lineSegments: LineSegment[];
    location: Point[][];
    clipRectElement: Element;
    private dataLabel;
    private processData;
    draw(smithchart: Smithchart, axisRender: AxisRender, bounds: SmithchartRect): void;
    private drawSeries;
    private animateDataLabelTemplate;
    private performAnimation;
    getLocation(seriesindex: number, pointIndex: number): Point;
}
