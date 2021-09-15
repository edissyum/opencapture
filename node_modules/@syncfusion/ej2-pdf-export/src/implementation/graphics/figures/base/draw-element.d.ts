/**
 * PdfDrawElement.ts class for EJ2-PDF
 */
import { PdfShapeElement } from './pdf-shape-element';
import { PdfPen } from './../../pdf-pen';
/**
 * Represents a base class for all page graphics elements.
 */
export declare abstract class PdfDrawElement extends PdfShapeElement {
    /**
     * Internal variable to store pen.
     * @private
     */
    private mpen;
    /**
     * Initializes a new instance of the `PdfDrawElement` class.
     * @protected
     */
    protected constructor();
    /**
     * Initializes a new instance of the `PdfDrawElement` class.
     * @protected
     */
    protected constructor(pen: PdfPen);
    /**
     * Gets or sets a pen that will be used to draw the element.
     * @public
     */
    pen: PdfPen;
}
