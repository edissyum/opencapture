import { PdfGanttCellStyle } from './../../base/interface';
import { PdfTreeGrid } from '../pdf-treegrid';
import { RectangleF } from '@syncfusion/ej2-pdf-export';
import { PdfGraphics } from '@syncfusion/ej2-pdf-export';
import { PdfStringFormat, PdfStringLayoutResult } from '@syncfusion/ej2-pdf-export';
/**
 *
 */
export declare class PdfTreeGridCell {
    /**
     * Gets or sets the parent `row`.
     *
     * @private
     */
    row: PdfTreeGridRow;
    /**
     * Gets or sets the cell `style`.
     *
     * @private
     */
    style: PdfGanttCellStyle;
    private cellWidth;
    private cellHeight;
    /**
     * Gets or sets a value that indicates the total number of rows that cell `spans` within a PdfGrid.
     *
     * @private
     */
    rowSpan: number;
    /**
     * Gets or sets a value that indicates the total number of columns that cell `spans` within a PdfGrid.
     *
     * @private
     */
    columnSpan: number;
    value: Object;
    /** @private */
    remainingString: string;
    /** @private */
    finishedDrawingCell: boolean;
    /** @private */
    isCellMergeContinue: boolean;
    /** @private */
    isRowMergeContinue: boolean;
    /** @private */
    isCellMergeStart: boolean;
    /** @private */
    isRowMergeStart: boolean;
    /** @private */
    isHeaderCell: boolean;
    constructor(row?: PdfTreeGridRow);
    /**
     * Gets the `height` of the PdfTreeGrid cell.[Read-Only].
     *
     * @returns {number} .
     * @private
     */
    height: number;
    /**
     * Gets the `width` of the PdfTreeGrid cell.[Read-Only].
     *
     * @returns {number} .
     * @private
     */
    width: number;
    private measureWidth;
    /**
     * @returns {number} .
     * @private
     */
    measureHeight(): number;
    private calculateWidth;
    /**
     * `Draws` the specified graphics.
     *
     * @param {PdfGraphics} graphics .
     * @param {RectangleF} bounds .
     * @param {boolean} cancelSubsequentSpans .
     * @param {number} leftAdjustment .
     * @returns {PdfStringLayoutResult} .
     * @private
     */
    draw(graphics: PdfGraphics, bounds: RectangleF, cancelSubsequentSpans: boolean, leftAdjustment: number): PdfStringLayoutResult;
    /**
     * Draw the `cell background`.
     *
     * @param {PdfGraphics} graphics .
     * @param {RectangleF} bounds .
     * @returns {void} .
     * @private
     */
    drawCellBackground(graphics: PdfGraphics, bounds: RectangleF): void;
    /**
     * `Adjusts the text layout area`.
     *
     * @param {RectangleF} bounds .
     * @returns {RectangleF} .
     * @private
     */
    private adjustContentLayoutArea;
    /**
     * @param {PdfGraphics} graphics .
     * @param {RectangleF} bounds .
     * @returns {void} .
     * @private
     */
    private drawCellBorder;
}
/**
 * `PdfTreeGridCellCollection` class provides access to an ordered,
 * strongly typed collection of 'PdfTreeGridCell' objects.
 *
 * @private
 */
export declare class PdfTreeGridCellCollection {
    /**
     * @private
     */
    private treegridRow;
    /**
     * @private
     */
    private cells;
    /**
     * Initializes a new instance of the `PdfGridCellCollection` class with the row.
     *
     * @param { PdfTreeGridRow} row .
     * @private
     */
    constructor(row: PdfTreeGridRow);
    /**
     * Gets the current `cell`.
     *
     * @param {number} index .
     * @returns {PdfTreeGridCell} .
     * @private
     */
    getCell(index: number): PdfTreeGridCell;
    /**
     * Gets the cells `count`.[Read-Only].
     *
     * @returns {number} .
     * @private
     */
    readonly count: number;
    /**
     * `Adds` this instance.
     *
     * @param {PdfTreeGridCell} cell .
     * @returns {PdfTreeGridCell | void} .
     * @private
     */
    add(cell?: PdfTreeGridCell): PdfTreeGridCell | void;
    /**
     * Returns the `index of` a particular cell in the collection.
     *
     * @param {PdfTreeGridCell} cell .
     * @returns {number} .
     * @private
     */
    indexOf(cell: PdfTreeGridCell): number;
}
/**
 *
 */
export declare class PdfTreeGridRow {
    private treegridCells;
    private pdfTreeGrid;
    private treegridRowOverflowIndex;
    private treegridRowBreakHeight;
    private rowHeight;
    private rowWidth;
    private _isParentRow;
    private intendLevel;
    /**
     * The `Maximum span` of the row.
     *
     * @public
     */
    maximumRowSpan: number;
    constructor(treegrid: PdfTreeGrid);
    readonly cells: PdfTreeGridCellCollection;
    isParentRow: boolean;
    treegrid: PdfTreeGrid;
    /**
     * `Height` of the row yet to be drawn after split.
     *
     * @returns {number} .
     * @private
     */
    rowBreakHeight: number;
    /**
     * `over flow index` of the row.
     *
     * @returns {number} .
     * @private
     */
    rowOverflowIndex: number;
    level: number;
    /**
     * Gets or sets the `height` of the row.
     *
     * @returns {number} .
     * @private
     */
    height: number;
    /**
     * Gets or sets the `width` of the row.
     *
     * @returns {number} .
     * @private
     */
    readonly width: number;
    readonly rowIndex: number;
    private measureWidth;
    private measureHeight;
}
/**
 * `PdfTreeGridRowCollection` class provides access to an ordered, strongly typed collection of 'PdfTreeGridRow' objects.
 *
 * @private
 */
export declare class PdfTreeGridRowCollection {
    /**
     * @private
     */
    private treegrid;
    /**
     * The row collection of the `treegrid`.
     *
     * @private
     */
    private rows;
    /**
     * Initializes a new instance of the `PdfTreeGridRowCollection` class with the parent grid.
     *
     * @param {PdfTreeGrid} treegrid .
     * @private
     */
    constructor(treegrid: PdfTreeGrid);
    /**
     * Gets the number of header in the `PdfTreeGrid`.[Read-Only].
     *
     * @returns {number} .
     * @private
     */
    readonly count: number;
    /**
     * Return the row collection of the `treegrid`.
     *
     * @returns {PdfTreeGridRow[]} .
     * @private
     */
    readonly rowCollection: PdfTreeGridRow[];
    addRow(): PdfTreeGridRow;
    addRow(row: PdfTreeGridRow): void;
    /**
     * Return the row by index.
     *
     * @param {number} index .
     * @returns {PdfTreeGridRow} .
     * @private
     */
    getRow(index: number): PdfTreeGridRow;
}
/**
 * `PdfTreeGridHeaderCollection` class provides customization of the settings for the header.
 *
 * @private
 */
export declare class PdfTreeGridHeaderCollection {
    /**
     * The `treegrid`.
     *
     * @returns {PdfTreeGrid} .
     * @private
     */
    private treegrid;
    /**
     * The array to store the `rows` of the grid header.
     *
     * @returns {PdfTreeGridRow[]} .
     * @private
     */
    private rows;
    /**
     * Initializes a new instance of the `PdfTreeGridHeaderCollection` class with the parent grid.
     *
     * @param {PdfTreeGrid} treegrid .
     * @private
     */
    constructor(treegrid: PdfTreeGrid);
    /**
     * Gets a 'PdfTreeGridRow' object that represents the `header` row in a 'PdfGridHeaderCollection' control.[Read-Only].
     *
     * @param {number} index .
     * @returns {PdfTreeGridRow} .
     * @private
     */
    getHeader(index: number): PdfTreeGridRow;
    /**
     * Gets the `number of header` in the 'PdfGrid'.[Read-Only]
     *
     * @returns {number} .
     * @private
     */
    readonly count: number;
    /**
     * `Adds` the specified row.
     *
     * @param {PdfTreeGridRow} row .
     * @returns {void} .
     * @private
     */
    add(row: PdfTreeGridRow): void;
    indexOf(row: PdfTreeGridRow): number;
}
export declare class PdfTreeGridColumn {
    private treegrid;
    private columnWidth;
    private stringFormat;
    private treeColumnIndex;
    private _headerText;
    private _field;
    constructor(treegrid: PdfTreeGrid);
    headerText: string;
    field: string;
    width: number;
    isTreeColumn: boolean;
    /**
     * Gets or sets the information about the text `formatting`.
     *
     * @returns {PdfStringFormat} .
     * @private
     */
    format: PdfStringFormat;
}
/**
 * `PdfTreeGridColumnCollection` class provides access to an ordered,
 * strongly typed collection of 'PdfTreeGridColumn' objects.
 *
 * @private
 */
export declare class PdfTreeGridColumnCollection {
    /**
     * @private
     */
    private treegrid;
    /**
     * @private
     */
    private internalColumns;
    /**
     * @private
     */
    columnWidth: number;
    /**
     * Initializes a new instance of the `PdfTreeGridColumnCollection` class with the parent grid.
     *
     * @param { PdfTreeGrid} treegrid .
     * @private
     */
    constructor(treegrid: PdfTreeGrid);
    /**
     * `Add` a new column to the 'PdfGrid'.
     *
     * @param {number} count .
     * @returns {void} .
     * @private
     */
    add(count: number): void;
    /**
     * Gets the `number of columns` in the 'PdfGrid'.[Read-Only].
     *
     * @returns {number} .
     * @private
     */
    readonly count: number;
    /**
     * Gets the `widths`.
     *
     * @returns {number} .
     * @private
     */
    readonly width: number;
    /**
     * Gets the `array of PdfGridColumn`.[Read-Only]
     *
     * @returns {PdfTreeGridColumn[]} .
     * @private
     */
    readonly columns: PdfTreeGridColumn[];
    /**
     * Gets the `PdfTreeGridColumn` from the specified index.[Read-Only]
     *
     * @param {number} index .
     * @returns {PdfTreeGridColumn} .
     * @private
     */
    getColumn(index: number): PdfTreeGridColumn;
    /**
     * `Calculates the column widths`.
     *
     * @returns {number} .
     * @private
     */
    measureColumnsWidth(): number;
    /**
     * Gets the `widths of the columns`.
     *
     * @param {number} totalWidth .
     * @returns {number} .
     * @private
     */
    getDefaultWidths(totalWidth: number): number[];
}
