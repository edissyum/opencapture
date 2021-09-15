import { IGrid, IAction } from '../base/interface';
/**
 * The `Clipboard` module is used to handle clipboard copy action.
 */
export declare class Clipboard implements IAction {
    private activeElement;
    protected clipBoardTextArea: HTMLInputElement;
    private copyContent;
    private isSelect;
    private parent;
    /**
     * Constructor for the Grid clipboard module
     *
     * @param {IGrid} parent - specifies the IGrid
     * @hidden
     */
    constructor(parent?: IGrid);
    /**
     * @returns {void}
     * @hidden
     */
    addEventListener(): void;
    /**
     * @returns {void}
     * @hidden
     */
    removeEventListener(): void;
    private clickHandler;
    private pasteHandler;
    /**
     * Paste data from clipboard to selected cells.
     *
     * @param {boolean} data - Specifies the date for paste.
     * @param {boolean} rowIndex - Specifies the row index.
     * @param {boolean} colIndex - Specifies the column index.
     * @returns {void}
     */
    paste(data: string, rowIndex: number, colIndex: number): void;
    private initialEnd;
    private keyDownHandler;
    protected setCopyData(withHeader?: boolean): void;
    private getCopyData;
    /**
     * Copy selected rows or cells data into clipboard.
     *
     * @returns {void}
     * @param {boolean} withHeader - Specifies whether the column header data need to be copied or not.
     */
    copy(withHeader?: boolean): void;
    /**
     * For internal use only - Get the module name.
     *
     * @returns {string} returns the module name
     * @private
     */
    protected getModuleName(): string;
    /**
     * To destroy the clipboard
     *
     * @returns {void}
     * @hidden
     */
    destroy(): void;
    private checkBoxSelection;
}
