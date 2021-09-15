import { Workbook } from '../base/index';
/**
 * The `WorkbookFilter` module is used to handle filter action in Spreadsheet.
 */
export declare class WorkbookFilter {
    private parent;
    private filterRange;
    /**
     * Constructor for WorkbookFilter module.
     *
     * @param {Workbook} parent - Constructor for WorkbookFilter module.
     */
    constructor(parent: Workbook);
    /**
     * To destroy the filter module.
     *
     * @returns {void} - To destroy the filter module.
     */
    protected destroy(): void;
    private addEventListener;
    private removeEventListener;
    /**
     * Filters a range of cells in the sheet.
     *
     * @param { {args: BeforeFilterEventArgs, promise: Promise<FilterEventArgs>}} eventArgs - Specify the event args.
     * @param {BeforeFilterEventArgs} eventArgs.args - arguments for filtering..
     * @param {Promise<FilterEventArgs>} eventArgs.promise - Specify the promise.
     * @returns {void} - Filters a range of cells in the sheet.
     */
    private initiateFilterHandler;
    /**
     * Hides or unhides the rows based on the filter predicates.
     *
     * @param {DataManager} dataManager - Specify the dataManager.
     * @param {Predicate[]} predicates - Specify the predicates.
     * @returns {void} - Hides or unhides the rows based on the filter predicates.
     */
    private setFilter;
    /**
     * Clears all the filters in the sheet.
     *
     * @returns {void} - Clears all the filters in the sheet.
     */
    private clearAllFilterHandler;
    /**
     * Gets the module name.
     *
     * @returns {string} - Get the module name.
     */
    protected getModuleName(): string;
}
