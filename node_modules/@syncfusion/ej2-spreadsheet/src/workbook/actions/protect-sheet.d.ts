import { Workbook } from '../base/index';
/**
 * The `WorkbookSpreadSheet` module is used to handle the Protecting functionalities in Workbook.
 */
export declare class WorkbookProtectSheet {
    private parent;
    /**
     * Constructor for edit module in Workbook.
     *
     * @param {Workbook} workbook - Specifies the workbook.
     * @private
     */
    constructor(workbook: Workbook);
    private protectsheetHandler;
    private unprotectsheetHandler;
    /**
     * To destroy the edit module.
     *
     * @returns {void} - To destroy the edit module.
     * @hidden
     */
    destroy(): void;
    private addEventListener;
    private removeEventListener;
    private lockCells;
    /**
     * Get the module name.
     *
     * @returns {string} - Return the string.
     * @private
     */
    getModuleName(): string;
}
