import { IPdfWrapper } from './../../interfaces/i-pdf-wrapper';
import { IPdfPrimitive } from './../../interfaces/i-pdf-primitives';
import { PdfDictionary } from './../primitives/pdf-dictionary';
import { DictionaryProperties } from './../input-output/pdf-dictionary-properties';
/**
 * `PdfAction` class represents base class for all action types.
 * @private
 */
export declare abstract class PdfAction implements IPdfWrapper {
    /**
     * Specifies the Next `action` to perform.
     * @private
     */
    private action;
    /**
     * Specifies the Internal variable to store `dictionary`.
     * @private
     */
    private pdfDictionary;
    /**
     * Specifies the Internal variable to store `dictionary properties`.
     * @private
     */
    protected dictionaryProperties: DictionaryProperties;
    /**
     * Initialize instance for `Action` class.
     * @private
     */
    protected constructor();
    /**
     * Gets and Sets the `Next` action to perform.
     * @private
     */
    next: PdfAction;
    /**
     * Gets and Sets the instance of PdfDictionary class for `Dictionary`.
     * @private
     */
    readonly dictionary: PdfDictionary;
    /**
     * `Initialize` the action type.
     * @private
     */
    protected initialize(): void;
    /**
     * Gets the `Element` as IPdfPrimitive class.
     * @private
     */
    readonly element: IPdfPrimitive;
}
