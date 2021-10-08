import { Workbook, SheetModel } from '../base/index';
/**
 * To get range indexes.
 *
 * @param {string} range - Specifies the range.
 * @returns {number[]} - To get range indexes.
 */
export declare function getRangeIndexes(range: string): number[];
/**
 * To get single cell indexes
 *
 * @param {string} address - Specifies the address.
 * @returns {number[]} - To get single cell indexes
 */
export declare function getCellIndexes(address: string): number[];
/**
 * To get column index from text.
 *
 * @hidden
 * @param {string} text - Specifies the text.
 * @returns {number} - To get column index from text.
 */
export declare function getColIndex(text: string): number;
/**
 * To get cell address from given row and column index.
 *
 * @param {number} sRow - Specifies the row.
 * @param {number} sCol - Specifies the col.
 * @returns {string} - To get cell address from given row and column index.
 */
export declare function getCellAddress(sRow: number, sCol: number): string;
/**
 * To get range address from given range indexes.
 *
 * @param {number[]} range - Specifies the range.
 * @returns {string} - To get range address from given range indexes.
 */
export declare function getRangeAddress(range: number[]): string;
/**
 * To get column header cell text
 *
 * @param {number} colIndex - Specifies the colIndex.
 * @returns {string} - Get Column Header Text
 */
export declare function getColumnHeaderText(colIndex: number): string;
/**
 * @hidden
 * @param {SheetModel} address - Specifies the address.
 * @returns {number[]} - Get Indexes From Address
 */
export declare function getIndexesFromAddress(address: string): number[];
/**
 * @hidden
 * @param {SheetModel} address - Specifies the address.
 * @returns {string} - Get Range From Address.
 */
export declare function getRangeFromAddress(address: string): string;
/**
 * Get complete address for selected range
 *
 * @hidden
 * @param {SheetModel} sheet - Specifies the sheet.
 * @returns {string} - Get complete address for selected range
 */
export declare function getAddressFromSelectedRange(sheet: SheetModel): string;
/**
 * @param {Workbook} context - Specifies the context.
 * @param {string} address - Specifies the address.
 * @returns {Object} - To get Address Info
 * @hidden
 */
export declare function getAddressInfo(context: Workbook, address: string): {
    sheetIndex: number;
    indices: number[];
};
/**
 * Given range will be swapped/arranged in increasing order.
 *
 * @hidden
 * @param {number[]} range - Specifies the range.
 * @returns {number[]} - Returns the bool value.
 */
export declare function getSwapRange(range: number[]): number[];
/**
 * @hidden
 * @param {number[]} range - Specifies the range.
 * @returns {boolean} - Returns the bool value.
 */
export declare function isSingleCell(range: number[]): boolean;
