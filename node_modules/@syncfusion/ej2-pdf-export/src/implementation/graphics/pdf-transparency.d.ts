/**
 * PdfTransparency.ts class for EJ2-PDF
 */
import { IPdfWrapper } from './../../interfaces/i-pdf-wrapper';
import { IPdfPrimitive } from './../../interfaces/i-pdf-primitives';
import { PdfBlendMode } from './../graphics/enum';
/**
 * Represents a simple `transparency`.
 * @private
 */
export declare class PdfTransparency implements IPdfWrapper {
    /**
     * Internal variable to store `dictionary`.
     * @default new PdfDictionary()
     * @private
     */
    private dictionary;
    /**
     * Internal variable for accessing fields from `DictionryProperties` class.
     * @default new DictionaryProperties()
     * @private
     */
    private dictionaryProperties;
    /**
     * Initializes a new instance of the `Transparency` class.
     * @private
     */
    constructor(stroke: number, fill: number, mode: PdfBlendMode);
    /**
     * Gets the `element`.
     * @private
     */
    readonly element: IPdfPrimitive;
}
