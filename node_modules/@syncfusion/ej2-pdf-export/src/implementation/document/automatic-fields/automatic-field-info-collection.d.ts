/**
 * PdfAutomaticFieldInfoCollection.ts class for EJ2-PDF
 * @private
 */
import { PdfAutomaticFieldInfo } from './automatic-field-info';
/**
 * Represent a `collection of automatic fields information`.
 * @private
 */
export declare class PdfAutomaticFieldInfoCollection {
    /**
     * Internal variable to store instance of `pageNumberFields` class.
     * @private
     */
    private automaticFieldsInformation;
    /**
     * Gets the `page number fields collection`.
     * @private
     */
    readonly automaticFields: PdfAutomaticFieldInfo[];
    /**
     * Initializes a new instance of the 'PdfPageNumberFieldInfoCollection' class.
     * @private
     */
    constructor();
    /**
     * Add page number field into collection.
     * @private
     */
    add(fieldInfo: PdfAutomaticFieldInfo): number;
}
