import { TreeGrid } from '../base';
/**
 * ContextMenu Module for TreeGrid
 *
 * @hidden
 */
export declare class ContextMenu {
    private parent;
    constructor(parent: TreeGrid);
    /**
     * @hidden
     * @returns {void}
     */
    addEventListener(): void;
    /**
     * @hidden
     * @returns {void}
     */
    removeEventListener(): void;
    private contextMenuOpen;
    private contextMenuClick;
    /**
     * For internal use only - Get the module name.
     *
     * @private
     * @returns {string} Returns ContextMenu module name
     */
    protected getModuleName(): string;
    /**
     * Destroys the ContextMenu.
     *
     * @function destroy
     * @returns {void}
     */
    destroy(): void;
    /**
     * Gets the context menu element from the TreeGrid.
     *
     * @returns {Element} Return Context Menu root element.
     */
    getContextMenu(): Element;
}
