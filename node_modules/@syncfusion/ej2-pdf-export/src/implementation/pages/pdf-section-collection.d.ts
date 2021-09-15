/**
 * PdfSectionCollection.ts class for EJ2-PDF
 */
import { PdfDocument } from './../document/pdf-document';
import { IPdfPrimitive } from './../../interfaces/i-pdf-primitives';
import { IPdfWrapper } from './../../interfaces/i-pdf-wrapper';
import { PdfSection } from './pdf-section';
/**
 * Represents the `collection of the sections`.
 * @private
 */
export declare class PdfSectionCollection implements IPdfWrapper {
    /**
     * Rotate factor for page `rotation`.
     * @default 90
     * @private
     */
    static readonly rotateFactor: number;
    /**
     * the current `document`.
     * @private
     */
    private pdfDocument;
    /**
     * `count` of the sections.
     * @private
     */
    private sectionCount;
    /**
     * @hidden
     * @private
     */
    private sections;
    /**
     * @hidden
     * @private
     */
    private sectionCollection;
    /**
     * @hidden
     * @private
     */
    private pages;
    /**
     * @hidden
     * @private
     */
    private dictionaryProperties;
    /**
     * Initializes a new instance of the `PdfSectionCollection` class.
     * @private
     */
    constructor(document: PdfDocument);
    /**
     * Gets the `Section` collection.
     */
    readonly section: PdfSection[];
    /**
     * Gets a parent `document`.
     * @private
     */
    readonly document: PdfDocument;
    /**
     * Gets the `number of sections` in a document.
     * @private
     */
    readonly count: number;
    /**
     * Gets the wrapped `element`.
     * @private
     */
    readonly element: IPdfPrimitive;
    /**
     * `Initializes the object`.
     * @private
     */
    private initialize;
    /**
     * Initializes a new instance of the `PdfSectionCollection` class.
     * @private
     */
    pdfSectionCollection(index: number): PdfSection;
    /**
     * In fills dictionary by the data from `Page settings`.
     * @private
     */
    private setPageSettings;
    /**
     * `Adds` the specified section.
     * @private
     */
    add(section?: PdfSection): number | PdfSection;
    /**
     * `Checks` if the section is within the collection.
     * @private
     */
    private checkSection;
    /**
     * Catches the Save event of the dictionary to `count the pages`.
     * @private
     */
    countPages(): number;
    /**
     * Catches the Save event of the dictionary to `count the pages`.
     * @hidden
     * @private
     */
    beginSave(): void;
}
