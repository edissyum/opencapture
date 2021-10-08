/**
 * PdfPageCountField.ts class for EJ2-PDF
 */
import { PdfSingleValueField } from './single-value-field';
import { PdfNumberStyle } from './../../pages/enum';
import { PdfFont } from './../../graphics/fonts/pdf-font';
import { PdfBrush } from './../../graphics/brushes/pdf-brush';
import { RectangleF } from './../../drawing/pdf-drawing';
import { PdfGraphics } from './../../graphics/pdf-graphics';
/**
 * Represents total PDF document page count automatic field.
 */
export declare class PdfPageCountField extends PdfSingleValueField {
    /**
     * Stores the number style of the field.
     * @private
     */
    private internalNumberStyle;
    /**
     * Initialize a new instance for page number field.
     * @public
     */
    constructor(font: PdfFont);
    /**
     * Initialize a new instance for page number field.
     * @public
     */
    constructor(font: PdfFont, bounds: RectangleF);
    /**
     * Initialize a new instance for page number field.
     * @public
     */
    constructor(font: PdfFont, brush: PdfBrush);
    /**
     * Gets and sets the number style of the field.
     * @public
     */
    numberStyle: PdfNumberStyle;
    /**
     * Return the actual value of the content to drawn.
     * @public
     */
    getValue(graphics: PdfGraphics): string;
}
