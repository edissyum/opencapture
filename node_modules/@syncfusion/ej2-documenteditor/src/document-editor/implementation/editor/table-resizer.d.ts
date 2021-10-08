import { TableWidget, TableCellWidget, TableRowWidget } from '../index';
import { DocumentEditor } from '../../document-editor';
import { Point } from './editor-helper';
import { TableHistoryInfo } from '../index';
import { DocumentHelper } from '../viewer';
/**
 * @private
 */
export declare class TableResizer {
    owner: DocumentEditor;
    documentHelper: DocumentHelper;
    resizeNode: number;
    resizerPosition: number;
    currentResizingTable: TableWidget;
    startingPoint: Point;
    constructor(node: DocumentEditor);
    private readonly viewer;
    private getModuleName;
    updateResizingHistory(touchPoint: Point): void;
    handleResize(point: Point): void;
    isInRowResizerArea(touchPoint: Point): boolean;
    isInCellResizerArea(touchPoint: Point): boolean;
    getCellReSizerPosition(touchPoint: Point): number;
    private getCellReSizerPositionInternal;
    private getRowReSizerPosition;
    handleResizing(touchPoint: Point): void;
    resizeTableRow(dragValue: number): void;
    private getTableWidget;
    private getTableWidgetFromWidget;
    getTableCellWidget(cursorPoint: Point): TableCellWidget;
    updateRowHeight(row: TableRowWidget, dragValue: number): void;
    resizeTableCellColumn(dragValue: number): void;
    private resizeColumnWithSelection;
    private resizeColumnAtStart;
    private updateWidthForCells;
    private resizeColumnAtLastColumnIndex;
    private resizeCellAtMiddle;
    updateGridValue(table: TableWidget, isUpdate: boolean, dragValue?: number): void;
    private getColumnCells;
    private updateGridBefore;
    private getLeastGridBefore;
    private increaseOrDecreaseWidth;
    private changeWidthOfCells;
    private updateRowsGridAfterWidth;
    private getRowWidth;
    private getMaxRowWidth;
    private isColumnSelected;
    applyProperties(table: TableWidget, tableHistoryInfo: TableHistoryInfo): void;
    private getActualWidth;
    setPreferredWidth(table: TableWidget): void;
    private updateCellPreferredWidths;
    private updateGridBeforeWidth;
    updateGridAfterWidth(width: number, row: TableRowWidget): void;
}
