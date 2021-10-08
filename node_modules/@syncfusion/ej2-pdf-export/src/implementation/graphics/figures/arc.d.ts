/**
 * arc.ts class for EJ2-PDF
 */
import { PdfPen } from './../pdf-pen';
import { PdfLayoutResult, PdfLayoutFormat } from './../figures/base/element-layouter';
import { PdfGraphics } from './../pdf-graphics';
import { RectangleF, PointF } from './../../drawing/pdf-drawing';
import { PdfPage } from './../../pages/pdf-page';
import { PdfEllipsePart } from './../figures/ellipse-part';
/**
 * `PdfArc` class Implements graphics arc, which is a sequence of primitive graphics elements.
 * @private
 */
export declare class PdfArc extends PdfEllipsePart {
    /**
     * Initializes a new instance of the `PdfArc` class.
     * @public
     */
    constructor();
    /**
     * Initializes a new instance of the `PdfArc` class.
     * @public
     */
    constructor(width: number, height: number, startAngle: number, sweepAngle: number);
    /**
     * Initializes a new instance of the `PdfArc` class.
     * @public
     */
    constructor(pen: PdfPen, rectangle: RectangleF, startAngle: number, sweepAngle: number);
    /**
     * Initializes a new instance of the `PdfArc` class.
     * @public
     */
    constructor(pen: PdfPen, x: number, y: number, width: number, height: number, startAngle: number, sweepAngle: number);
    /**
     * Initializes a new instance of the `PdfArc` class.
     * @public
     */
    constructor(pen: PdfPen, width: number, height: number, startAngle: number, sweepAngle: number);
    /**
     * Initializes a new instance of the `PdfArc` class.
     * @public
     */
    constructor(x: number, y: number, width: number, height: number, startAngle: number, sweepAngle: number);
    /**
     * Initializes a new instance of the `PdfArc` class.
     * @public
     */
    constructor(rectangle: RectangleF, startAngle: number, sweepAngle: number);
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
     * `drawInternal` Draws an element on the Graphics.
     * @param graphics Graphics context where the element should be printed.
     *
     */
    drawInternal(graphics: PdfGraphics): void;
}
