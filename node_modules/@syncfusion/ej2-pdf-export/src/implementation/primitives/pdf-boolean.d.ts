/**
 * PdfBoolean.ts class for EJ2-PDF
 */
import { IPdfPrimitive } from './../../interfaces/i-pdf-primitives';
import { IPdfWriter } from './../../interfaces/i-pdf-writer';
import { ObjectStatus } from './../input-output/enum';
import { PdfCrossTable } from './../input-output/pdf-cross-table';
/**
 * `PdfBoolean` class is used to perform boolean related primitive operations.
 * @private
 */
export declare class PdfBoolean implements IPdfPrimitive {
    /**
     * Shows the type of object `status` whether it is object registered or other status;
     * @private
     */
    private objectStatus;
    /**
     * Indicates if the object `is currently in saving state` or not.
     * @private
     */
    private saving;
    /**
     * Holds the `index` number of the object.
     * @private
     */
    private index;
    /**
     * The `value` of the PDF boolean.
     * @private
     */
    value: boolean;
    /**
     * Internal variable to store the `position`.
     * @default -1
     * @private
     */
    private currentPosition;
    /**
     * Initializes a new instance of the `PdfBoolean` class.
     * @private
     */
    constructor(value: boolean);
    /**
     * Gets or sets the `Status` of the specified object.
     * @private
     */
    status: ObjectStatus;
    /**
     * Gets or sets a value indicating whether this document `is saving` or not.
     * @private
     */
    isSaving: boolean;
    /**
     * Gets or sets the `index` value of the specified object.
     * @private
     */
    objectCollectionIndex: number;
    /**
     * Gets or sets the `position` of the object.
     * @private
     */
    position: number;
    /**
     * Returns `cloned object`.
     * @private
     */
    readonly clonedObject: IPdfPrimitive;
    /**
     * `Saves` the object using the specified writer.
     * @private
     */
    save(writer: IPdfWriter): void;
    /**
     * Creates a `copy of PdfBoolean`.
     * @private
     */
    clone(crossTable: PdfCrossTable): IPdfPrimitive;
    /**
     * Converts `boolean to string` - 0/1 'true'/'false'.
     * @private
     */
    private boolToStr;
}
