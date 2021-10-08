import { ContextMenu as Menu, MenuItemModel } from '@syncfusion/ej2-navigations';
import { DocumentHelper } from './viewer';
import { L10n } from '@syncfusion/ej2-base';
/**
 * Context Menu class
 */
export declare class ContextMenu {
    private documentHelper;
    /**
     * @private
     */
    contextMenuInstance: Menu;
    /**
     * @private
     */
    contextMenu: HTMLElement;
    /**
     * @private
     */
    menuItems: MenuItemModel[];
    /**
     * @private
     */
    customMenuItems: MenuItemModel[];
    /**
     * @private
     */
    locale: L10n;
    /**
     * @private
     */
    ids: string[];
    /**
     * @private
     */
    enableCustomContextMenu: boolean;
    /**
     * @private
     */
    enableCustomContextMenuBottom: boolean;
    private currentContextInfo;
    private noSuggestion;
    private spellContextItems;
    private customItems;
    /**
     * @param {DocumentHelper} documentHelper - Specifies the document helper.
     * @private
     */
    constructor(documentHelper: DocumentHelper);
    private readonly viewer;
    private readonly spellChecker;
    private getModuleName;
    /**
     * Initialize context menu.
     *
     * @param localValue Localize value.
     * @private
     */
    initContextMenu(localValue: L10n, isRtl?: boolean): void;
    /**
     * Disable browser context menu.
     */
    private disableBrowserContextmenu;
    /**
     * Handles context menu items.
     * @param  {string} item Specifies which item is selected.
     * @private
     */
    handleContextMenuItem(item: string): void;
    /**
     * Method to call the selected item
     * @param {string} content
     */
    private callSelectedOption;
    /**
     * To add and customize custom context menu
     * @param {MenuItemModel[]} items - To add custom menu item
     * @param {boolean} isEnable - To hide existing menu item and show custom menu item alone
     * @param {boolean} isBottom - To show the custom menu item in bottom of the existing item
     * @returns {void}
     */
    addCustomMenu(items: MenuItemModel[], isEnable?: boolean, isBottom?: boolean): void;
    /**
     * Context Menu Items.
     * @param {MenuItemModel[]} menuItems - To add MenuItem to context menu
     * @private
     */
    addMenuItems(menuItems: MenuItemModel[]): MenuItemModel[];
    /**
     * Handles on context menu key pressed.
     * @param  {MouseEvent} event
     * @private
     */
    onContextMenuInternal: (event: MouseEvent | TouchEvent) => void;
    /**
     * Opens context menu.
     * @param {MouseEvent | TouchEvent} event
     */
    private showContextMenuOnSel;
    /**
     * Method to hide spell context items
     */
    hideSpellContextItems(): void;
    /**
     * Method to process suggestions to add in context menu
     * @param {any} allSuggestions
     * @param {string[]} splittedSuggestion
     * @param {MouseEvent} event
     * @private
     */
    processSuggestions(allSuggestions: any, splittedSuggestion: string[], event: MouseEvent | TouchEvent): void;
    /**
     * Method to add inline menu
     * @private
     */
    constructContextmenu(allSuggestion: any[], splittedSuggestion: any): any[];
    private showHideElements;
    /**
     * Disposes the internal objects which are maintained.
     * @private
     */
    destroy(): void;
}
