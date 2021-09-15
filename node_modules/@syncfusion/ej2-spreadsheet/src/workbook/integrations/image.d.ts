import { Workbook } from '../base/index';
/**
 * Specifies image.
 */
export declare class WorkbookImage {
    private parent;
    constructor(parent: Workbook);
    private setImage;
    /**
     * Adding event listener for number format.
     *
     * @returns {void} - Adding event listener for number format.
     */
    private addEventListener;
    /**
     * Removing event listener for number format.
     *
     * @returns {void}
     */
    private removeEventListener;
    /**
     * To Remove the event listeners.
     *
     * @returns {void} - To Remove the event listeners.
     */
    destroy(): void;
    /**
     * Get the workbook number format module name.
     *
     * @returns {string} - Get the module name.
     */
    getModuleName(): string;
}
