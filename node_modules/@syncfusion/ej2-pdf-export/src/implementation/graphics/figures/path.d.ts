/**
 * Path.ts class for EJ2-PDF
 */
import { PdfBrush } from './../brushes/pdf-brush';
import { PdfPen } from './../pdf-pen';
import { PdfLayoutResult, PdfLayoutFormat } from './../figures/base/element-layouter';
import { PdfGraphics } from './../pdf-graphics';
import { RectangleF, PointF } from './../../drawing/pdf-drawing';
import { PdfPage } from './../../pages/pdf-page';
import { PdfFillElement } from './../figures/base/fill-element';
import { PdfFillMode } from './../enum';
/**
 * `PdfPath` class Implements graphics path, which is a sequence of primitive graphics elements.
 * @private
 */
export declare class PdfPath extends PdfFillElement {
    /**
     * Local variable to store the points.
     * @private
     */
    private mpoints;
    /**
     * Local variable to store the path Types.
     * @private
     */
    private mpathTypes;
    /**
     * Local variable to store the Start Figure.
     * @private
     */
    private mStartFigure;
    /**
     * Local variable to store the fill Mode.
     * @private
     */
    private mfillMode;
    /**
     * Local variable to store the Beziers.
     * @private
     */
    private isBeziers3;
    /**
     * Local variable to store the xps.
     * @private
     */
    private isXps;
    /**
     * Initializes a new instance of the `PdfPath` class.
     * @public
     */
    constructor();
    /**
     * Initializes a new instance of the `PdfPath` class.
     * @public
     */
    constructor(pen: PdfPen);
    /**
     * Initializes a new instance of the `PdfPath` class.
     * @public
     */
    constructor(brush: PdfBrush);
    /**
     * Initializes a new instance of the `PdfPath` class.
     * @public
     */
    constructor(points: PointF[], pathTypes: number[]);
    /**
     * Initializes a new instance of the `PdfPath` class.
     * @public
     */
    constructor(brush: PdfBrush, fillMode: PdfFillMode);
    /**
     * Initializes a new instance of the `PdfPath` class.
     * @public
     */
    constructor(pen: PdfPen, points: PointF[], pathTypes: number[]);
    /**
     * Initializes a new instance of the `PdfPath` class.
     * @public
     */
    constructor(pen: PdfPen, brush: PdfBrush, fillMode: PdfFillMode);
    /**
     * Initializes a new instance of the `PdfPath` class.
     * @public
     */
    constructor(brush: PdfBrush, fillMode: PdfFillMode, points: PointF[], pathTypes: number[]);
    /**
     * Gets or sets the fill mode.
     * @public
     */
    fillMode: PdfFillMode;
    /**
     * Gets the path points.
     * @public
     */
    readonly pathPoints: PointF[];
    /**
     * Gets the path point types.
     * @public
     */
    readonly pathTypes: number[];
    /**
     * Gets the point count.
     * @public
     */
    readonly pointCount: number;
    /**
     * Gets the last points.
     * @public
     */
    readonly lastPoint: PointF;
    /**
     * Gets the points list.
     * @private
     */
    private readonly points;
    /**
     * Gets the types.
     * @private
     */
    private readonly types;
    /**
     * `draw` the element on the page with the specified page and 'PointF' class
     * @param page Current page where the element should be drawn.
     * @param location Start location on the page.
     */
    draw(page: PdfPage, location: PointF): PdfLayoutResult;
    /**
     * `draw` the element on the page with the specified page and pair of coordinates
     * @private
     */
    draw(page: PdfPage, x: number, y: number): PdfLayoutResult;
    /**
     * `draw` the element on the page with the specified page and 'RectangleF' class
     * @private
     */
    draw(page: PdfPage, layoutRectangle: RectangleF): PdfLayoutResult;
    /**
     * `draw` the element on the page with the specified page, 'PointF' class and layout format
     * @private
     */
    draw(page: PdfPage, location: PointF, format: PdfLayoutFormat): PdfLayoutResult;
    /**
     * `draw` the element on the page with the specified page, pair of coordinates and layout format
     * @private
     */
    draw(page: PdfPage, x: number, y: number, format: PdfLayoutFormat): PdfLayoutResult;
    /**
     * `draw` the element on the page.
     * @private
     */
    draw(page: PdfPage, layoutRect: RectangleF, format: PdfLayoutFormat): PdfLayoutResult;
    /**
     * `add a arc` specified by a rectangle, a coordinate start angle and sweepangle.
     * @param rectangle The boundaries of the arc.
     * @param startAngle The start angle of the arc.
     * @param sweepAngle The angle between startAngle and the end of the arc.
     */
    addArc(rectangle: RectangleF, startAngle: number, sweepAngle: number): void;
    /**
     * `add a arc` specified by a x , y coordinate points, a width, a height and coordinate start angle and sweepangle.
     * @param x The x-coordinate of the upper-left corner of the rectangular region.
     * @param y The y-coordinate of the upper-left corner of the rectangular region
     * @param width The width of the rectangular region.
     * @param height The height of the rectangular region.
     * @param startAngle The start angle of the arc.
     * @param sweepAngle The angle between startAngle and the end of the arc.
     */
    addArc(x: number, y: number, width: number, height: number, startAngle: number, sweepAngle: number): void;
    /**
     * `add a bezier curve` specified by region points.
     * @param startPoint The start point - represents the starting point of the curve.
     * @param firstControlPoint The first control point - represents the second control point of the curve.
     * @param secondControlPoint The second control point - represents the second control point of the curve.
     * @param endPoint The end point - represents the end point of the curve.
     */
    addBezier(startPoint: PointF, firstControlPoint: PointF, secondControlPoint: PointF, endPoint: PointF): void;
    /**
     * `add a bezier curve` specified by region points.
     * @param startPointX The start point X.
     * @param startPointY The start point Y.
     * @param firstControlPointX The first control point X.
     * @param firstControlPointY The first control point Y.
     * @param secondControlPointX The second control point X.
     * @param secondControlPointY The second control point Y.
     * @param endPointX The end point X.
     * @param endPointY The end point Y.
     */
    addBezier(startPointX: number, startPointY: number, firstControlPointX: number, firstControlPointY: number, secondControlPointX: number, secondControlPointY: number, endPointX: number, endPointY: number): void;
    /**
     * `add a ellipse` specified by a rectangle.
     * @param rectangle The boundaries of the ellipse.
     */
    addEllipse(rectangle: RectangleF): void;
    /**
     * `add a ellipse` specified by a rectangle bounds .
     * @param x The x-coordinate of the upper-left corner of the rectangular region.
     * @param y The y-coordinate of the upper-left corner of the rectangular region.
     * @param width The width of the rectangular region.
     * @param height The height of the rectangular region.
     */
    addEllipse(x: number, y: number, width: number, height: number): void;
    /**
     * `add a line` specified by points .
     * @param point1 The start point of the line.
     * @param point2 The end point of the line.
     */
    addLine(point1: PointF, point2: PointF): void;
    /**
     * `add a line` specified by a rectangle bounds.
     * @param x1 The x-coordinate of the starting point of the line.
     * @param y1 The y-coordinate of the starting point of the line.
     * @param x2 The x-coordinate of the end point of the line.
     * @param y2 The y-coordinate of the end point of the line.
     */
    addLine(x1: number, y1: number, x2: number, y2: number): void;
    /**
     * `add a path` specified by a path, appends the path specified to this one.
     * @param path The path, which should be appended.
     */
    addPath(path: PdfPath): void;
    /**
     * `add a path` specified by a path points and path types.
     * @param pathPoints The array of points that represents the points to define the path
     * @param pathTypes The path types specifies the types of the corresponding points in the path.
     */
    addPath(pathPoints: PointF[], pathTypes: number[]): void;
    /**
     * `add a pie` specified by a rectangle, a coordinate start angle and sweepangle.
     * @param rectangle The bounding rectangle of the pie.
     * @param startAngle The start angle of the pie.
     * @param sweepAngle The sweep angle of the pie.
     */
    addPie(rectangle: RectangleF, startAngle: number, sweepAngle: number): void;
    /**
     * `add a pie` specified by x , y coordinate points, a width, a height and start angle and sweepangle.
     * @param x The x-coordinate of the upper-left corner of the bounding rectangle.
     * @param y The y-coordinate of the upper-left corner of the bounding rectangle.
     * @param width The width of the bounding rectangle.
     * @param height The height of the bounding rectangle
     * @param startAngle The start angle of the pie.
     * @param sweepAngle The sweep angle of the pie.
     */
    addPie(x: number, y: number, width: number, height: number, startAngle: number, sweepAngle: number): void;
    /**
     * `add a polygon` specified by points.
     * @param points The points of the polygon
     */
    addPolygon(points: PointF[]): void;
    /**
     * `add a rectangle` specified by a rectangle.
     * @param rectangle The rectangle.
     */
    addRectangle(rectangle: RectangleF): void;
    /**
     * `add a rectangle` specified by a rectangle.
     * @param x The x-coordinate of the upper-left corner of the rectangular region.
     * @param y The y-coordinate of the upper-left corner of the rectangular region
     * @param width The width of the rectangular region.
     * @param height The height of the rectangular region.
     */
    addRectangle(x: number, y: number, width: number, height: number): void;
    /**
     * Starts a new figure.
     * @public
     */
    startFigure(): void;
    /**
     * Closed all non-closed figures.
     * @public
     */
    closeAllFigures(): void;
    /**
     * Gets the last point.
     * @public
     */
    getLastPoint(): PointF;
    /**
     * Gets the bezier points for arc constructing.
     * @public
     */
    getBezierArcPoints(x1: number, y1: number, x2: number, y2: number, s1: number, e1: number): number[];
    /**
     * `getBoundsInternal` Returns a rectangle that bounds this element.
     * @public
     */
    getBoundsInternal(): RectangleF;
    /**
     * `drawInternal` Draws an element on the Graphics.
     * @param graphics Graphics context where the element should be printed.
     * @public
     */
    drawInternal(graphics: PdfGraphics): void;
    /**
     * `add a points` Adds the points along with their type to the path.
     * @param points The points.
     * @param pointType Type of the points.
     * @private
     */
    private addPoints;
    /**
     * `add a point` Adds the point and its type
     * @param points The points.
     * @param pointType Type of the points.
     * @private
     */
    private addPoint;
    /**
     * Closes the figure.
     * @public
     */
    closeFigure(): void;
    /**
     * Closes the figure.
     * @param index The index of the last figure point.
     * @public
     */
    closeFigure(index: number): void;
}
