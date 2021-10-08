/**
 * PdfGraphicsElement.ts class for EJ2-PDF
 */
import { PdfGraphics } from './../../pdf-graphics';
/**
 * Represents a base class for all page graphics elements.
 */
export declare abstract class PdfGraphicsElement {
    protected constructor();
    /**
     * `Draws` the page number field.
     * @public
     */
    drawHelper(graphics: PdfGraphics, x: number, y: number): void;
    protected abstract drawInternal(graphics: PdfGraphics): void;
}
