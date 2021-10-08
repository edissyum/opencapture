import { Spreadsheet } from '../index';
/**
 * Specifies number format.
 */
export declare class NumberFormat {
    private parent;
    constructor(parent: Spreadsheet);
    private refreshCellElement;
    private getTextSpace;
    private rowFillHandler;
    /**
     * Adding event listener for number format.
     *
     * @hidden
     * @returns {void} - Adding event listener for number format.
     */
    private addEventListener;
    /**
     * Removing event listener for number format.
     *
     * @hidden
     * @returns {void} - Removing event listener for number format.
     */
    private removeEventListener;
    /**
     * To Remove the event listeners.
     *
     * @returns {void} - To Remove the event listeners.
     */
    destroy(): void;
    /**
     * Get the workbook import module name.
     *
     * @returns {string} - Get the workbook import module name.
     */
    getModuleName(): string;
}
/**
 * @hidden
 */
export interface RefreshValueArgs {
    rowIndex?: number;
    colIndex?: number;
    result?: string;
    sheetIndex?: number;
    isRightAlign?: boolean;
    type?: string;
    curSymbol?: string;
    value?: string;
    isRowFill?: boolean;
}
