import { Workbook } from '../base/index';
/**
 * The `WorkbookInsert` module is used to insert cells, rows, columns and sheets in to workbook.
 */
export declare class WorkbookInsert {
    private parent;
    /**
     * Constructor for the workbook insert module.
     *
     * @param {Workbook} parent - Specifies the workbook.
     * @private
     */
    constructor(parent: Workbook);
    private insertModel;
    private updateRangeModel;
    private setInsertInfo;
    private addEventListener;
    /**
     * Destroy workbook insert module.
     *
     * @returns {void} - destroy the workbook insert module.
     */
    destroy(): void;
    private removeEventListener;
    /**
     * Get the workbook insert module name.
     *
     * @returns {string} - Return the string.
     */
    getModuleName(): string;
}
