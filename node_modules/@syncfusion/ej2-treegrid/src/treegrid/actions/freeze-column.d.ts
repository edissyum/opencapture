import { TreeGrid } from '../base/treegrid';
/**
 * TreeGrid Freeze module
 *
 * @hidden
 */
export declare class Freeze {
    private parent;
    /**
     * Constructor for render module
     *
     * @param {TreeGrid} parent - Tree Grid instance
     */
    constructor(parent?: TreeGrid);
    addEventListener(): void;
    removeEventListener(): void;
    private rowExpandCollapse;
    private dblClickHandler;
    private dataBoundArg;
    destroy(): void;
    /**
     * For internal use only - Get the module name.
     *
     * @private
     * @returns {string} Returns Freeze module name
     */
    private getModuleName;
}
