import { TreeGrid } from '../base/treegrid';
/**
 * TreeGrid Print module
 *
 * @hidden
 */
export declare class Print {
    private parent;
    /**
     * Constructor for Print module
     *
     * @param {TreeGrid} parent - Tree Grid instance
     */
    constructor(parent?: TreeGrid);
    /**
     * For internal use only - Get the module name.
     *
     * @private
     * @returns {string} Returns Print module name
     */
    private getModuleName;
    /**
     * @hidden
     * @returns {void}
     */
    addEventListener(): void;
    removeEventListener(): void;
    private printTreeGrid;
    print(): void;
    /**
     * To destroy the Print
     *
     * @returns {void}
     * @hidden
     */
    destroy(): void;
}
