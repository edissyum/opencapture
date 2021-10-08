import { PdfViewerBase, PdfViewer } from '../index';
import { ListView } from '@syncfusion/ej2-lists';
/**
 * BookmarkView module
 */
export declare class BookmarkView {
    private pdfViewer;
    private pdfViewerBase;
    private bookmarkView;
    private isBookmarkViewDiv;
    private treeObj;
    private bookmarkRequestHandler;
    bookmarks: any;
    private bookmarkStyles;
    bookmarksDestination: any;
    /**
     * @private
     */
    childNavigateCount: number;
    /**
     * @private
     */
    bookmarkList: ListView;
    /**
     * @param pdfViewer
     * @param pdfViewerBase
     * @param pdfViewer
     * @param pdfViewerBase
     * @private
     */
    constructor(pdfViewer: PdfViewer, pdfViewerBase: PdfViewerBase);
    /**
     * @private
     */
    createRequestForBookmarks(): void;
    /**
     * @private
     */
    renderBookmarkcontent(): void;
    /**
     * @private
     */
    renderBookmarkContentMobile(): void;
    private bookmarkClick;
    private nodeClick;
    private bookmarkPanelBeforeOpen;
    private setHeight;
    /**
     * @private
     */
    setBookmarkContentHeight(): void;
    private navigateToBookmark;
    /**
     * Get Bookmarks of the PDF document being loaded in the ejPdfViewer control
     *
     * @returns any
     */
    getBookmarks(): any;
    /**
     * Navigate To current Bookmark location of the PDF document being loaded in the ejPdfViewer control.
     *
     * @param  {number} pageIndex - Specifies the pageIndex for Navigate
     * @param  {number} y - Specifies the Y coordinates value of the Page
     * @returns void
     */
    goToBookmark(pageIndex: number, y: number): boolean;
    /**
     * @private
     */
    clear(): void;
    /**
     * @private
     */
    destroy(): void;
    /**
     * @private
     */
    getModuleName(): string;
}
