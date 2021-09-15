/**
 * PdfArray.ts class for EJ2-PDF
 */
import { IPdfPrimitive } from './../../interfaces/i-pdf-primitives';
import { IPdfWriter } from './../../interfaces/i-pdf-writer';
import { ObjectStatus } from './../input-output/enum';
import { PdfCrossTable } from './../input-output/pdf-cross-table';
import { RectangleF } from './../drawing/pdf-drawing';
/**
 * `PdfArray` class is used to perform array related primitive operations.
 * @private
 */
export declare class PdfArray implements IPdfPrimitive {
    /**
     * `startMark` - '['
     * @private
     */
    startMark: string;
    /**
     * `endMark` - ']'.
     * @private
     */
    endMark: string;
    /**
     * The `elements` of the PDF array.
     * @private
     */
    private internalElements;
    /**
     * Indicates if the array `was changed`.
     * @private
     */
    private bChanged;
    /**
     * Shows the type of object `status` whether it is object registered or other status;
     * @private
     */
    private status9;
    /**
     * Indicates if the object is currently in `saving state` or not.
     * @private
     */
    private isSaving9;
    /**
     * Holds the `index` number of the object.
     * @private
     */
    private index9;
    /**
     * Internal variable to store the `position`.
     * @default -1
     * @private
     */
    private position9;
    /**
     * Internal variable to hold `PdfCrossTable` reference.
     * @private
     */
    private pdfCrossTable;
    /**
     * Internal variable to hold `cloned object`.
     * @default null
     * @private
     */
    private clonedObject9;
    /**
     * Represents the Font dictionary.
     * @hidden
     * @private
     */
    isFont: boolean;
    /**
     * Gets the `IPdfSavable` at the specified index.
     * @private
     */
    items(index: number): IPdfPrimitive;
    /**
     * Gets the `count`.
     * @private
     */
    readonly count: number;
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
     * Returns `cloned object`.
     * @private
     */
    readonly clonedObject: IPdfPrimitive;
    /**
     * Gets or sets the `position` of the object.
     * @private
     */
    position: number;
    /**
     * Gets or sets the `index` value of the specified object.
     * @private
     */
    objectCollectionIndex: number;
    /**
     * Returns `PdfCrossTable` associated with the object.
     * @private
     */
    readonly CrossTable: PdfCrossTable;
    /**
     * Gets the `elements` of the Pdf Array.
     * @private
     */
    readonly elements: IPdfPrimitive[];
    /**
     * Initializes a new instance of the `PdfArray` class.
     * @private
     */
    constructor();
    /**
     * Initializes a new instance of the `PdfArray` class.
     * @private
     */
    constructor(array: PdfArray | number[]);
    /**
     * `Adds` the specified element to the PDF array.
     * @private
     */
    add(element: IPdfPrimitive): void;
    /**
     * `Marks` the object changed.
     * @private
     */
    private markedChange;
    /**
     * `Determines` whether the specified element is within the array.
     * @private
     */
    contains(element: IPdfPrimitive): boolean;
    /**
     * Returns the `primitive object` of input index.
     * @private
     */
    getItems(index: number): IPdfPrimitive;
    /**
     * `Saves` the object using the specified writer.
     * @private
     */
    save(writer: IPdfWriter): void;
    /**
     * Creates a `copy of PdfArray`.
     * @private
     */
    clone(crossTable: PdfCrossTable): IPdfPrimitive;
    /**
     * Creates filled PDF array `from the rectangle`.
     * @private
     */
    static fromRectangle(bounds: RectangleF): PdfArray;
    /**
     * `Inserts` the element into the array.
     * @private
     */
    insert(index: number, element: IPdfPrimitive): void;
    /**
     * `Checks whether array contains the element`.
     * @private
     */
    indexOf(element: IPdfPrimitive): number;
    /**
     * `Removes` element from the array.
     * @private
     */
    remove(element: IPdfPrimitive): void;
    /**
     * `Remove` the element from the array by its index.
     * @private
     */
    removeAt(index: number): void;
    /**
     * `Clear` the array.
     * @private
     */
    clear(): void;
    /**
     * `Marks` the object changed.
     * @private
     */
    markChanged(): void;
}
