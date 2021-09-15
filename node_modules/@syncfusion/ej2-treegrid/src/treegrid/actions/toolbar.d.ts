import { TreeGrid } from '../base';
/**
 * Toolbar Module for TreeGrid
 *
 * @hidden
 */
export declare class Toolbar {
    private parent;
    constructor(parent: TreeGrid);
    /**
     * For internal use only - Get the module name.
     *
     * @private
     * @returns {string} - Returns Toolbar module name
     */
    private getModuleName;
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
    private refreshToolbar;
    private toolbarClickHandler;
    /**
     * Gets the toolbar of the TreeGrid.
     *
     * @returns {Element} - Returns Toolbar element
     * @hidden
     */
    getToolbar(): Element;
    /**
     * Enables or disables ToolBar items.
     *
     * @param {string[]} items - Defines the collection of itemID of ToolBar items.
     * @param {boolean} isEnable - Defines the items to be enabled or disabled.
     * @returns {void}
     * @hidden
     */
    enableItems(items: string[], isEnable: boolean): void;
    /**
     * Destroys the ToolBar.
     *
     * @method destroy
     * @returns {void}
     */
    destroy(): void;
}
