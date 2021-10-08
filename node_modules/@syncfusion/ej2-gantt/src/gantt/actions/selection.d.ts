import { Gantt } from '../base/gantt';
import { ISelectedCell } from '@syncfusion/ej2-grids';
import { IIndex } from '@syncfusion/ej2-grids';
import { IGanttData } from '../base/interface';
/**
 * The Selection module is used to handle cell and row selection.
 */
export declare class Selection {
    parent: Gantt;
    selectedRowIndex: number;
    isMultiCtrlRequest: boolean;
    isMultiShiftRequest: boolean;
    isSelectionFromChart: boolean;
    private actualTarget;
    private isInteracted;
    private prevRowIndex;
    private selectedClass;
    private multipleIndexes;
    selectedRowIndexes: number[];
    enableSelectMultiTouch: boolean;
    startIndex: number;
    endIndex: number;
    private openPopup;
    constructor(gantt: Gantt);
    /**
     * Get module
     *
     * @returns {string} .
     */
    private getModuleName;
    private wireEvents;
    /**
     * To update selected index.
     *
     * @returns {void} .
     * @private
     */
    selectRowByIndex(): void;
    /**
     * To bind selection events.
     *
     * @returns {void} .
     * @private
     */
    private bindEvents;
    private rowSelecting;
    private rowSelected;
    private rowDeselecting;
    private rowDeselected;
    private cellSelecting;
    private cellSelected;
    private cellDeselecting;
    private cellDeselected;
    /**
     * Selects a cell by given index.
     *
     * @param  {IIndex} cellIndex - Defines the row and column indexes.
     * @param  {boolean} isToggle - If set to true, then it toggles the selection.
     * @returns {void} .
     */
    selectCell(cellIndex: IIndex, isToggle?: boolean): void;
    /**
     * Selects a collection of cells by row and column indexes.
     *
     * @param  {ISelectedCell[]} rowCellIndexes - Specifies the row and column indexes.
     * @returns {void} .
     */
    selectCells(rowCellIndexes: ISelectedCell[]): void;
    /**
     * Selects a row by given index.
     *
     * @param  {number} index - Defines the row index.
     * @param  {boolean} isToggle - If set to true, then it toggles the selection.
     * @param {boolean} isPreventFocus .
     * @returns {void} .
     */
    selectRow(index: number, isToggle?: boolean, isPreventFocus?: boolean): void;
    /**
     * Selects a collection of rows by indexes.
     *
     * @param  {number[]} records - Defines the collection of row indexes.
     * @returns {void} .
     */
    selectRows(records: number[]): void;
    /**
     * Gets the collection of selected row indexes.
     *
     * @returns {number[]} .
     */
    getSelectedRowIndexes(): number[];
    /**
     * Gets the collection of selected row and cell indexes.
     *
     * @returns {number[]} .
     */
    getSelectedRowCellIndexes(): ISelectedCell[];
    /**
     * Gets the collection of selected records.
     *
     * @returns {Object[]} .
     */
    getSelectedRecords(): Object[];
    /**
     * Get the selected records for cell selection.
     *
     * @returns {IGanttData[]} .
     */
    getCellSelectedRecords(): IGanttData[];
    /**
     * Gets the collection of selected rows.
     *
     * @returns {Element[]} .
     */
    getSelectedRows(): Element[];
    /**
     * Deselects the current selected rows and cells.
     *
     * @returns {void} .
     */
    clearSelection(): void;
    private highlightSelectedRows;
    private getselectedrowsIndex;
    /**
     * Selects a range of rows from start and end row indexes.
     *
     * @param  {number} startIndex - Defines the start row index.
     * @param  {number} endIndex - Defines the end row index.
     * @returns {void} .
     */
    selectRowsByRange(startIndex: number, endIndex?: number): void;
    private addRemoveClass;
    private addClass;
    private removeClass;
    private showPopup;
    /**
     * @returns {void} .
     * @private
     */
    hidePopUp(): void;
    private popUpClickHandler;
    /**
     * @param {PointerEvent} e .
     * @returns {void} .
     * @private
     */
    private mouseUpHandler;
    /**
     * To add class for selected records in virtualization mode.
     *
     * @param {number} i .
     * @returns {void} .
     * @hidden
     */
    maintainSelectedRecords(i: number): void;
    /**
     * To destroy the selection module.
     *
     * @returns {void} .
     * @private
     */
    destroy(): void;
}
