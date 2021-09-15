import { Workbook } from '../base/index';
/**
 * The `WorkbookEdit` module is used to handle the editing functionalities in Workbook.
 */
export declare class WorkbookEdit {
    private parent;
    private localeObj;
    private decimalSep;
    /**
     * Constructor for edit module in Workbook.
     *
     * @private
     * @param {Workbook} workbook - Specifies the workbook.
     */
    constructor(workbook: Workbook);
    /**
     * To destroy the edit module.
     *
     * @returns {void} - destroy the edit module
     * @hidden
     */
    destroy(): void;
    private addEventListener;
    private removeEventListener;
    /**
     * Get the module name.
     *
     * @returns {string} - string
     * @private
     */
    getModuleName(): string;
    private performEditOperation;
    private checkDecimalPoint;
    private updateCellValue;
}
