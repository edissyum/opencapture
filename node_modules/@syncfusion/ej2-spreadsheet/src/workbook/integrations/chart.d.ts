import { Workbook } from '../base/index';
/**
 * The `WorkbookChart` module is used to handle chart action in Spreadsheet.
 */
export declare class WorkbookChart {
    private parent;
    /**
     * Constructor for WorkbookChart module.
     *
     * @param {Workbook} parent - Constructor for WorkbookChart module.
     */
    constructor(parent: Workbook);
    private addEventListener;
    private removeEventListener;
    private setChartHandler;
    private refreshChartData;
    private inRowColumnRange;
    private refreshChartSize;
    private focusChartBorder;
    private deleteChartColl;
    /**
     * To Remove the event listeners.
     *
     * @returns {void} - To Remove the event listeners.
     */
    destroy(): void;
    /**
     * Get the workbook chart module name.
     *
     * @returns {string} - Get the workbook chart module name.
     */
    getModuleName(): string;
}
