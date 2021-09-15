import { Component, INotifyPropertyChanged, EmitType, ChildProperty } from '@syncfusion/ej2-base';
import { Tab, ItemModel, SelectingEventArgs, MenuItemModel, ClickEventArgs } from '@syncfusion/ej2-navigations';
import { MenuEventArgs, BeforeOpenCloseMenuEventArgs } from '@syncfusion/ej2-navigations';
import { RibbonModel, RibbonItemModel, RibbonHeaderModel } from './ribbon-model';
import { SelectEventArgs } from '@syncfusion/ej2-dropdowns';
/**
 * Objects used for configuring the Ribbon tab header properties.
 */
export declare class RibbonHeader extends ChildProperty<RibbonHeader> {
    /**
     * Specifies the display text of the Ribbon tab header.
     *
     * @default ''
     */
    text: string;
    /**
     * Specifies the icon class that is used to render an icon in the Ribbon tab header.
     *
     * @default ''
     */
    iconCss: string;
    /**
     * Options for positioning the icon in the Ribbon tab header. This property depends on `iconCss` property.
     * The possible values are:
     * - Left: Places the icon to the `left` of the item.
     * - Top: Places the icon on the `top` of the item.
     * - Right: Places the icon to the `right` end of the item.
     * - Bottom: Places the icon at the `bottom` of the item.
     *
     * @default 'left'
     */
    iconPosition: string;
}
/**
 * An array of object that is used to configure the Tab.
 */
export declare class RibbonItem extends ChildProperty<RibbonItem> {
    /**
     * The object used for configuring the Tab item header properties.
     *
     * @default {}
     */
    header: RibbonHeaderModel;
    /**
     * Specifies the content of Tab item, that is displayed when concern item header is selected.
     *
     * @default ''
     */
    content: ItemModel[];
    /**
     * Sets the CSS classes to the Tab item to customize its styles.
     *
     * @default ''
     */
    cssClass: string;
    /**
     * Sets true to disable user interactions of the Tab item.
     *
     * @default false
     */
    disabled: boolean;
}
/**
 * Interface for ribbon content expand/collapse event.
 */
export interface ExpandCollapseEventArgs {
    /** Ribbon content element */
    element: HTMLElement;
    /** Represent whether the ribbon content is expanded/collapsed */
    expanded: boolean;
}
/**
 * Represents Ribbon component.
 */
export declare class Ribbon extends Component<HTMLDivElement> implements INotifyPropertyChanged {
    private toolbarObj;
    tabObj: Tab;
    /**
     * Defines class/multiple classes separated by a space in the Spreadsheet element.
     *
     * @default ""
     */
    cssClass: string;
    /**
     * Used the specify the ribbon menu type as `Menu` or `Sidebar`.
     *
     * @default true
     */
    menuType: boolean;
    /**
     * An array of object that is used to configure the Ribbon menu.
     *
     * @default []
     */
    menuItems: MenuItemModel[];
    /**
     * Specifies the index for activating the current Ribbon tab.
     *
     * @default 0
     */
    selectedTab: number;
    /**
     * An array of object that is used to configure the Ribbon tab.
     *
     * @default []
     */
    items: RibbonItemModel[];
    /**
     * Triggers while selecting the tab item.
     *
     * @event anEvent
     */
    selecting: EmitType<SelectingEventArgs>;
    /**
     * Triggers while selecting the file menu item.
     *
     * @event anEvent
     */
    fileMenuItemSelect: EmitType<MenuEventArgs>;
    /**
     * Triggers while rendering each file menu item.
     *
     * @event anEvent
     */
    beforeFileMenuItemRender: EmitType<MenuEventArgs>;
    /**
     * Triggers before opening the file menu.
     *
     * @event anEvent
     */
    beforeOpen: EmitType<BeforeOpenCloseMenuEventArgs>;
    /**
     * Triggers before closing the file menu.
     *
     * @event anEvent
     */
    beforeClose: EmitType<BeforeOpenCloseMenuEventArgs>;
    /**
     * Triggers format dropdown items gets selected.
     *
     * @event anEvent
     * @hidden
     */
    selectFormat: EmitType<SelectEventArgs>;
    /**
     * Triggers while clicking the ribbon content elements.
     *
     * @event anEvent
     */
    clicked: EmitType<ClickEventArgs>;
    /**
     * Triggers once the component rendering is completed.
     *
     * @event anEvent
     */
    created: EmitType<Event>;
    /**
     * Triggers once the component rendering is completed.
     *
     * @event anEvent
     */
    expandCollapse: EmitType<ExpandCollapseEventArgs>;
    /**
     * Constructor for creating the widget.
     *
     * @param {RibbonModel} options - Specify the options
     * @param {string|HTMLDivElement} element -specify the element.
     */
    constructor(options?: RibbonModel, element?: string | HTMLDivElement);
    /**
     * For internal use only.
     *
     * @returns {void} - For internal use only.
     * @private
     */
    protected preRender(): void;
    /**
     * For internal use only.
     *
     * @returns {void} - For internal use only.
     * @private
     */
    protected render(): void;
    /**
     * Destroys the component (detaches/removes all event handlers, attributes, classes, and empties the component element).
     *
     * {% codeBlock src='spreadsheet/destroy/index.md' %}{% endcodeBlock %}
     *
     * @function destroy
     * @returns {void} - Destroys the component
     */
    destroy(): void;
    private getTabItems;
    private initMenu;
    private renderRibbon;
    private ribbonExpandCollapse;
    private getIndex;
    private updateToolbar;
    /**
     * To enable / disable the ribbon menu items.
     *
     * @param {string[]} items - Items that needs to be enabled / disabled.
     * @param {boolean} enable - Set `true` / `false` to enable / disable the menu items.
     * @param {boolean} isUniqueId - Set `true` if the given menu items `text` is a unique id.
     * @returns {void} - To enable / disable the ribbon menu items.
     */
    enableMenuItems(items: string[], enable?: boolean, isUniqueId?: boolean): void;
    /**
     * To show/hide the menu items in Ribbon.
     *
     * @param {string[]} items - Specifies the menu items text which is to be show/hide.
     * @param {boolean} hide - Set `true` / `false` to hide / show the menu items.
     * @param {boolean} isUniqueId - Set `true` if the given menu items `text` is a unique id.
     * @returns {void} - To show/hide the menu items in Ribbon.
     */
    hideMenuItems(items: string[], hide?: boolean, isUniqueId?: boolean): void;
    /**
     * To add custom menu items.
     *
     * @param {MenuItemModel[]} items - Specifies the Ribbon menu items to be inserted.
     * @param {string} text - Specifies the existing file menu item text before / after which the new file menu items to be inserted.
     * @param {boolean} insertAfter - Set `false` if the `items` need to be inserted before the `text`.
     * By default, `items` are added after the `text`.
     * @param {boolean} isUniqueId - Set `true` if the given menu items `text` is a unique id.
     * @returns {void} - To add custom menu items.
     */
    addMenuItems(items: MenuItemModel[], text: string, insertAfter?: boolean, isUniqueId?: boolean): void;
    /**
     * To show/hide the Ribbon tabs.
     *
     * @param {string[]} tabs - Specifies the tab header text which needs to be shown/hidden.
     * @param {boolean} hide - Set `true` / `false` to hide / show the ribbon tabs.
     * @returns {void} - To show/hide the Ribbon tabs.
     */
    hideTabs(tabs: string[], hide?: boolean): void;
    private isAllHidden;
    /**
     * To enable / disable the Ribbon tabs.
     *
     * @param {string[]} tabs - Specifies the tab header text which needs to be enabled / disabled.
     * @param {boolean} enable - Set `true` / `false` to enable / disable the ribbon tabs.
     * @returns {void} - To enable / disable the Ribbon tabs.
     */
    enableTabs(tabs: string[], enable?: boolean): void;
    /**
     * To add custom tabs.
     *
     * @param {RibbonItemModel[]} items - Specifies the Ribbon tab items to be inserted.
     * @param {string} insertBefore - Specifies the existing Ribbon header text before which the new tabs will be inserted.
     * If not specified, the new tabs will be inserted at the end.
     * @returns {void} - To add custom tabs.
     */
    addTabs(items: RibbonItemModel[], insertBefore?: string): void;
    private getTabIndex;
    /**
     * To add the custom items in Ribbon toolbar.
     *
     * @param {string} tab - Specifies the ribbon tab header text under which the specified items will be inserted..
     * @param {ItemModel[]} items - Specifies the ribbon toolbar items that needs to be inserted.
     * @param {number} index - Specifies the index text before which the new items will be inserted.
     * @returns {void} - To add the custom items in Ribbon toolbar.
     * If not specified, the new items will be inserted at the end of the toolbar.
     */
    addToolbarItems(tab: string, items: ItemModel[], index?: number): void;
    /**
     * Enables or disables the specified Ribbon toolbar items or all ribbon items.
     *
     * @param {string} tab - Specifies the ribbon tab header text under which the toolbar items need to be enabled / disabled.
     * @param {number[]} items - Specifies the toolbar item indexes / unique id's which needs to be enabled / disabled.
     * If it is not specified the entire toolbar items will be enabled / disabled.
     * @param  {boolean} enable - Boolean value that determines whether the toolbar items should be enabled or disabled.
     * @returns {void} - Enables or disables the specified Ribbon toolbar items or all ribbon items.
     */
    enableItems(tab: string, items?: number[] | string[], enable?: boolean): void;
    /**
     * To show/hide the existing Ribbon toolbar items.
     *
     * @param {string} tab - Specifies the ribbon tab header text under which the specified items need to be hidden / shown.
     * @param {number[]} indexes - Specifies the toolbar indexes which needs to be shown/hidden from UI.
     * @param {boolean} hide - Set `true` / `false` to hide / show the toolbar items.
     * @returns {void} - To show/hide the existing Ribbon toolbar items.
     */
    hideToolbarItems(tab: string, indexes: number[], hide?: boolean): void;
    /**
     * Get component name.
     *
     * @returns {string} - Get component name.
     * @private
     */
    getModuleName(): string;
    /**
     * Get the properties to be maintained in the persisted state.
     *
     * @returns {string} - Get the properties to be maintained in the persisted state.
     * @private
     */
    getPersistData(): string;
    /**
     * Called internally if any of the property value changed.
     *
     * @param {RibbonModel} newProp - Specify the new properties
     * @param {RibbonModel} oldProp - specify the old properties.
     * @returns {void} - if any of the property value changed.
     * @private
     */
    onPropertyChanged(newProp: RibbonModel, oldProp: RibbonModel): void;
}
