/**
 * PdfFillElement.ts class for EJ2-PDF
 */
import { PdfDrawElement } from './draw-element';
import { PdfPen } from './../../pdf-pen';
import { PdfBrush } from './../../brushes/pdf-brush';
/**
 * Represents a base class for all page graphics elements.
 */
export declare abstract class PdfFillElement extends PdfDrawElement {
    /**
     * Internal variable to store pen.
     * @private
     */
    private mbrush;
    /**
     * Initializes a new instance of the `PdfFillElement` class.
     * @protected
     */
    protected constructor();
    /**
     * Initializes a new instance of the `PdfFillElement` class.
     * @protected
     */
    protected constructor(pen: PdfPen);
    /**
     * Initializes a new instance of the `PdfFillElement` class.
     * @protected
     */
    protected constructor(brush: PdfBrush);
    /**
     * Initializes a new instance of the `PdfFillElement` class.
     * @protected
     */
    protected constructor(pen: PdfPen, brush: PdfBrush);
    /**
     * Gets or sets a brush of the element.
     * @public
     */
    brush: PdfBrush;
    /**
     * Gets the pen. If both pen and brush are not explicitly defined, default pen will be used.
     * @protected
     */
    protected obtainPen(): PdfPen;
}
