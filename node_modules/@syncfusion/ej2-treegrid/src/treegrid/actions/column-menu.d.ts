import { TreeGrid } from '../base/treegrid';
/**
 * TreeGrid ColumnMenu module
 *
 * @hidden
 */
export declare class ColumnMenu {
    private parent;
    /**
     * Constructor for render module
     *
     * @param {TreeGrid} parent - Tree Grid instance
     */
    constructor(parent?: TreeGrid);
    getColumnMenu(): HTMLElement;
    destroy(): void;
    /**
     * For internal use only - Get the module name.
     *
     * @private
     * @returns {string} Returns ColumnMenu module name
     */
    private getModuleName;
}
