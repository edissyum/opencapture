/**
 * PdfMainObjectCollection.ts class for EJ2-PDF
 */
import { Dictionary } from './../collections/dictionary';
import { PdfReference } from './../primitives/pdf-reference';
import { IPdfPrimitive } from './../../interfaces/i-pdf-primitives';
/**
 * The collection of all `objects` within a PDF document.
 * @private
 */
export declare class PdfMainObjectCollection {
    /**
     * The collection of the `indirect objects`.
     * @default []
     * @private
     */
    objectCollections: ObjectInfo[];
    /**
     * The collection of the `Indirect objects`.
     * @default new Dictionary<number, ObjectInfo>()
     * @private
     */
    mainObjectCollection: Dictionary<number, ObjectInfo>;
    /**
     * The collection of `primitive objects`.
     * @private
     */
    primitiveObjectCollection: Dictionary<IPdfPrimitive, number>;
    /**
     * Holds the `index of the object`.
     * @private
     */
    private index;
    /**
     * Stores the value of `IsNew`.
     * @private
     */
    private isNew;
    /**
     * Gets the `count`.
     * @private
     */
    readonly count: number;
    /**
     * Gets the value of `ObjectInfo` from object collection.
     * @private
     */
    items(index: number): ObjectInfo;
    /**
     * Specifies the value of `IsNew`.
     * @private
     */
    readonly outIsNew: boolean;
    /**
     * `Adds` the specified element.
     * @private
     */
    add(element: IPdfPrimitive): void;
    /**
     * `Looks` through the collection for the object specified.
     * @private
     */
    private lookFor;
    /**
     * Gets the `reference of the object`.
     * @private
     */
    getReference(index: IPdfPrimitive, isNew: boolean): {
        reference: PdfReference;
        wasNew: boolean;
    };
    /**
     * Tries to set the `reference to the object`.
     * @private
     */
    trySetReference(obj: IPdfPrimitive, reference: PdfReference, found: boolean): boolean;
    destroy(): void;
}
export declare class ObjectInfo {
    /**
     * The `PDF object`.
     * @private
     */
    pdfObject: IPdfPrimitive;
    /**
     * `Object number and generation number` of the object.
     * @private
     */
    private pdfReference;
    /**
     * Initializes a new instance of the `ObjectInfo` class.
     * @private
     */
    constructor();
    /**
     * Initializes a new instance of the `ObjectInfo` class.
     * @private
     */
    constructor(obj: IPdfPrimitive);
    /**
     * Initializes a new instance of the `ObjectInfo` class.
     * @private
     */
    constructor(obj: IPdfPrimitive, reference: PdfReference);
    /**
     * Gets the `object`.
     * @private
     */
    object: IPdfPrimitive;
    /**
     * Gets the `reference`.
     * @private
     */
    readonly reference: PdfReference;
    /**
     * Sets the `reference`.
     * @private
     */
    setReference(reference: PdfReference): void;
}
