/**
 * PdfShapeElement.ts class for EJ2-PDF
 * @private
 */
import { PdfLayoutResult, PdfLayoutParams } from './element-layouter';
import { RectangleF, PointF } from './../../../drawing/pdf-drawing';
import { PdfLayoutElement } from './../layout-element';
import { PdfGraphics } from './../../pdf-graphics';
/**
 * Base class for the main shapes.
 * @private
 */
export declare abstract class PdfShapeElement extends PdfLayoutElement {
    /**
     * Gets the bounds.
     * @private
     */
    getBounds(): RectangleF;
    /**
     * `drawGraphicsHelper` the graphics.
     * @public
     */
    drawGraphicsHelper(graphics: PdfGraphics, location: PointF): void;
    /**
     * `drawShapeHelper` the graphics.
     * @private
     */
    private drawShapeHelper;
    protected abstract drawInternal(graphics: PdfGraphics): void;
    /**
     * Returns a rectangle that bounds this element.
     * @private
     */
    protected abstract getBoundsInternal(): RectangleF;
    /**
     * Layouts the element.
     * @private
     */
    protected layout(param: PdfLayoutParams): PdfLayoutResult;
}
