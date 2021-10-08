/**
 * ElementLayouter.ts class for EJ2-PDF
 */
import { RectangleF } from './../../../drawing/pdf-drawing';
import { PdfPage } from './../../../pages/pdf-page';
import { PdfLayoutType, PdfLayoutBreakType } from './../enum';
import { PdfLayoutElement } from './../layout-element';
/**
 * Base class for `elements lay outing`.
 * @private
 */
export declare abstract class ElementLayouter {
    /**
     * Layout the `element`.
     * @private
     */
    private layoutElement;
    /**
     * Initializes a new instance of the `ElementLayouter` class.
     * @private
     */
    constructor(element: PdfLayoutElement);
    /**
     * Gets the `element`.
     * @private
     */
    readonly elements: PdfLayoutElement;
    /**
     * Gets the `element`.
     * @private
     */
    getElement(): PdfLayoutElement;
    /**
     * `Layouts` the element.
     * @private
     */
    layout(param: PdfLayoutParams): PdfLayoutResult;
    Layouter(param: PdfLayoutParams): PdfLayoutResult;
    /**
     * Returns the `next page`.
     * @private
     */
    getNextPage(currentPage: PdfPage): PdfPage;
    protected getPaginateBounds(param: PdfLayoutParams): RectangleF;
    /**
     * `Layouts` the element.
     * @private
     */
    protected abstract layoutInternal(param: PdfLayoutParams): PdfLayoutResult;
}
export declare class PdfLayoutFormat {
    /**
     * Indicates whether `PaginateBounds` were set and should be used or not.
     * @private
     */
    private boundsSet;
    /**
     * `Bounds` for the paginating.
     * @private
     */
    private layoutPaginateBounds;
    /**
     * `Layout` type of the element.
     * @private
     */
    private layoutType;
    /**
     * `Break` type of the element.
     * @private
     */
    private breakType;
    /**
     * Gets or sets `layout` type of the element.
     * @private
     */
    layout: PdfLayoutType;
    /**
     * Gets or sets `break` type of the element.
     * @private
     */
    break: PdfLayoutBreakType;
    /**
     * Gets or sets the `bounds` on the next page.
     * @private
     */
    paginateBounds: RectangleF;
    /**
     * Gets a value indicating whether [`use paginate bounds`].
     * @private
     */
    readonly usePaginateBounds: boolean;
    /**
     * Initializes a new instance of the `PdfLayoutFormat` class.
     * @private
     */
    constructor();
    /**
     * Initializes a new instance of the `PdfLayoutFormat` class.
     * @private
     */
    constructor(baseFormat: PdfLayoutFormat);
}
export declare class PdfLayoutParams {
    /**
     * The last `page` where the element was drawn.
     * @private
     */
    private pdfPage;
    /**
     * The `bounds` of the element on the last page where it was drawn.
     * @private
     */
    private layoutBounds;
    /**
     * Layout settings as `format`.
     * @private
     */
    private layoutFormat;
    /**
     * Gets or sets the layout `page` for the element.
     * @private
     */
    page: PdfPage;
    /**
     * Gets or sets layout `bounds` for the element.
     * @private
     */
    bounds: RectangleF;
    /**
     * Gets or sets `layout settings` for the element.
     * @private
     */
    format: PdfLayoutFormat;
}
export declare class PdfLayoutResult {
    /**
     * The last `page` where the element was drawn.
     * @private
     */
    private pdfPage;
    /**
     * The `bounds` of the element on the last page where it was drawn.
     * @private
     */
    private layoutBounds;
    /**
     * Gets the last `page` where the element was drawn.
     * @private
     */
    readonly page: PdfPage;
    /**
     * Gets the `bounds` of the element on the last page where it was drawn.
     * @private
     */
    readonly bounds: RectangleF;
    /**
     * Initializes the new instance of `PdfLayoutResult` class.
     * @private
     */
    constructor(page: PdfPage, bounds: RectangleF);
}
