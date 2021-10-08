/**
 * PageAddedEventArguments.ts class for EJ2-PDF
 */
import { PdfPage } from './pdf-page';
/**
 * Provides data for `PageAddedEventHandler` event.
 * This event raises when adding the new PDF page to the PDF document.
 */
export declare class PageAddedEventArgs {
    /**
     * Represents added `page`.
     * @private
     */
    private pdfPage;
    /**
     * Gets the `newly added page`.
     * @private
     */
    readonly page: PdfPage;
    /**
     * Initializes a new instance of the `PageAddedEventArgs` class.
     * @private
     */
    constructor();
    /**
     * Initializes a new instance of the `PageAddedEventArgs` class with 'PdfPage'.
     * @private
     */
    constructor(page: PdfPage);
}
