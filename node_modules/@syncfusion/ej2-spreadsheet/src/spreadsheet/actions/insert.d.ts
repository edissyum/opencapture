import { Spreadsheet } from '../base/index';
/**
 * The `Insert` module is used to insert cells, rows, columns and sheets in to the spreadsheet.
 */
export declare class Insert {
    private parent;
    /**
     * Constructor for the Spreadsheet insert module.
     *
     * @param {Spreadsheet} parent - Specify the spreadsheet instance.
     * @private
     */
    constructor(parent: Spreadsheet);
    private insert;
    private refreshImgElement;
    private addEventListener;
    /**
     * Destroy insert module.
     *
     * @returns {void} - Destroy insert module.
     */
    destroy(): void;
    private removeEventListener;
    /**
     * Get the insert module name.
     *
     * @returns {string} - Get the insert module name.
     */
    getModuleName(): string;
}
