/**
 * ellipse-part.ts class for EJ2-PDF
 */
import { PdfBrush } from './../brushes/pdf-brush';
import { PdfPen } from './../pdf-pen';
import { RectangleF } from './../../drawing/pdf-drawing';
import { PdfRectangleArea } from './rectangle-area';
/**
 * `PdfEllipsePart` class Implements graphics ellipse part, which is a sequence of primitive graphics elements.
 * @private
 */
export declare abstract class PdfEllipsePart extends PdfRectangleArea {
    /**
     * public variable to store the start angle.
     * @public
     */
    startAngle: number;
    /**
     * public variable to store the sweep angle.
     * @public
     */
    sweepAngle: number;
    /**
     * Initializes a new instance of the `PdfEllipsePart` class.
     * @protected
     */
    protected constructor();
    /**
     * Initializes a new instance of the `PdfEllipsePart` class.
     * @protected
     */
    protected constructor(x: number, y: number, width: number, height: number, startAngle: number, sweepAngle: number);
    /**
     * Initializes a new instance of the `PdfEllipsePart` class.
     * @protected
     */
    protected constructor(rectangle: RectangleF, startAngle: number, sweepAngle: number);
    /**
     * Initializes a new instance of the `PdfEllipsePart` class.
     * @protected
     */
    protected constructor(pen: PdfPen, brush: PdfBrush, x: number, y: number, width: number, height: number, startAngle: number, sweepAngle: number);
    /**
     * Initializes a new instance of the `PdfEllipsePart` class.
     * @protected
     */
    protected constructor(pen: PdfPen, brush: PdfBrush, rectangle: RectangleF, startAngle: number, sweepAngle: number);
}
