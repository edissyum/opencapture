/**
 * PdfGrid.ts class for EJ2-PDF
 */
import { PdfGridColumnCollection } from './pdf-grid-column';
import { PdfGridCell } from './pdf-grid-cell';
import { PdfGridRowCollection, PdfGridHeaderCollection } from './pdf-grid-row';
import { RectangleF, SizeF, PointF } from './../../drawing/pdf-drawing';
import { PdfPage } from './../../pages/pdf-page';
import { PdfLayoutElement } from './../../graphics/figures/layout-element';
import { PdfLayoutResult, PdfLayoutParams, PdfLayoutFormat } from './../../graphics/figures/base/element-layouter';
import { PdfGridStyle } from './styles/style';
import { PdfGridBeginCellDrawEventArgs, PdfGridEndCellDrawEventArgs } from '../../structured-elements/grid/layout/grid-layouter';
export declare class PdfGrid extends PdfLayoutElement {
    /**
     * @hidden
     * @private
     */
    private gridColumns;
    /**
     * @hidden
     * @private
     */
    private gridRows;
    /**
     * @hidden
     * @private
     */
    private gridHeaders;
    /**
     * @hidden
     * @private
     */
    private gridInitialWidth;
    /**
     * @hidden
     * @private
     */
    isComplete: boolean;
    /**
     * @hidden
     * @private
     */
    private gridSize;
    /**
     * @hidden
     * @private
     */
    private layoutFormat;
    /**
     * @hidden
     * @private
     */
    private gridLocation;
    /**
     * @hidden
     * @private
     */
    private gridStyle;
    /**
     * @hidden
     * @private
     */
    private ispageWidth;
    /**
     * Check weather it is `child grid or not`.
     * @private
     */
    private ischildGrid;
    /**
     * Check the child grid is ' split or not'
     */
    isGridSplit: boolean;
    /**
     * @hidden
     * @private
     */
    rowLayoutBoundsWidth: number;
    /**
     * @hidden
     * @private
     */
    isRearranged: boolean;
    /**
     * @hidden
     * @private
     */
    private bRepeatHeader;
    /**
     * @hidden
     * @private
     */
    private pageBounds;
    /**
     * @hidden
     * @private
     */
    private currentPage;
    /**
     * @hidden
     * @private
     */
    private currentPageBounds;
    /**
     * @hidden
     * @private
     */
    private currentBounds;
    /**
     * @hidden
     * @private
     */
    private currentGraphics;
    /**
     * @hidden
     * @private
     */
    listOfNavigatePages: number[];
    /**
     * @hidden
     * @private
     */
    private startLocation;
    /**
     * @hidden
     * @private
     */
    parentCellIndex: number;
    tempWidth: number;
    /**
     * @hidden
     * @private
     */
    private breakRow;
    splitChildRowIndex: number;
    private rowBreakPageHeightCellIndex;
    /**
     * The event raised on `starting cell drawing`.
     * @event
     * @private
     */
    beginCellDraw: Function;
    /**
     * The event raised on `ending cell drawing`.
     * @event
     * @private
     */
    endCellDraw: Function;
    /**
     * The event raised on `begin cell lay outing`.
     * @event
     * @private
     */
    /**
     * The event raised on `end cell lay outing`.
     * @event
     * @private
     */
    hasRowSpanSpan: boolean;
    hasColumnSpan: boolean;
    isSingleGrid: boolean;
    private parentCell;
    /**
     * Initialize a new instance for `PdfGrid` class.
     * @private
     */
    constructor();
    /**
     * Gets a value indicating whether the `start cell layout event` should be raised.
     * @private
     */
    readonly raiseBeginCellDraw: boolean;
    /**
     * Gets a value indicating whether the `end cell layout event` should be raised.
     * @private
     */
    readonly raiseEndCellDraw: boolean;
    /**
     * Gets or sets a value indicating whether to `repeat header`.
     * @private
     */
    repeatHeader: boolean;
    /**
     * Gets or sets a value indicating whether to split or cut rows that `overflow a page`.
     * @private
     */
    allowRowBreakAcrossPages: boolean;
    /**
     * Gets the `column` collection of the PdfGrid.[Read-Only]
     * @private
     */
    readonly columns: PdfGridColumnCollection;
    /**
     * Gets the `row` collection from the PdfGrid.[Read-Only]
     * @private
     */
    readonly rows: PdfGridRowCollection;
    /**
     * Gets the `headers` collection from the PdfGrid.[Read-Only]
     * @private
     */
    readonly headers: PdfGridHeaderCollection;
    /**
     * Indicating `initial width` of the page.
     * @private
     */
    initialWidth: number;
    /**
     * Gets or sets the `grid style`.
     * @private
     */
    style: PdfGridStyle;
    /**
     * Gets a value indicating whether the grid column width is considered to be `page width`.
     * @private
     */
    isPageWidth: boolean;
    /**
     * Gets or set if grid `is nested grid`.
     * @private
     */
    isChildGrid: boolean;
    /**
     * Gets or set if grid ' is split or not'
     * @public
     */
    /**
     * Gets the `size`.
     * @private
     */
    size: SizeF;
    ParentCell: PdfGridCell;
    readonly LayoutFormat: PdfLayoutFormat;
    /**
     * `Draws` the element on the page with the specified page and 'PointF' class
     * @private
     */
    draw(page: PdfPage, location: PointF): PdfLayoutResult;
    /**
     * `Draws` the element on the page with the specified page and pair of coordinates
     * @private
     */
    draw(page: PdfPage, x: number, y: number): PdfLayoutResult;
    /**
     * `Draws` the element on the page with the specified page and 'RectangleF' class
     * @private
     */
    draw(page: PdfPage, layoutRectangle: RectangleF): PdfLayoutResult;
    /**
     * `Draws` the element on the page with the specified page, 'PointF' class and layout format
     * @private
     */
    draw(page: PdfPage, location: PointF, format: PdfLayoutFormat): PdfLayoutResult;
    /**
     * `Draws` the element on the page with the specified page, pair of coordinates and layout format
     * @private
     */
    draw(page: PdfPage, x: number, y: number, format: PdfLayoutFormat): PdfLayoutResult;
    /**
     * `Draws` the element on the page.
     * @private
     */
    draw(page: PdfPage, layoutRectangle: RectangleF, embedFonts: boolean): PdfLayoutResult;
    /**
     * `Draws` the element on the page with the specified page, 'RectangleF' class and layout format
     * @private
     */
    draw(page: PdfPage, layoutRectangle: RectangleF, format: PdfLayoutFormat): PdfLayoutResult;
    /**
     * `measures` this instance.
     * @private
     */
    private measure;
    onBeginCellDraw(args: PdfGridBeginCellDrawEventArgs): void;
    onEndCellDraw(args: PdfGridEndCellDrawEventArgs): void;
    /**
     * `Layouts` the specified graphics.
     * @private
     */
    protected layout(param: PdfLayoutParams): PdfLayoutResult;
    setSpan(): void;
    checkSpan(): void;
    /**
     * Calculates the `width` of the columns.
     * @private
     */
    measureColumnsWidth(): void;
    /**
     * Calculates the `width` of the columns.
     * @private
     */
    measureColumnsWidth(bounds: RectangleF): void;
}
