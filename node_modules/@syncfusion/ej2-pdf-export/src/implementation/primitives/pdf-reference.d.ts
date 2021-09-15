/**
 * PdfReference.ts and PdfReferenceHolder.ts class for EJ2-PDF
 */
import { IPdfPrimitive } from './../../interfaces/i-pdf-primitives';
import { ObjectStatus } from './../input-output/enum';
import { IPdfWrapper } from './../../interfaces/i-pdf-wrapper';
import { IPdfWriter } from './../../interfaces/i-pdf-writer';
import { PdfCrossTable } from './../input-output/pdf-cross-table';
/**
 * `PdfReference` class is used to perform reference related primitive operations.
 * @private
 */
export declare class PdfReference implements IPdfPrimitive {
    /**
     * Indicates if the object is currently in `saving stat`e or not.
     * @private
     */
    private isSaving3;
    /**
     * Shows the type of object `status` whether it is object registered or other status;
     * @private
     */
    private status3;
    /**
     * Holds the `index` number of the object.
     * @default -1
     * @private
     */
    private index3;
    /**
     * Internal variable to store the `position`.
     * @default -1
     * @private
     */
    private position3;
    /**
     * Holds the `object number`.
     * @default 0
     * @private
     */
    readonly objNumber: number;
    /**
     * Holds the `generation number` of the object.
     * @default 0
     * @private
     */
    readonly genNumber: number;
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
     * `Saves` the object.
     * @private
     */
    save(writer: IPdfWriter): void;
    /**
     * Initialize the `PdfReference` class.
     * @private
     */
    constructor(objNumber: number, genNumber: number);
    /**
     * Initialize the `PdfReference` class.
     * @private
     */
    constructor(objNumber: string, genNumber: string);
    /**
     * Returns a `string` representing the object.
     * @private
     */
    toString(): string;
    /**
     * Creates a `deep copy` of the IPdfPrimitive object.
     * @private
     */
    clone(crossTable: PdfCrossTable): IPdfPrimitive;
}
/**
 * `PdfReferenceHolder` class is used to perform reference holder related primitive operations.
 * @private
 */
export declare class PdfReferenceHolder implements IPdfPrimitive, IPdfWrapper {
    /**
     * Indicates if the object is currently in `saving state or not`.
     * @private
     */
    private isSaving4;
    /**
     * Shows the type of object `status` whether it is object registered or other status;
     * @private
     */
    private status4;
    /**
     * Holds the `index` number of the object.
     * @default -1
     * @private
     */
    private index4;
    /**
     * Internal variable to store the `position`.
     * @default -1
     * @private
     */
    private position4;
    /**
     * The `object` which the reference is of.
     * @private
     */
    private primitiveObject;
    /**
     * The `reference` to the object, which was read from the PDF document.
     * @private
     */
    private pdfReference;
    /**
     * The `cross-reference table`, which the object is within.
     * @private
     */
    private crossTable;
    /**
     * The `index` of the object within the object collection.
     * @default -1
     * @private
     */
    private objectIndex;
    /**
     * @hidden
     * @private
     */
    private dictionaryProperties;
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
     * Gets the `object` the reference is of.
     * @private
     */
    readonly object: IPdfPrimitive;
    /**
     * Gets the `reference`.
     * @private
     */
    readonly reference: PdfReference;
    /**
     * Gets the `index` of the object.
     * @private
     */
    readonly index: number;
    /**
     * Gets the `element`.
     * @private
     */
    readonly element: IPdfPrimitive;
    /**
     * Initializes the `PdfReferenceHolder` class instance with an object.
     * @private
     */
    constructor(obj1: IPdfWrapper);
    /**
     * Initializes the `PdfReferenceHolder` class instance with an object.
     * @private
     */
    constructor(obj1: IPdfPrimitive);
    /**
     * Initializes the `PdfReferenceHolder` class instance with an object.
     * @private
     */
    constructor(obj1: PdfReference, obj2: PdfCrossTable);
    private initialize;
    /**
     * `Writes` a reference into a PDF document.
     * @private
     */
    save(writer: IPdfWriter): void;
    /**
     * Creates a `copy of PdfReferenceHolder`.
     * @private
     */
    clone(crossTable: PdfCrossTable): IPdfPrimitive;
}
