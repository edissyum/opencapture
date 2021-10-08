import { Spreadsheet } from '../base/index';
/**
 * `FindAndReplace` module is used to handle the search action in Spreadsheet.
 */
export declare class FindAndReplace {
    private parent;
    private shortValue;
    /**
     * Constructor for FindAndReplace module.
     *
     * @param {Spreadsheet} parent - Constructor for FindAndReplace module.
     */
    constructor(parent: Spreadsheet);
    private addEventListener;
    private removeEventListener;
    private findUndoRedo;
    private renderFindDlg;
    private dialogMessage;
    private renderGotoDlg;
    private textFocus;
    private findDlgClick;
    private findHandler;
    private replaceHandler;
    private gotoHandler;
    private gotoAlert;
    private showDialog;
    private replaceAllDialog;
    private findKeyUp;
    private findandreplaceContent;
    private GotoContent;
    /**
     * To destroy the find-and-replace module.
     *
     * @returns {void} - To destroy the find-and-replace module.
     */
    protected destroy(): void;
    /**
     * Gets the module name.
     *
     * @returns {string} - Gets the module name.
     */
    protected getModuleName(): string;
}
