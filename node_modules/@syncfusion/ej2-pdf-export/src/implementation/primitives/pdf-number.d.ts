/**
 * PdfNumber.ts class for EJ2-PDF
 */
import { IPdfPrimitive } from './../../interfaces/i-pdf-primitives';
import { IPdfWriter } from './../../interfaces/i-pdf-writer';
import { ObjectStatus } from './../input-output/enum';
import { PdfCrossTable } from './../input-output/pdf-cross-table';
/**
 * `PdfNumber` class is used to perform number related primitive operations.
 * @private
 */
export declare class PdfNumber implements IPdfPrimitive {
    /**
     * Shows the type of object `status` whether it is object registered or other status;
     * @private
     */
    private status5;
    /**
     * Indicates if the object is currently in `saving state or not`.
     * @private
     */
    private isSaving5;
    /**
     * Holds the `index` number of the object.
     * @private
     */
    private index5;
    /**
     * Stores the `int` value.
     * @private
     */
    private value;
    /**
     * Sotres the `position`.
     * @default -1
     * @private
     */
    private position5;
    /**
     * The `integer` value.
     * @private
     */
    private integer;
    /**
     * Initializes a new instance of the `PdfNumber` class.
     * @private
     */
    constructor(value: number);
    /**
     * Gets or sets the `integer` value.
     * @private
     */
    intValue: number;
    /**
     * Gets or sets a value indicating whether this instance `is integer`.
     * @private
     */
    isInteger: boolean;
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
     * `Saves the object`.
     * @private
     */
    save(writer: IPdfWriter): void;
    /**
     * Creates a `copy of PdfNumber`.
     * @private
     */
    clone(crossTable: PdfCrossTable): IPdfPrimitive;
    /**
     * Converts a `float value to a string` using Adobe PDF rules.
     * @private
     */
    static floatToString(number: number): string;
    /**
     * Determines the `minimum of the three values`.
     * @private
     */
    static min(x: number, y: number, z: number): number;
}
