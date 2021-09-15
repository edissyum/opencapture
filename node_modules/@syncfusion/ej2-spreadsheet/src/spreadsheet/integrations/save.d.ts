import { Spreadsheet } from '../index';
/**
 * `Save` module is used to handle the save action in Spreadsheet.
 */
export declare class Save {
    private parent;
    /**
     * Constructor for Save module in Spreadsheet.
     *
     * @private
     * @param {Spreadsheet} parent - Specifies the Spreadsheet instance.
     */
    constructor(parent: Spreadsheet);
    /**
     * To destroy the Save module.
     *
     * @returns {void}
     * @hidden
     */
    destroy(): void;
    private addEventListener;
    private removeEventListener;
    /**
     * Get the module name.
     *
     * @returns {string} - Get the module name.
     * @private
     */
    getModuleName(): string;
    /**
     * Initiate save process.
     *
     * @hidden
     * @returns {void} - Initiate save process.
     */
    private initiateSave;
    /**
     * Save action completed.
     *
     * @hidden
     * @returns {void} - Save action completed.
     */
    private saveCompleted;
    private showErrorDialog;
}
