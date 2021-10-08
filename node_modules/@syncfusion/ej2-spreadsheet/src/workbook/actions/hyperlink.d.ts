import { Workbook } from '../base/index';
import { HyperlinkModel } from '../common/class-model';
/**
 * The `WorkbookHyperlink` module is used to handle Hyperlink action in Spreadsheet.
 */
export declare class WorkbookHyperlink {
    private parent;
    /**
     * Constructor for WorkbookSort module.
     *
     * @param {Workbook} parent - Specifies the workbook.
     */
    constructor(parent: Workbook);
    /**
     * To destroy the sort module.
     *
     * @returns {void} - To destroy the sort module.
     */
    protected destroy(): void;
    private addEventListener;
    private removeEventListener;
    setLinkHandler(args: {
        hyperlink: string | HyperlinkModel;
        cell: string;
    }): void;
    /**
     * Gets the module name.
     *
     *@returns {string} - returns the module name.
     */
    protected getModuleName(): string;
}
