import { Spreadsheet } from '../base/spreadsheet';
/**
 * Represents Wrap Text support for Spreadsheet.
 */
export declare class WrapText {
    private parent;
    /**
     * Constructor for the Spreadsheet Wrap Text module.
     *
     * @param {Spreadsheet} parent - Specifies the Spreadsheet.
     * @private
     */
    constructor(parent: Spreadsheet);
    private addEventListener;
    private removeEventListener;
    private wrapTextHandler;
    private ribbonClickHandler;
    private rowHeightChangedHandler;
    /**
     * For internal use only - Get the module name.
     *
     * @returns {string} - Get the module name.
     * @private
     */
    protected getModuleName(): string;
    destroy(): void;
}
