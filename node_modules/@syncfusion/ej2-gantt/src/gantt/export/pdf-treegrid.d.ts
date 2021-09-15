import { IGanttStyle } from './../base/interface';
import { PdfTreeGridColumnCollection, PdfTreeGridHeaderCollection, PdfTreeGridRowCollection } from './pdf-base/index';
import { PdfTreeGridStyle, PdfTreeGridLayouter, PdfTreeGridLayoutResult, PdfTreeGridLayoutFormat } from './pdf-base/index';
import { PdfLayoutElement, PdfLayoutParams, RectangleF, PdfLayoutFormat, PdfPage, PointF, PdfLayoutResult, SizeF, PdfGridBeginCellDrawEventArgs, PdfGridEndCellDrawEventArgs } from '@syncfusion/ej2-pdf-export';
/**
 * PdfTreeGrid Class for EJ2-PDF
 */
export declare class PdfTreeGrid extends PdfLayoutElement {
    columns: PdfTreeGridColumnCollection;
    rows: PdfTreeGridRowCollection;
    style: PdfTreeGridStyle;
    private initialWidth;
    private treeGridSize;
    layouter: PdfTreeGridLayouter;
    headers: PdfTreeGridHeaderCollection;
    private layoutFormat;
    beginCellDraw: Function;
    endCellDraw: Function;
    private treegridLocation;
    treeColumnIndex: number;
    rowHeight: number;
    allowRowBreakAcrossPages: boolean;
    enableHeader: boolean;
    isFitToWidth: boolean;
    ganttStyle: IGanttStyle;
    constructor();
    /**
     * Gets a value indicating whether the `start cell layout event` should be raised.
     *
     * @returns {boolean} .
     * @private
     */
    readonly raiseBeginCellDraw: boolean;
    /**
     * Gets a value indicating whether the `end cell layout event` should be raised.
     *
     * @returns {boolean} .
     * @private
     */
    readonly raiseEndCellDraw: boolean;
    size: SizeF;
    /**
     * `Draws` the element on the page with the specified page and 'PointF' class
     *
     * @param {PdfPage} page .
     * @param {PointF} location .
     * @returns {PdfLayoutResult} .
     * @private
     */
    draw(page: PdfPage, location: PointF): PdfLayoutResult;
    /**
     * `Draws` the element on the page with the specified page and pair of coordinates
     *
     * @param {PdfPage} page .
     * @param {number} x .
     * @param {number} y .
     * @returns {PdfLayoutResult} .
     * @private
     */
    draw(page: PdfPage, x: number, y: number): PdfLayoutResult;
    /**
     * `Draws` the element on the page with the specified page and 'RectangleF' class
     *
     * @param {PdfPage} page .
     * @param {RectangleF} layoutRectangle .
     * @returns {PdfLayoutResult} .
     * @private
     */
    draw(page: PdfPage, layoutRectangle: RectangleF): PdfLayoutResult;
    /**
     * `Draws` the element on the page with the specified page, 'PointF' class and layout format
     *
     * @param {PdfPage} page .
     * @param {PointF} location .
     * @param {PdfTreeGridLayoutFormat} format .
     * @returns {PdfLayoutResult} .
     * @private
     */
    draw(page: PdfPage, location: PointF, format: PdfLayoutFormat): PdfLayoutResult;
    /**
     * `Draws` the element on the page with the specified page, pair of coordinates and layout format
     *
     * @param {PdfPage} page .
     * @param {number} x .
     * @param {number} y .
     * @param {PdfLayoutFormat} format .
     * @returns {PdfLayoutResult}
     * @private
     */
    draw(page: PdfPage, x: number, y: number, format: PdfLayoutFormat): PdfLayoutResult;
    /**
     * `Draws` the element on the page.
     *
     * @private
     */
    draw(page: PdfPage, layoutRectangle: RectangleF, embedFonts: boolean): PdfLayoutResult;
    measureColumnsWidth(bounds?: RectangleF): void;
    private calculateTreeGridSize;
    drawGrid(page: PdfPage, x: number, y: number, format: PdfTreeGridLayoutFormat): PdfTreeGridLayoutResult;
    protected layout(param: PdfLayoutParams): PdfLayoutResult;
    onBeginCellDraw(args: PdfGridBeginCellDrawEventArgs): void;
    onEndCellDraw(args: PdfGridEndCellDrawEventArgs): void;
    setSpan(): void;
}
