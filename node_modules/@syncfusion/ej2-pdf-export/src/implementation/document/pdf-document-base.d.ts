/**
 * PdfDocumentBase.ts class for EJ2-PDF
 */
import { PdfMainObjectCollection } from './../input-output/pdf-main-object-collection';
import { PdfCrossTable } from './../input-output/pdf-cross-table';
import { PdfCatalog } from './pdf-catalog';
import { PdfDocument } from './pdf-document';
import { PdfReference } from './../primitives/pdf-reference';
/**
 * `PdfDocumentBase` class represent common properties of PdfDocument classes.
 * @private
 */
export declare class PdfDocumentBase {
    /**
     * Collection of the main `objects`.
     * @private
     */
    private objects;
    /**
     * The `cross table`.
     * @private
     */
    private pdfCrossTable;
    /**
     * `Object` that is saving currently.
     * @private
     */
    private currentSavingObject;
    /**
     * Document `catlog`.
     * @private
     */
    private pdfCatalog;
    /**
     * If the stream is copied,  then it specifies true.
     * @private
     */
    isStreamCopied: boolean;
    /**
     * Instance of parent `document`.
     * @private
     */
    document: PdfDocument;
    /**
     * Initializes a new instance of the `PdfDocumentBase` class.
     * @private
     */
    constructor();
    /**
     * Initializes a new instance of the `PdfDocumentBase` class with instance of PdfDocument as argument.
     * @private
     */
    constructor(document: PdfDocument);
    /**
     * Gets the `PDF objects` collection, which stores all objects and references to it..
     * @private
     */
    readonly pdfObjects: PdfMainObjectCollection;
    /**
     * Gets the `cross-reference` table.
     * @private
     */
    readonly crossTable: PdfCrossTable;
    /**
     * Gets or sets the current saving `object number`.
     * @private
     */
    currentSavingObj: PdfReference;
    /**
     * Gets the PDF document `catalog`.
     * @private
     */
    catalog: PdfCatalog;
    /**
     * Sets the `main object collection`.
     * @private
     */
    setMainObjectCollection(mainObjectCollection: PdfMainObjectCollection): void;
    /**
     * Sets the `cross table`.
     * @private
     */
    setCrossTable(cTable: PdfCrossTable): void;
    /**
     * Sets the `catalog`.
     * @private
     */
    setCatalog(catalog: PdfCatalog): void;
    /**
     * `Saves` the document to the specified filename.
     * @private
     */
    save(): Promise<{
        blobData: Blob;
    }>;
    /**
     * `Saves` the document to the specified filename.
     * @public
     * ```typescript
     * // create a new PDF document
     * let document : PdfDocument = new PdfDocument();
     * // add a pages to the document
     * let page1 : PdfPage = document.pages.add();
     * //
     * // save the document
     * document.save('output.pdf');
     * //
     * // destroy the document
     * document.destroy();
     * ```
     * @param filename Specifies the file name to save the output pdf document.
     */
    save(filename: string): void;
    /**
     * `Clone` of parent object - PdfDocument.
     * @private
     */
    clone(): PdfDocument;
}
