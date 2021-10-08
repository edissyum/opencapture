import { PdfViewerBase, PdfViewer } from '../index';
/**
 * Navigation module
 */
export declare class Navigation {
    private pdfViewer;
    private pdfViewerBase;
    private pageNumber;
    /**
     * @param viewer
     * @param viewerBase
     * @param viewer
     * @param viewerBase
     * @private
     */
    constructor(viewer: PdfViewer, viewerBase: PdfViewerBase);
    /**
     * Navigate to Next page of the PDF document
     *
     * @returns void
     */
    goToNextPage(): void;
    /**
     * Navigate to Previous page of the PDF document
     *
     * @returns void
     */
    goToPreviousPage(): void;
    /**
     * Navigate to given Page number
     * Note : In case if we have provided incorrect page number as argument it will retain the existing page
     *
     * @param  {number} pageNumber - Defines the page number to navigate
     * @returns void
     */
    goToPage(pageNumber: number): void;
    /**
     * Navigate to First page of the PDF document
     *
     * @returns void
     */
    goToFirstPage(): void;
    /**
     * Navigate to Last page of the PDF document
     *
     * @returns void
     */
    goToLastPage(): void;
    /**
     * @private
     */
    destroy(): void;
    /**
     * @private
     */
    getModuleName(): string;
}
