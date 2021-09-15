/**
 * `PdfGridCell.ts` class for EJ2-PDF
 */
import { PdfGridRow } from './pdf-grid-row';
import { PdfGridCellStyle } from './styles/style';
import { PdfStringLayoutResult } from './../../graphics/fonts/string-layouter';
import { PdfStringFormat } from './../../graphics/fonts/pdf-string-format';
import { RectangleF } from './../../drawing/pdf-drawing';
import { PdfGraphics } from './../../graphics/pdf-graphics';
/**
 * `PdfGridCell` class represents the schema of a cell in a 'PdfGrid'.
 */
export declare class PdfGridCell {
    /**
     * The `row span`.
     * @private
     */
    private gridRowSpan;
    /**
     * The `column span`.
     * @private
     */
    private colSpan;
    /**
     * Specifies the current `row`.
     * @private
     */
    private gridRow;
    /**
     * The actual `value` of the cell.
     * @private
     */
    private objectValue;
    /**
     * Current cell `style`.
     * @private
     */
    private cellStyle;
    /**
     * `Width` of the cell.
     * @default 0
     * @private
     */
    private cellWidth;
    /**
     * `Height` of the cell.
     * @default 0
     * @private
     */
    private cellHeight;
    /**
     * `tempval`to stores current width .
     * @default 0
     * @private
     */
    private tempval;
    private fontSpilt;
    /**
     * The `remaining string`.
     * @private
     */
    private remaining;
    /**
     * Specifies weather the `cell is drawn`.
     * @default true
     * @private
     */
    private finsh;
    /**
     * 'parent ' of the grid cell.
     * @private
     */
    private parent;
    /**
     * `StringFormat` of the cell.
     * @private
     */
    private format;
    /**
     * The `remaining height` of row span.
     * @default 0
     * @private
     */
    rowSpanRemainingHeight: number;
    private internalIsCellMergeContinue;
    private internalIsRowMergeContinue;
    private internalIsCellMergeStart;
    private internalIsRowMergeStart;
    hasRowSpan: boolean;
    hasColSpan: boolean;
    /**
     * the 'isFinish' is set to page finish
     */
    private isFinish;
    /**
     * The `present' to store the current cell.
     * @default false
     * @private
     */
    present: boolean;
    /**
     * The `Count` of the page.
     * @private
     */
    pageCount: number;
    /**
     * Initializes a new instance of the `PdfGridCell` class.
     * @private
     */
    constructor();
    /**
     * Initializes a new instance of the `PdfGridCell` class.
     * @private
     */
    constructor(row: PdfGridRow);
    isCellMergeContinue: boolean;
    isRowMergeContinue: boolean;
    isCellMergeStart: boolean;
    isRowMergeStart: boolean;
    /**
     * Gets or sets the `remaining string` after the row split between pages.
     * @private
     */
    remainingString: string;
    /**
     * Gets or sets the `FinishedDrawingCell` .
     * @private
     */
    FinishedDrawingCell: boolean;
    /**
     * Gets or sets the `string format`.
     * @private
     */
    stringFormat: PdfStringFormat;
    /**
     * Gets or sets the parent `row`.
     * @private
     */
    row: PdfGridRow;
    /**
     * Gets or sets the `value` of the cell.
     * @private
     */
    value: Object;
    /**
     * Gets or sets a value that indicates the total number of rows that cell `spans` within a PdfGrid.
     * @private
     */
    rowSpan: number;
    /**
     * Gets or sets the cell `style`.
     * @private
     */
    style: PdfGridCellStyle;
    /**
     * Gets the `height` of the PdfGrid cell.[Read-Only].
     * @private
     */
    height: number;
    /**
     * Gets or sets a value that indicates the total number of columns that cell `spans` within a PdfGrid.
     * @private
     */
    columnSpan: number;
    /**
     * Gets the `width` of the PdfGrid cell.[Read-Only].
     * @private
     */
    width: number;
    /**
     * `Calculates the width`.
     * @private
     */
    private measureWidth;
    /**
     * Draw the `cell background`.
     * @private
     */
    drawCellBackground(graphics: PdfGraphics, bounds: RectangleF): void;
    /**
     * `Adjusts the text layout area`.
     * @private
     */
    private adjustContentLayoutArea;
    /**
     * `Draws` the specified graphics.
     * @private
     */
    draw(graphics: PdfGraphics, bounds: RectangleF, cancelSubsequentSpans: boolean): PdfStringLayoutResult;
    /**
     * Draws the `cell border` constructed by drawing lines.
     * @private
     */
    drawCellBorders(graphics: PdfGraphics, bounds: RectangleF): void;
    /**
     * `Adjusts the outer layout area`.
     * @private
     */
    private adjustOuterLayoutArea;
    /**
     * Gets the `text font`.
     * @private
     */
    private getTextFont;
    /**
     * Gets the `text brush`.
     * @private
     */
    private getTextBrush;
    /**
     * Gets the `text pen`.
     * @private
     */
    private getTextPen;
    /**
     * Gets the `background brush`.
     * @private
     */
    private getBackgroundBrush;
    /**
     * Gets the `background image`.
     * @private
     */
    private getBackgroundImage;
    /**
     * Gets the current `StringFormat`.
     * @private
     */
    private getStringFormat;
    /**
     * Calculates the `height`.
     * @private
     */
    measureHeight(): number;
    /**
     * return the calculated `width` of the cell.
     * @private
     */
    private calculateWidth;
}
/**
 * `PdfGridCellCollection` class provides access to an ordered,
 * strongly typed collection of 'PdfGridCell' objects.
 * @private
 */
export declare class PdfGridCellCollection {
    /**
     * @hidden
     * @private
     */
    private gridRow;
    /**
     * @hidden
     * @private
     */
    private cells;
    /**
     * Initializes a new instance of the `PdfGridCellCollection` class with the row.
     * @private
     */
    constructor(row: PdfGridRow);
    /**
     * Gets the current `cell`.
     * @private
     */
    getCell(index: number): PdfGridCell;
    /**
     * Gets the cells `count`.[Read-Only].
     * @private
     */
    readonly count: number;
    /**
     * `Adds` this instance.
     * @private
     */
    add(): PdfGridCell;
    /**
     * `Adds` this instance.
     * @private
     */
    add(cell: PdfGridCell): void;
    /**
     * Returns the `index of` a particular cell in the collection.
     * @private
     */
    indexOf(cell: PdfGridCell): number;
}
