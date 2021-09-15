/**
 * RectangleArea.ts class for EJ2-PDF
 */
import { PdfBrush } from './../brushes/pdf-brush';
import { PdfPen } from './../pdf-pen';
import { RectangleF } from './../../drawing/pdf-drawing';
import { PdfFillElement } from './../figures/base/fill-element';
/**
 * `PdfRectangleArea` class Implements graphics rectangle area, which is a sequence of primitive graphics elements.
 * @private
 */
export declare abstract class PdfRectangleArea extends PdfFillElement {
    /**
     * public variable to store the rectangle.
     * @public
     */
    bounds: RectangleF;
    /**
     * Initializes a new instance of the `PdfRectangleArea` class.
     * @protected
     */
    protected constructor();
    /**
     * Initializes a new instance of the `PdfRectangleArea` class.
     * @protected
     */
    protected constructor(rectangle: RectangleF);
    /**
     * Initializes a new instance of the `PdfRectangleArea` class.
     * @protected
     */
    protected constructor(pen: PdfPen, brush: PdfBrush, rectangle: RectangleF);
    /**
     * Initializes a new instance of the `PdfRectangleArea` class.
     * @protected
     */
    protected constructor(x: number, y: number, width: number, height: number);
    /**
     * Initializes a new instance of the `PdfRectangleArea` class.
     * @protected
     */
    protected constructor(pen: PdfPen, brush: PdfBrush, x: number, y: number, width: number, height: number);
    /**
     * Gets or sets the X co-ordinate of the upper-left corner of this the element.
     * @public
     */
    x: number;
    /**
     * Gets or sets the Y co-ordinate of the upper-left corner of this the element.
     * @public
     */
    y: number;
    /**
     * Gets or sets the width of this element.
     * @public
     */
    width: number;
    /**
     * Gets or sets the height of this element.
     * @public
     */
    height: number;
    protected getBoundsInternal(): RectangleF;
}
