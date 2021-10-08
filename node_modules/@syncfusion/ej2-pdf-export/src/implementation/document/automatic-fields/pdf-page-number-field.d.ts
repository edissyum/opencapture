/**
 * PdfPageNumberField.ts class for EJ2-PDF
 */
import { PdfFont } from './../../graphics/fonts/pdf-font';
import { PdfBrush } from './../../graphics/brushes/pdf-brush';
import { PdfPage } from './../../pages/pdf-page';
import { PdfGraphics } from './../../graphics/pdf-graphics';
import { RectangleF } from './../../drawing/pdf-drawing';
import { PdfNumberStyle } from './../../pages/enum';
import { PdfMultipleValueField } from './multiple-value-field';
/**
 * Represents PDF document `page number field`.
 * @public
 */
export declare class PdfPageNumberField extends PdfMultipleValueField {
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
     * Stores the number style of the page number field.
     * @private
     */
    private internalNumberStyle;
    /**
     * Gets and sets the number style of the page number field.
     * @private
     */
    numberStyle: PdfNumberStyle;
    /**
     * Return the `string` value of page number field.
     * @public
     */
    getValue(graphics: PdfGraphics): string;
    /**
     * Internal method to `get actual value of page number`.
     * @private
     */
    protected internalGetValue(page: PdfPage): string;
}
