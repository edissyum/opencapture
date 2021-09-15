import { TreeGrid } from '../base/treegrid';
/**
 * TreeGrid Resize module
 *
 * @hidden
 */
export declare class Resize {
    private parent;
    /**
     * Constructor for Resize module
     *
     * @param {TreeGrid} parent - Tree Grid instance
     */
    constructor(parent?: TreeGrid);
    /**
     * Resize by field names.
     *
     * @param  {string|string[]} fName - Defines the field name.
     * @returns {void}
     */
    autoFitColumns(fName?: string | string[]): void;
    /**
     * For internal use only - Get the module name.
     *
     * @private
     * @returns {string} Returns Resize module name
     */
    private getModuleName;
    /**
     * Destroys the Resize.
     *
     * @function destroy
     * @returns {void}
     */
    destroy(): void;
}
