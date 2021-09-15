import { TreeGrid } from '../base/treegrid';
/**
 * TreeGrid Reorder module
 *
 * @hidden
 */
export declare class Reorder {
    private parent;
    /**
     * Constructor for Reorder module
     *
     * @param {TreeGrid} parent - Tree Grid instance
     */
    constructor(parent?: TreeGrid);
    /**
     * For internal use only - Get the module name.
     *
     * @private
     * @returns {string} Returns Reorder module name
     */
    private getModuleName;
    /**
     * @hidden
     * @returns {void}
     */
    addEventListener(): void;
    removeEventListener(): void;
    /**
     * To destroy the Reorder
     *
     * @returns {void}
     * @hidden
     */
    destroy(): void;
    private getTreeColumn;
}
