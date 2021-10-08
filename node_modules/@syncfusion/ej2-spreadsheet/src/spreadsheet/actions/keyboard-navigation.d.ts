import { Spreadsheet } from '../base/index';
/**
 * Represents keyboard navigation support for Spreadsheet.
 */
export declare class KeyboardNavigation {
    private parent;
    /**
     * Constructor for the Spreadsheet Keyboard Navigation module.
     *
     * @private
     * @param {Spreadsheet} parent - Specify the spreadsheet
     */
    constructor(parent: Spreadsheet);
    private addEventListener;
    private removeEventListener;
    private keyDownHandler;
    private shiftSelection;
    private scrollNavigation;
    private getBottomIdx;
    private getRightIdx;
    /**
     * For internal use only - Get the module name.
     *
     * @private
     * @returns {string} - Get the module name.
     */
    protected getModuleName(): string;
    destroy(): void;
}
