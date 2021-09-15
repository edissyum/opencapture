import { PdfDocumentBase } from './../document/pdf-document-base';
import { PdfWriter } from './pdf-writer';
import { PdfDictionary } from './../primitives/pdf-dictionary';
import { PdfMainObjectCollection } from './pdf-main-object-collection';
import { PdfReference } from './../primitives/pdf-reference';
import { ObjectType } from './cross-table';
import { IPdfPrimitive } from './../../interfaces/i-pdf-primitives';
/**
 * `PdfCrossTable` is responsible for intermediate level parsing
 * and savingof a PDF document.
 * @private
 */
export declare class PdfCrossTable {
    /**
     * Parent `Document`.
     * @private
     */
    private pdfDocument;
    /**
     * Internal variable to store primtive objects of `main object collection`.
     * @private
     */
    private items;
    /**
     * The `mapped references`.
     * @private
     */
    private mappedReferences;
    /**
     * The modified `objects` that should be saved.
     * @private
     */
    private objects;
    /**
     * The `trailer` for a new document.
     * @private
     */
    private internalTrailer;
    /**
     * Internal variable to store if document `is being merged`.
     * @private
     */
    private merging;
    /**
     * `Flag` that forces an object to be 'a new'.
     * @private
     */
    private bForceNew;
    /**
     * Holds `maximal generation number` or offset to object.
     * @default 0
     * @private
     */
    private maxGenNumIndex;
    /**
     * The `number of the objects`.
     * @default 0
     * @private
     */
    private objectCount;
    /**
     * Internal variable for accessing fields from `DictionryProperties` class.
     * @default new PdfDictionaryProperties()
     * @private
     */
    private dictionaryProperties;
    /**
     * Gets or sets if the document `is merged`.
     * @private
     */
    isMerging: boolean;
    /**
     * Gets the `trailer`.
     * @private
     */
    readonly trailer: PdfDictionary;
    /**
     * Gets or sets the main `PdfDocument` class instance.
     * @private
     */
    document: PdfDocumentBase;
    /**
     * Gets the catched `PDF object` main collection.
     * @private
     */
    readonly pdfObjects: PdfMainObjectCollection;
    /**
     * Gets the `object collection`.
     * @private
     */
    private readonly objectCollection;
    /**
     * Gets or sets the `number of the objects` within the document.
     * @private
     */
    count: number;
    /**
     * Returns `next available object number`.
     * @private
     */
    readonly nextObjNumber: number;
    /**
     * `Saves` the cross-reference table into the stream and return it as Blob.
     * @private
     */
    save(writer: PdfWriter): Blob;
    /**
     * `Saves` the cross-reference table into the stream.
     * @private
     */
    save(writer: PdfWriter, filename: string): void;
    /**
     * `Saves the endess` of the file.
     * @private
     */
    private saveTheEndess;
    /**
     * `Saves the new trailer` dictionary.
     * @private
     */
    private saveTrailer;
    /**
     * `Saves the xref section`.
     * @private
     */
    private saveSections;
    /**
     * `Saves a subsection`.
     * @private
     */
    private saveSubsection;
    /**
     * Generates string for `xref table item`.
     * @private
     */
    getItem(offset: number, genNumber: number, isFree: boolean): string;
    /**
     * `Prepares a subsection` of the current section within the cross-reference table.
     * @private
     */
    private prepareSubsection;
    /**
     * `Marks the trailer references` being saved.
     * @private
     */
    private markTrailerReferences;
    /**
     * `Saves the head`.
     * @private
     */
    private saveHead;
    /**
     * Generates the `version` of the file.
     * @private
     */
    private generateFileVersion;
    /**
     * Retrieves the `reference` of the object given.
     * @private
     */
    getReference(obj: IPdfPrimitive): PdfReference;
    /**
     * Retrieves the `reference` of the object given.
     * @private
     */
    getReference(obj: IPdfPrimitive, bNew: boolean): PdfReference;
    /**
     * Retrieves the `reference` of the object given.
     * @private
     */
    private getSubReference;
    /**
     * `Saves all objects` in the collection.
     * @private
     */
    private saveObjects;
    /**
     * `Saves indirect object`.
     * @private
     */
    saveIndirectObject(obj: IPdfPrimitive, writer: PdfWriter): void;
    /**
     * Performs `real saving` of the save object.
     * @private
     */
    private doSaveObject;
    /**
     * `Registers` an archived object.
     * @private
     */
    registerObject(offset: number, reference: PdfReference): void;
    /**
     * `Registers` the object in the cross reference table.
     * @private
     */
    registerObject(offset: number, reference: PdfReference, free: boolean): void;
    /**
     * `Dereferences` the specified primitive object.
     * @private
     */
    static dereference(obj: IPdfPrimitive): IPdfPrimitive;
}
export declare class RegisteredObject {
    /**
     * The `object number` of the indirect object.
     * @private
     */
    private object;
    /**
     * The `generation number` of the indirect object.
     * @private
     */
    generation: number;
    /**
     * The `offset` of the indirect object within the file.
     * @private
     */
    private offsetNumber;
    /**
     * Shows if the object `is free`.
     * @private
     */
    type: ObjectType;
    /**
     * Holds the current `cross-reference` table.
     * @private
     */
    private xrefTable;
    /**
     * Gets the `object number`.
     * @private
     */
    readonly objectNumber: number;
    /**
     * Gets the `offset`.
     * @private
     */
    readonly offset: number;
    /**
     * Initialize the `structure` with the proper values.
     * @private
     */
    constructor(offset: number, reference: PdfReference);
    /**
     * Initialize the `structure` with the proper values.
     * @private
     */
    constructor(offset: number, reference: PdfReference, free: boolean);
}
