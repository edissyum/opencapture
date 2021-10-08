import { Workbook } from '../base/index';
import { FindOptions } from '../common/index';
/**
 * `WorkbookFindAndReplace` module is used to handle the search action in Spreadsheet.
 */
export declare class WorkbookFindAndReplace {
    private parent;
    /**
     * Constructor for WorkbookFindAndReplace module.
     *
     * @param {Workbook} parent - Specifies the workbook.
     */
    constructor(parent: Workbook);
    /**
     * To destroy the FindAndReplace module.
     *
     * @returns {void} - To destroy the FindAndReplace module.
     */
    protected destroy(): void;
    private addEventListener;
    private removeEventListener;
    private findNext;
    private findNxtRow;
    private findNxtCol;
    private nextCommon;
    private findPrevious;
    private findPreRow;
    private findPreCol;
    private commonCondition;
    private prevCommon;
    replace(args: FindOptions): void;
    replaceAll(args: FindOptions): void;
    private totalCount;
    private requiredCount;
    private findAllValues;
    /**
     * Gets the module name.
     *
     * @returns {string} - Return the string
     */
    protected getModuleName(): string;
}
