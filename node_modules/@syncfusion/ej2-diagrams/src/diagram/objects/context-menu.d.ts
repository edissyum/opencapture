import { ContextMenu as Menu, MenuItemModel } from '@syncfusion/ej2-navigations';
import { ServiceLocator } from './service';
import { Diagram } from '../diagram';
/**
 * @private
 */
export declare const menuClass: ContextMenuClassList;
/**
 * @private
 */
export interface ContextMenuClassList {
    copy: string;
    paste: string;
    content: string;
    undo: string;
    redo: string;
    cut: string;
    selectAll: string;
    grouping: string;
    group: string;
    unGroup: string;
    bringToFront: string;
    sendToBack: string;
    moveForward: string;
    sendBackward: string;
    order: string;
}
/**
 * 'ContextMenu module used to handle context menu actions.'
 *
 * @private
 */
export declare class DiagramContextMenu {
    private element;
    /**   @private  */
    contextMenu: Menu;
    private defaultItems;
    /**
     * @private
     */
    disableItems: string[];
    /**
     * @private
     */
    hiddenItems: string[];
    private parent;
    private l10n;
    private serviceLocator;
    private localeText;
    private eventArgs;
    /**
     * @private
     */
    isOpen: boolean;
    constructor(parent?: Diagram, service?: ServiceLocator);
    /**
     * addEventListener method \
     *
     * @returns { void } addEventListener method .\
     *
     * @private
     */
    addEventListener(): void;
    /**
     * removeEventListener method \
     *
     * @returns { void } removeEventListener method .\
     *
     * @private
     */
    removeEventListener(): void;
    private render;
    private getMenuItems;
    private contextMenuOpen;
    private BeforeItemRender;
    private contextMenuItemClick;
    private contextMenuOnClose;
    private getLocaleText;
    private updateItemStatus;
    /**
     * ensureItems method \
     *
     * @returns { void } ensureItems method .\
     * @param {MenuItemModel} item - provide the item value.
     * @param {Event} event - provide the event value.
     *
     * @private
     */
    ensureItems(item: MenuItemModel, event?: Event): void;
    /**
     * refreshItems method \
     *
     * @returns { void } refreshItems method .\
     *
     * @private
     */
    refreshItems(): void;
    private updateItems;
    private contextMenuBeforeOpen;
    private ensureTarget;
    /**
     *To destroy the context menu
     *
     * @returns {void} To destroy the context menu
     */
    destroy(): void;
    private getModuleName;
    private generateID;
    private getKeyFromId;
    private buildDefaultItems;
    private getDefaultItems;
    private setLocaleKey;
}
