import { TreeGrid } from '../base';
/**
 * Command Column Module for TreeGrid
 *
 * @hidden
 */
export declare class CommandColumn {
    private parent;
    constructor(parent: TreeGrid);
    /**
     * For internal use only - Get the module name.
     *
     * @private
     * @returns {string} Returns CommandColumn module name
     */
    protected getModuleName(): string;
    /**
     * Destroys the ContextMenu.
     *
     * @function destroy
     * @returns {void}
     */
    destroy(): void;
}
