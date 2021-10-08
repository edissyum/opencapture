/**
 * PdfFunction.ts class for EJ2-PDF
 * Implements the base class for all functions.
 */
import { PdfDictionary } from '../../primitives/pdf-dictionary';
import { IPdfWrapper } from '../../../interfaces/i-pdf-wrapper';
import { DictionaryProperties } from './../../input-output/pdf-dictionary-properties';
import { PdfArray } from './../../primitives/pdf-array';
import { IPdfPrimitive } from './../../../interfaces/i-pdf-primitives';
export declare abstract class PdfFunction implements IPdfWrapper {
    /**
     * Internal variable to store dictionary.
     * @private
     */
    private mDictionary;
    /**
     * Local variable to store the dictionary properties.
     * @private
     */
    protected mDictionaryProperties: DictionaryProperties;
    /**
     * Initializes a new instance of the `PdfFunction` class.
     * @public
     */
    constructor(dictionary: PdfDictionary);
    /**
     * Gets or sets the domain of the function.
     * @public
     */
    protected domain: PdfArray;
    /**
     * Gets or sets the range.
     * @public
     */
    protected range: PdfArray;
    /**
     * Gets the dictionary.
     */
    protected readonly dictionary: PdfDictionary;
    /**
     * Gets the element.
     */
    readonly element: IPdfPrimitive;
}
