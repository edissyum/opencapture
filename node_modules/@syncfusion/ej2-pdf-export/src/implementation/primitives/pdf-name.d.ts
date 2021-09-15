/**
 * PdfName.ts class for EJ2-PDF
 */
import { IPdfPrimitive } from './../../interfaces/i-pdf-primitives';
import { IPdfWriter } from './../../interfaces/i-pdf-writer';
import { ObjectStatus } from './../input-output/enum';
import { PdfCrossTable } from './../input-output/pdf-cross-table';
/**
 * `PdfName` class is used to perform name (element names) related primitive operations.
 * @private
 */
export declare class PdfName implements IPdfPrimitive {
    /**
     * `Start symbol` of the name object.
     * @default /
     * @private
     */
    readonly stringStartMark: string;
    /**
     * PDF `special characters`.
     * @private
     */
    static delimiters: string;
    /**
     * The symbols that are not allowed in PDF names and `should be replaced`.
     * @private
     */
    private static readonly replacements;
    /**
     * `Value` of the element.
     * @private
     */
    private internalValue;
    /**
     * Shows the type of object `status` whether it is object registered or other status;
     * @private
     */
    private status6;
    /**
     * Indicates if the object is currently in `saving state or not`.
     * @default false
     * @private
     */
    private isSaving6;
    /**
     * Holds the `index` number of the object.
     * @private
     */
    private index6;
    /**
     * Internal variable to store the `position`.
     * @default -1
     * @private
     */
    private position6;
    /**
     * Initializes a new instance of the `PdfName` class.
     * @private
     */
    constructor();
    /**
     * Initializes a new instance of the `PdfName` class.
     * @private
     */
    constructor(value: string);
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
     * Gets or sets the `value` of the object.
     * @private
     */
    value: string;
    /**
     * `Saves` the name using the specified writer.
     * @private
     */
    save(writer: IPdfWriter): void;
    /**
     * Gets `string` representation of the primitive.
     * @private
     */
    toString(): string;
    /**
     * Creates a `copy of PdfName`.
     * @private
     */
    clone(crossTable: PdfCrossTable): IPdfPrimitive;
    /**
     * Replace some characters with its `escape sequences`.
     * @private
     */
    escapeString(stringValue: string): string;
    /**
     * Replace a symbol with its code with the precedence of the `sharp sign`.
     * @private
     */
    private normalizeValue;
}
