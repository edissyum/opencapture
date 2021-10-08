/**
 * PdfGridRow.ts class for EJ2-PDF
 */
import { PdfGrid } from './pdf-grid';
import { PdfGridCellCollection } from './pdf-grid-cell';
import { PdfGridRowStyle } from './styles/style';
import { PdfLayoutResult } from '../../graphics/figures/base/element-layouter';
/**
 * `PdfGridRow` class provides customization of the settings for the particular row.
 */
export declare class PdfGridRow {
    /**
     * `Cell collecton` of the current row..
     * @private
     */
    private gridCells;
    /**
     * Stores the current `grid`.
     * @private
     */
    private pdfGrid;
    /**
     * The grid row `style`.
     * @private
     */
    private rowStyle;
    /**
     * Stores the row `break height`.
     * @private
     */
    private gridRowBreakHeight;
    /**
     * Stores the index of the overflowing row.
     * @private
     */
    private gridRowOverflowIndex;
    /**
     * The `height` of the row.
     * @private
     */
    private rowHeight;
    /**
     * The `width` of the row.
     * @private
     */
    private rowWidth;
    /**
     * The `isFinish` of the row.
     * @private
     */
    isrowFinish: boolean;
    /**
     * Check whether the Row span row height `is set explicitly`.
     * @default false
     * @public
     */
    isRowSpanRowHeightSet: boolean;
    /**
     * The grid row `Layout Result`.
     * @private
     */
    private gridResult;
    /**
     * The `Maximum span` of the row.
     * @public
     */
    maximumRowSpan: number;
    /**
     * The `page count` of the row.
     * @public
     */
    noOfPageCount: number;
    /**
     * Check whether the row height `is set explicitly`.
     * @default false
     * @private
     */
    isRowHeightSet: boolean;
    isRowBreaksNextPage: boolean;
    rowBreakHeightValue: number;
    isPageBreakRowSpanApplied: boolean;
    /**
     * Checks whether the `columns span is exist or not`.
     * @private
     */
    private bColumnSpanExists;
    /**
     * Check weather the row merge `is completed` or not.
     * @default true
     * @private
     */
    private isRowMergeComplete;
    /**
     * Checks whether the `row span is exist or not`.
     * @private
     */
    private bRowSpanExists;
    repeatFlag: boolean;
    repeatRowNumber: number;
    rowFontSplit: boolean;
    /**
     * Initializes a new instance of the `PdfGridRow` class with the parent grid.
     * @private
     */
    constructor(grid: PdfGrid);
    /**
     * Gets or sets a value indicating [`row span exists`].
     * @private
     */
    rowSpanExists: boolean;
    /**
     * Gets the `cells` from the selected row.[Read-Only].
     * @private
     */
    readonly cells: PdfGridCellCollection;
    /**
     * Gets or sets the parent `grid`.
     * @private
     */
    grid: PdfGrid;
    /**
     * Gets or sets the row `style`.
     * @private
     */
    style: PdfGridRowStyle;
    /**
     * `Height` of the row yet to be drawn after split.
     * @private
     */
    rowBreakHeight: number;
    /**
     * `over flow index` of the row.
     * @private
     */
    rowOverflowIndex: number;
    /**
     * Gets or sets the `height` of the row.
     * @private
     */
    height: number;
    /**
     * Gets or sets the `width` of the row.
     * @private
     */
    readonly width: number;
    /**
     * Gets or sets the row `Nested grid Layout Result`.
     * @private
     */
    NestedGridLayoutResult: PdfLayoutResult;
    /**
     * Gets or sets a value indicating [`column span exists`].
     * @private
     */
    columnSpanExists: boolean;
    /**
     * Check whether the Row `has row span or row merge continue`.
     * @private
     */
    rowMergeComplete: boolean;
    /**
     * Returns `index` of the row.
     * @private
     */
    readonly rowIndex: number;
    /**
     * `Calculates the height`.
     * @private
     */
    private measureHeight;
    private measureWidth;
}
/**
 * `PdfGridRowCollection` class provides access to an ordered, strongly typed collection of 'PdfGridRow' objects.
 * @private
 */
export declare class PdfGridRowCollection {
    /**
     * @hidden
     * @private
     */
    private grid;
    /**
     * The row collection of the `grid`.
     * @private
     */
    private rows;
    /**
     * Initializes a new instance of the `PdfGridRowCollection` class with the parent grid.
     * @private
     */
    constructor(grid: PdfGrid);
    /**
     * Gets the number of header in the `PdfGrid`.[Read-Only].
     * @private
     */
    readonly count: number;
    /**
     * Return the row collection of the `grid`.
     * @private
     */
    readonly rowCollection: PdfGridRow[];
    /**
     * `Adds` the specified row.
     * @private
     */
    addRow(): PdfGridRow;
    /**
     * `Adds` the specified row.
     * @private
     */
    addRow(row: PdfGridRow): void;
    /**
     * Return the row by index.
     * @private
     */
    getRow(index: number): PdfGridRow;
}
/**
 * `PdfGridHeaderCollection` class provides customization of the settings for the header.
 * @private
 */
export declare class PdfGridHeaderCollection {
    /**
     * The `grid`.
     * @private
     */
    private grid;
    /**
     * The array to store the `rows` of the grid header.
     * @private
     */
    private rows;
    /**
     * Initializes a new instance of the `PdfGridHeaderCollection` class with the parent grid.
     * @private
     */
    constructor(grid: PdfGrid);
    /**
     * Gets a 'PdfGridRow' object that represents the `header` row in a 'PdfGridHeaderCollection' control.[Read-Only].
     * @private
     */
    getHeader(index: number): PdfGridRow;
    /**
     * Gets the `number of header` in the 'PdfGrid'.[Read-Only]
     * @private
     */
    readonly count: number;
    /**
     * `Adds` the specified row.
     * @private
     */
    add(row: PdfGridRow): void;
    /**
     * `Adds` the specified row.
     * @private
     */
    add(count: number): PdfGridRow[];
    indexOf(row: PdfGridRow): number;
}
