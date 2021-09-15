/**
 * PdfCompositeField.ts class for EJ2-PDF
 */
import { PdfMultipleValueField } from './multiple-value-field';
import { PdfAutomaticField } from './automatic-field';
import { PdfFont } from './../../graphics/fonts/pdf-font';
import { PdfBrush } from './../../graphics/brushes/pdf-brush';
import { PdfGraphics } from './../../graphics/pdf-graphics';
/**
 * Represents class which can concatenate multiple automatic fields into single string.
 */
export declare class PdfCompositeField extends PdfMultipleValueField {
    /**
     * Stores the array of automatic fields.
     * @private
     */
    private internalAutomaticFields;
    /**
     * Stores the text value of the field.
     * @private
     */
    private internalText;
    /**
     * Initialize a new instance of `PdfCompositeField` class.
     * @param font Font of the field.
     * @param brush Color of the field.
     * @param text Content of the field.
     * @param list List of the automatic fields in specific order based on the text content.
     */
    constructor(font: PdfFont, brush: PdfBrush, text: string, ...list: PdfAutomaticField[]);
    /**
     * Gets and sets the content of the field.
     * @public
     */
    text: string;
    /**
     * Gets and sets the list of the field to drawn.
     * @public
     */
    automaticFields: PdfAutomaticField[];
    /**
     * Return the actual value generated from the list of automatic fields.
     * @public
     */
    getValue(graphics: PdfGraphics): string;
}
