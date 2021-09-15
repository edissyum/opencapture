import { PdfDocument } from './../document/pdf-document';
import { PdfPage } from './pdf-page';
import { PdfSection } from './pdf-section';
import { PageAddedEventArgs } from './../pages/page-added-event-arguments';
import { Dictionary } from './../collections/dictionary';
/**
 * Represents a virtual collection of all the pages in the document.
 * @private
 */
export declare class PdfDocumentPageCollection {
    /**
     * Parent `document`.
     * @private
     */
    private document;
    /**
     * It holds the page collection with the `index`.
     * @private
     */
    private pdfPageCollectionIndex;
    /**
     * Internal variable for `page added event`.
     * @private
     */
    pageAdded: PageAddedEventArgs;
    /**
     * Gets the total `number of the pages`.
     * @private
     */
    readonly count: number;
    /**
     * Gets a `page index` from the document.
     * @private
     */
    readonly pageCollectionIndex: Dictionary<PdfPage, number>;
    /**
     * Initializes a new instance of the `PdfPageCollection` class.
     * @private
     */
    constructor(document: PdfDocument);
    /**
     * Creates a page and `adds` it to the last section in the document.
     * @private
     */
    add(): PdfPage;
    /**
     * Creates a page and `adds` it to the last section in the document.
     * @private
     */
    add(page: PdfPage): void;
    /**
     * Returns `last section` in the document.
     * @private
     */
    private getLastSection;
    /**
     * Called when `new page has been added`.
     * @private
     */
    onPageAdded(args: PageAddedEventArgs): void;
    /**
     * Gets the `total number of pages`.
     * @private
     */
    private countPages;
    /**
     * Gets the `page object` from page index.
     * @private
     */
    getPageByIndex(index: number): PdfPage;
    /**
     * Gets a page by its `index` in the document.
     * @private
     */
    private getPage;
    /**
     * Gets the `index of` the page in the document.
     * @private
     */
    indexOf(page: PdfPage): number;
    /**
     * `Removes` the specified page.
     * @private
     */
    remove(page: PdfPage): PdfSection;
}
