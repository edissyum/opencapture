import { SheetModel } from './index';
import { ColumnModel } from './column-model';
import { ChildProperty } from '@syncfusion/ej2-base';
import { FormatModel, ValidationModel } from '../common/index';
/**
 * Configures the Column behavior for the spreadsheet.
 */
export declare class Column extends ChildProperty<Column> {
    /**
     * Specifies index of the column. Based on the index, column properties are applied.
     *
     * @default 0
     * @asptype int
     */
    index: number;
    /**
     * Specifies width of the column.
     *
     * @default 64
     * @asptype int
     */
    width: number;
    /**
     * specifies custom width of the column.
     *
     * @default false
     */
    customWidth: boolean;
    /**
     * To hide/show the column in spreadsheet.
     *
     * @default false
     */
    hidden: boolean;
    /**
     * Specifies format of the column.
     *
     * @default {}
     */
    format: FormatModel;
    /**
     * To lock/unlock the column in the protected sheet.
     *
     * @default true
     */
    isLocked: boolean;
    /**
     * Specifies the validation of the column.
     *
     * @default ''
     */
    validation: ValidationModel;
}
/**
 * @hidden
 * @param {SheetModel} sheet - Specifies the sheet.
 * @param {number} colIndex - Specifies the colIndex.
 * @returns {ColumnModel} - To get Column.
 */
export declare function getColumn(sheet: SheetModel, colIndex: number): ColumnModel;
/** @hidden
 * @param {SheetModel} sheet - Specifies the sheet.
 * @param {number} colIndex - Specifies the colIndex.
 * @param {ColumnModel} column - Specifies the column.
 * @returns {void} - To set Column.
 */
export declare function setColumn(sheet: SheetModel, colIndex: number, column: ColumnModel): void;
/**
 * @hidden
 * @param {SheetModel} sheet - Specifies the sheet.
 * @param {number} index - Specifies the index.
 * @param {boolean} skipHidden - Specifies the bool.
 * @param {boolean} checkDPR - Specifies the bool.
 * @returns {number} - To get Column width.
 */
export declare function getColumnWidth(sheet: SheetModel, index: number, skipHidden?: boolean, checkDPR?: boolean): number;
/**
 * @hidden
 * @param {SheetModel} sheet - Specifies the sheet.
 * @param {number} startCol - Specifies the startCol.
 * @param {number} endCol - Specifies the endCol.
 * @param {boolean} checkDPR - Specifies the boolean value.
 * @returns {number} - returns the column width.
 */
export declare function getColumnsWidth(sheet: SheetModel, startCol: number, endCol?: number, checkDPR?: boolean): number;
/**
 * @hidden
 * @param {SheetModel} sheet - Specifies the sheet.
 * @param {number} index - Specifies the index.
 * @returns {boolean} - returns the boolean value.
 */
export declare function isHiddenCol(sheet: SheetModel, index: number): boolean;
