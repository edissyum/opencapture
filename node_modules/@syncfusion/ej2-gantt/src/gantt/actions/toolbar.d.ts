/**
 * Toolbar action related code goes here
 */
import { Gantt } from '../base/gantt';
import { Toolbar as NavToolbar } from '@syncfusion/ej2-navigations';
import { RowSelectEventArgs } from '@syncfusion/ej2-grids';
export declare class Toolbar {
    private parent;
    private predefinedItems;
    private id;
    toolbar: NavToolbar;
    private items;
    element: HTMLElement;
    private searchElement;
    constructor(parent: Gantt);
    private getModuleName;
    /**
     * @returns {void} .
     * @private
     */
    renderToolbar(): void;
    private createToolbar;
    private getSearchBarElement;
    private wireEvent;
    private propertyChanged;
    private unWireEvent;
    private keyUpHandler;
    private focusHandler;
    private blurHandler;
    /**
     * Method to set value for search input box
     *
     * @returns {void} .
     * @hidden
     */
    updateSearchTextBox(): void;
    private getItems;
    private getItem;
    private getItemObject;
    private toolbarClickHandler;
    /**
     *
     * @returns {void} .
     * @private
     */
    zoomIn(): void;
    /**
     *
     * @returns {void} .
     * @private
     */
    zoomToFit(): void;
    /**
     *
     * @returns {void} .
     * @private
     */
    zoomOut(): void;
    /**
     * To refresh toolbar items bases current state of tasks
     *
     * @param {RowSelectEventArgs} args .
     * @returns {void} .
     */
    refreshToolbarItems(args?: RowSelectEventArgs): void;
    /**
     * Enables or disables ToolBar items.
     *
     * @param {string[]} items - Defines the collection of itemID of ToolBar items.
     * @param {boolean} isEnable - Defines the items to be enabled or disabled.
     * @returns {void} .
     * @hidden
     */
    enableItems(items: string[], isEnable: boolean): void;
    /**
     * Destroys the Sorting of TreeGrid.
     *
     * @function destroy
     * @returns {void} .
     * @private
     */
    destroy(): void;
}
