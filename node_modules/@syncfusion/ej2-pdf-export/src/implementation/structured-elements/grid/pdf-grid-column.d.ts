/**
 * `PdfGridColumn.ts` class for EJ2-PDF
 */
import { PdfGrid } from './pdf-grid';
import { PdfStringFormat } from './../../graphics/fonts/pdf-string-format';
/**
 * `PdfGridColumn` class represents the schema of a column in a 'PdfGrid'.
 */
export declare class PdfGridColumn {
    /**
     * The current `grid`.
     * @private
     */
    private grid;
    /**
     * The `width` of the column.
     * @default 0
     * @private
     */
    columnWidth: number;
    /**
     * Represent the `custom width` of the column.
     * @private
     */
    isCustomWidth: boolean;
    /**
     * The `string format` of the column.
     * @private
     */
    private stringFormat;
    /**
     * Initializes a new instance of the `PdfGridColumn` class with the parent grid.
     * @private
     */
    constructor(grid: PdfGrid);
    /**
     * Gets or sets the `width` of the 'PdfGridColumn'.
     * @private
     */
    width: number;
    /**
     * Gets or sets the information about the text `formatting`.
     * @private
     */
    format: PdfStringFormat;
}
/**
 * `PdfGridColumnCollection` class provides access to an ordered,
 * strongly typed collection of 'PdfGridColumn' objects.
 * @private
 */
export declare class PdfGridColumnCollection {
    /**
     * @hidden
     * @private
     */
    private grid;
    /**
     * @hidden
     * @private
     */
    private internalColumns;
    /**
     * @hidden
     * @private
     */
    private columnWidth;
    /**
     * Initializes a new instance of the `PdfGridColumnCollection` class with the parent grid.
     * @private
     */
    constructor(grid: PdfGrid);
    /**
     * `Add` a new column to the 'PdfGrid'.
     * @private
     */
    add(count: number): void;
    /**
     * Gets the `number of columns` in the 'PdfGrid'.[Read-Only].
     * @private
     */
    readonly count: number;
    /**
     * Gets the `widths`.
     * @private
     */
    readonly width: number;
    /**
     * Gets the `array of PdfGridColumn`.[Read-Only]
     * @private
     */
    readonly columns: PdfGridColumn[];
    /**
     * Gets the `PdfGridColumn` from the specified index.[Read-Only]
     * @private
     */
    getColumn(index: number): PdfGridColumn;
    /**
     * `Calculates the column widths`.
     * @private
     */
    measureColumnsWidth(): number;
    /**
     * Gets the `widths of the columns`.
     * @private
     */
    getDefaultWidths(totalWidth: number): number[];
}
