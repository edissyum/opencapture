import { OpenOptions } from '../../spreadsheet/common/interface';
import { Workbook } from '../base/index';
export declare class WorkbookOpen {
    private parent;
    constructor(parent: Workbook);
    /**
     * To open the excel file stream or excel url into the spreadsheet.
     *
     * @param {OpenOptions} options - Options to open a excel file.
     * @returns {void} - To open the excel file stream or excel url into the spreadsheet.
     */
    open(options: OpenOptions): void;
    private fetchFailure;
    private fetchSuccess;
    private updateModel;
    private setSelectAllRange;
    /**
     * Adding event listener for workbook open.
     *
     * @returns {void} - Adding event listener for workbook open.
     */
    private addEventListener;
    /**
     * Removing event listener workbook open.
     *
     * @returns {void} - removing event listener workbook open.
     */
    private removeEventListener;
    /**
     * To Remove the event listeners
     *
     * @returns {void} - To Remove the event listeners
     */
    destroy(): void;
    /**
     * Get the workbook open module name.
     *
     * @returns {string} - Get the module name.
     */
    getModuleName(): string;
}
