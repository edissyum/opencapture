import { Spreadsheet } from '../base/index';
/**
 * The `Delete` module is used to delete cells, rows, columns and sheets from the spreadsheet.
 */
export declare class Delete {
    private parent;
    /**
     * Constructor for the Spreadsheet insert module.
     *
     * @param {Spreadsheet} parent - Constructor for the Spreadsheet insert module.
     * @private
     */
    constructor(parent: Spreadsheet);
    private delete;
    private refreshImgElement;
    private addEventListener;
    /**
     * Destroy delete module.
     *
     * @returns {void} - Destroy delete module.
     */
    destroy(): void;
    private removeEventListener;
    /**
     * Get the delete module name.
     *
     * @returns {string} - Get the delete module name.
     */
    getModuleName(): string;
}
