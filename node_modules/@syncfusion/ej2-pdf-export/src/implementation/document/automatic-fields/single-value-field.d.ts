/**
 * PdfSingleValueField.ts class for EJ2-PDF
 */
import { PdfAutomaticField } from './automatic-field';
import { PdfGraphics } from './../../graphics/pdf-graphics';
import { PointF } from './../../drawing/pdf-drawing';
/**
 * Represents automatic field which has the same value in the whole document.
 */
export declare abstract class PdfSingleValueField extends PdfAutomaticField {
    private list;
    private painterGraphics;
    constructor();
    performDraw(graphics: PdfGraphics, location: PointF, scalingX: number, scalingY: number): void;
}
