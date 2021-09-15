import { DiagramElement } from '../elements/diagram-element';
import { Canvas } from './canvas';
import { Container } from './container';
import { Size } from '../../primitives/size';
import { ShapeStyleModel } from '../appearance-model';
/**
 * Grid panel is used to arrange the children in a table like structure
 */
export declare class GridPanel extends Container {
    private childTable;
    /**
     * rowDefinitions method \
     *
     * @returns { RowDefinition[] } columnDefinitions method .\
     *
     * @private
     */
    rowDefinitions(): RowDefinition[];
    private rowDefns;
    /**
     * columnDefinitions method \
     *
     * @returns { ColumnDefinition[] } columnDefinitions method .\
     *
     * @private
     */
    columnDefinitions(): ColumnDefinition[];
    private colDefns;
    /** @private */
    rows: GridRow[];
    cellStyle: ShapeStyleModel;
    private desiredRowHeight;
    private desiredCellWidth;
    addObject(obj: DiagramElement, rowId?: number, columnId?: number, rowSpan?: number, columnSpan?: number): void;
    private addObjectToCell;
    /**
     * updateProperties method \
     *
     * @returns { void } updateProperties method .\
     * @param {number} offsetX - provide the Connector value.
     * @param {number} offsetY - provide the Connector value.
     * @param {number} width - provide the Connector value.
     * @param {number} height - provide the Connector value.
     *
     * @private
     */
    updateProperties(offsetX: number, offsetY: number, width: number, height: number): void;
    /**
     * setDefinitions method \
     *
     * @returns { void } setDefinitions method .\
     * @param {RowDefinition[]} rows - provide the rows value.
     * @param {ColumnDefinition[]} columns - provide the Connector value.
     *
     * @private
     */
    setDefinitions(rows: RowDefinition[], columns: ColumnDefinition[]): void;
    /**
     * addCellInRow method \
     *
     * @returns { void } addCellInRow method .\
     * @param {ColumnDefinition[]} columns - provide the rows value.
     * @param {RowDefinition} rowDefn - provide the Connector value.
     * @param {GridRow} row - provide the Connector value.
     *
     * @private
     */
    private addCellInRow;
    /**
     * calculateSize method \
     *
     * @returns { void } calculateSize method .\
     *
     * @private
     */
    private calculateSize;
    /**
     * updateRowHeight method \
     *
     * @returns { void } updateRowHeight method .\
     * @param {number} rowId - provide the rows value.
     * @param {number} height - provide the Connector value.
     * @param {boolean} isConsiderChild - provide the Connector value.
     * @param {number} padding - provide the Connector value.
     *
     * @private
     */
    updateRowHeight(rowId: number, height: number, isConsiderChild: boolean, padding?: number): void;
    private setTextRefresh;
    /**
     * updateColumnWidth method \
     *
     * @returns { void } updateColumnWidth method .\
     * @param {number} colId - provide the rows value.
     * @param {number} width - provide the Connector value.
     * @param {boolean} isConsiderChild - provide the Connector value.
     * @param {number} padding - provide the Connector value.
     *
     * @private
     */
    updateColumnWidth(colId: number, width: number, isConsiderChild: boolean, padding?: number): void;
    private calculateCellWidth;
    private calculateCellHeight;
    private calculateCellSizeBasedOnChildren;
    private calculateCellWidthBasedOnChildren;
    private calculateCellHeightBasedOnChildren;
    /**
     * addRow method \
     *
     * @returns { void } addRow method .\
     * @param {number} rowId - provide the rowId value.
     * @param {number} rowDefn - provide the rowDefn value.
     * @param {boolean} isMeasure - provide the isMeasure value.
     *
     * @private
     */
    addRow(rowId: number, rowDefn: RowDefinition, isMeasure: boolean): void;
    /**
     * addColumn method \
     *
     * @returns { void } addColumn method .\
     * @param {number} columnId - provide the rowId value.
     * @param {number} column - provide the rowDefn value.
     * @param {boolean} isMeasure - provide the isMeasure value.
     *
     * @private
     */
    addColumn(columnId: number, column: ColumnDefinition, isMeasure?: boolean): void;
    /**
     * removeRow method \
     *
     * @returns { void } removeRow method .\
     * @param {number} rowId - provide the rowId value.
     *
     * @private
     */
    removeRow(rowId: number): void;
    /**
     * removeColumn method \
     *
     * @returns { void } removeColumn method .\
     * @param {number} columnId - provide the rowId value.
     *
     * @private
     */
    removeColumn(columnId: number): void;
    /**
     * updateRowIndex method \
     *
     * @returns { void } updateRowIndex method .\
     * @param {number} currentIndex - provide the rowId value.
     * @param {number} newIndex - provide the rowId value.
     *
     * @private
     */
    updateRowIndex(currentIndex: number, newIndex: number): void;
    /**
     * updateColumnIndex method \
     *
     * @returns { void } updateColumnIndex method .\
     * @param {number} startRowIndex - provide the startRowIndex value.
     * @param {number} currentIndex - provide the currentIndex value.
     * @param {number} newIndex - provide the newIndex value.
     *
     * @private
     */
    updateColumnIndex(startRowIndex: number, currentIndex: number, newIndex: number): void;
    /**
     * measure method \
     *
     * @returns { Size } measure method .\
     * @param {Size} availableSize - provide the startRowIndex value.
     *
     * @private
     */
    measure(availableSize: Size): Size;
    /**
     * arrange method \
     *
     * @returns { Size } arrange method .\
     * @param {Size} desiredSize - provide the startRowIndex value.
     * @param {boolean} isChange - provide the startRowIndex value.
     *
     * @private
     */
    arrange(desiredSize: Size, isChange?: boolean): Size;
}
/**
 * Defines the behavior of the RowDefinition of node
 */
export declare class RowDefinition {
    /** returns the height of node */
    height: number;
}
/**
 * Defines the behavior of the ColumnDefinition of node
 */
export declare class ColumnDefinition {
    /** returns the width of node */
    width: number;
}
/** @private */
export declare class GridRow {
    cells: GridCell[];
}
/** @private */
export declare class GridCell extends Canvas {
    columnSpan: number;
    rowSpan: number;
    desiredCellWidth: number;
    desiredCellHeight: number;
}
