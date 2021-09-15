import { DocumentHelper } from './viewer';
import { Page } from './viewer/page';
/**
 * Print class
 */
export declare class Print {
    private getModuleName;
    /**
     * Prints the current viewer
     *
     * @private
     * @param {DocumentHelper} documentHelper - Specifies the document helper.
     * @param {Window} printWindow - Specifies the print window.
     * @returns {void}
     */
    print(documentHelper: DocumentHelper, printWindow?: Window): void;
    /**
     * Opens print window and displays current page to print.
     *
     * @private
     * @param {DocumentHelper} documentHelper - Specifies the document helper.
     * @param {string} browserUserAgent - Specifies the browser user agent.
     * @param {Window} printWindow - Specifies the print window.
     * @returns {void}
     */
    printWindow(documentHelper: DocumentHelper, browserUserAgent: string, printWindow?: Window): void;
    /**
     * Generate Document Image.
     *
     * @param documentHelper
     * @param pageNumber
     * @param imageType
     * @private
     */
    exportAsImage(documentHelper: DocumentHelper, pageNumber: number, imageType: string): HTMLImageElement;
    /**
     * Generates print content.
     *
     * @private
     * @param {DocumentHelper} documentHelper - Specifies the document helper.
     * @param {HTMLDivElement} element - Specifies the element.
     * @returns {void}
     */
    generatePrintContent(documentHelper: DocumentHelper, element: HTMLDivElement): void;
    /**
     * Gets page width.
     *
     * @private
     * @param {Page} pages - Specifies the pages.
     * @returns {number} - Returns the page width.
     */
    getPageWidth(pages: Page[]): number;
    /**
     * Gets page height.
     *
     * @private
     * @param {Page} pages - Specifies the pages.
     * @returns {number} - Returns the page height.
     */
    getPageHeight(pages: Page[]): number;
    /**
     * @private
     * @returns {void}
     */
    destroy(): void;
}
