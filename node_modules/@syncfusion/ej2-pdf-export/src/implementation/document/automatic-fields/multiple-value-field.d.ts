/**
 * PdfAutomaticField.ts class for EJ2-PDF
 */
import { PdfAutomaticField } from './automatic-field';
import { PdfGraphics } from './../../graphics/pdf-graphics';
import { PointF } from './../../drawing/pdf-drawing';
/**
 * Represents automatic field which has the same value within the `PdfGraphics`.
 */
export declare abstract class PdfMultipleValueField extends PdfAutomaticField {
    /**
     * Stores the instance of dictionary values of `graphics and template value pair`.
     * @private
     */
    private list;
    constructor();
    performDraw(graphics: PdfGraphics, location: PointF, scalingX: number, scalingY: number): void;
}
