/**
 * PdfSectionPageCollection.ts class for EJ2-PDF
 */
import { PdfPage } from './pdf-page';
import { PdfSection } from './pdf-section';
/**
 * Represents the `collection of pages in a section`.
 * @private
 */
export declare class PdfSectionPageCollection {
    /**
     * @hidden
     * @private
     */
    private pdfSection;
    /**
     * Gets the `PdfPage` at the specified index.
     * @private
     */
    section: PdfSection;
    /**
     * Initializes a new instance of the `PdfSectionPageCollection` class.
     * @private
     */
    constructor(section: PdfSection);
    /**
     * `Determines` whether the specified page is within the collection.
     * @private
     */
    contains(page: PdfPage): boolean;
    /**
     * `Removes` the specified page from collection.
     * @private
     */
    remove(page: PdfPage): void;
    /**
     * `Adds` a new page from collection.
     * @private
     */
    add(): PdfPage;
}
