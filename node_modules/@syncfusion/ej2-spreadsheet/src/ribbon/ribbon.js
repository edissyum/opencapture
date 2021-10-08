var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
/* eslint-disable @typescript-eslint/no-unused-vars */
import { Component, Property, NotifyPropertyChanges, Event, ChildProperty } from '@syncfusion/ej2-base';
import { getComponent, closest, EventHandler, getUniqueID, isNullOrUndefined } from '@syncfusion/ej2-base';
import { Collection, Complex } from '@syncfusion/ej2-base';
import { Tab, Toolbar } from '@syncfusion/ej2-navigations';
import { Menu, Item, MenuItem } from '@syncfusion/ej2-navigations';
/**
 * Objects used for configuring the Ribbon tab header properties.
 */
var RibbonHeader = /** @class */ (function (_super) {
    __extends(RibbonHeader, _super);
    function RibbonHeader() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    __decorate([
        Property('')
    ], RibbonHeader.prototype, "text", void 0);
    __decorate([
        Property('')
    ], RibbonHeader.prototype, "iconCss", void 0);
    __decorate([
        Property('left')
    ], RibbonHeader.prototype, "iconPosition", void 0);
    return RibbonHeader;
}(ChildProperty));
export { RibbonHeader };
/**
 * An array of object that is used to configure the Tab.
 */
var RibbonItem = /** @class */ (function (_super) {
    __extends(RibbonItem, _super);
    function RibbonItem() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    __decorate([
        Complex({}, RibbonHeader)
    ], RibbonItem.prototype, "header", void 0);
    __decorate([
        Collection([], Item)
    ], RibbonItem.prototype, "content", void 0);
    __decorate([
        Property('')
    ], RibbonItem.prototype, "cssClass", void 0);
    __decorate([
        Property(false)
    ], RibbonItem.prototype, "disabled", void 0);
    return RibbonItem;
}(ChildProperty));
export { RibbonItem };
/**
 * Represents Ribbon component.
 */
var Ribbon = /** @class */ (function (_super) {
    __extends(Ribbon, _super);
    /**
     * Constructor for creating the widget.
     *
     * @param {RibbonModel} options - Specify the options
     * @param {string|HTMLDivElement} element -specify the element.
     */
    function Ribbon(options, element) {
        return _super.call(this, options) || this;
    }
    /**
     * For internal use only.
     *
     * @returns {void} - For internal use only.
     * @private
     */
    Ribbon.prototype.preRender = function () {
        /** */
    };
    /**
     * For internal use only.
     *
     * @returns {void} - For internal use only.
     * @private
     */
    Ribbon.prototype.render = function () {
        if (!this.element.id) {
            this.element.id = getUniqueID('ribbon');
        }
        this.renderRibbon();
    };
    /**
     * Destroys the component (detaches/removes all event handlers, attributes, classes, and empties the component element).
     *
     * {% codeBlock src='spreadsheet/destroy/index.md' %}{% endcodeBlock %}
     *
     * @function destroy
     * @returns {void} - Destroys the component
     */
    Ribbon.prototype.destroy = function () {
        var expandCollapseElem = this.element.querySelector('.e-drop-icon');
        if (expandCollapseElem) {
            expandCollapseElem.removeEventListener('click', this.ribbonExpandCollapse.bind(this));
        }
        if (this.menuItems.length) {
            var fileMenu = document.getElementById(this.element.id + "_menu");
            if (fileMenu) {
                getComponent(fileMenu, 'menu').destroy();
            }
        }
        this.toolbarObj.destroy();
        this.tabObj.destroy();
        this.element.innerHTML = '';
        this.toolbarObj = null;
        this.tabObj = null;
        _super.prototype.destroy.call(this);
    };
    Ribbon.prototype.getTabItems = function () {
        var _this = this;
        var tabItems = [];
        if (this.menuItems.length) {
            tabItems.push({
                header: { text: this.initMenu(this.menuItems) },
                content: this.toolbarObj.element,
                cssClass: 'e-menu-tab'
            });
        }
        this.items.forEach(function (item) {
            tabItems.push({
                header: item.header,
                content: _this.toolbarObj.element
            });
        });
        return tabItems;
    };
    Ribbon.prototype.initMenu = function (menuItems) {
        var _this = this;
        var menu = this.createElement('ul', { id: this.element.id + "_menu" });
        this.element.appendChild(menu);
        var menuObj = new Menu({
            cssClass: 'e-file-menu',
            items: menuItems,
            showItemOnClick: true,
            beforeOpen: function (args) {
                if (args.parentItem.text === menuItems[0].text) {
                    menuObj.showItemOnClick = false;
                }
                _this.trigger('beforeOpen', args);
            },
            select: function (args) {
                _this.trigger('fileMenuItemSelect', args);
            },
            beforeClose: function (args) {
                if (args.event.type === 'mouseover' && !closest(args.event.target, '.e-menu-popup')) {
                    args.cancel = true;
                    return;
                }
                _this.trigger('beforeClose', args);
                if (!args.parentItem || args.parentItem.text === menuItems[0].text) {
                    requestAnimationFrame(function () { return menuObj.setProperties({ showItemOnClick: true }, true); });
                }
            },
            beforeItemRender: function (args) {
                _this.trigger('beforeFileMenuItemRender', args);
            }
        });
        menuObj.createElement = this.createElement;
        menuObj.appendTo(menu);
        return menu.parentElement;
    };
    Ribbon.prototype.renderRibbon = function () {
        var _this = this;
        var tabElement = this.createElement('div');
        var tBarElement = this.createElement('div');
        this.toolbarObj = new Toolbar({
            items: this.items[this.selectedTab].content,
            clicked: function (args) { return _this.trigger('clicked', args); }
        });
        this.toolbarObj.createElement = this.createElement;
        this.toolbarObj.appendTo(tBarElement);
        this.tabObj = new Tab({
            selectedItem: this.getIndex(this.selectedTab),
            animation: { next: { duration: 0 }, previous: { duration: 0 } },
            items: this.getTabItems(),
            selecting: function (args) {
                if (_this.menuItems.length && args.selectingIndex === 0) {
                    args.cancel = true;
                }
                else {
                    if (args.selectingIndex === _this.getIndex(_this.selectedTab)) {
                        return;
                    }
                    _this.updateToolbar(_this.getIndex(args.selectingIndex, true));
                    _this.toolbarObj.dataBind();
                    if (_this.element.classList.contains('e-collapsed')) {
                        EventHandler.remove(args.selectedItem, 'click', _this.ribbonExpandCollapse);
                    }
                    var eventArgs = void 0;
                    if (_this.menuItems.length) {
                        eventArgs = __assign({}, args);
                        eventArgs.selectingIndex -= 1;
                        eventArgs.selectedIndex -= 1;
                    }
                    else {
                        eventArgs = args;
                    }
                    _this.trigger('selecting', eventArgs);
                }
            },
            selected: function (args) {
                if (args.selectedIndex === _this.getIndex(_this.selectedTab)) {
                    return;
                }
                _this.setProperties({ 'selectedTab': _this.getIndex(args.selectedIndex, true) }, true);
                if (_this.element.classList.contains('e-collapsed')) {
                    _this.element.classList.remove('e-collapsed');
                    _this.trigger('expandCollapse', { element: _this.toolbarObj.element, expanded: true });
                }
            },
            created: function () {
                _this.toolbarObj.refreshOverflow();
            }
        });
        this.element.appendChild(tabElement);
        this.tabObj.createElement = this.createElement;
        this.tabObj.appendTo(tabElement);
        var collapseBtn = this.createElement('span', { className: 'e-drop-icon e-icons' });
        collapseBtn.addEventListener('click', this.ribbonExpandCollapse.bind(this));
        this.element.appendChild(collapseBtn);
    };
    Ribbon.prototype.ribbonExpandCollapse = function (e) {
        var eventArgs = { element: this.toolbarObj.element, expanded: true };
        var activeTab;
        if (this.element.classList.contains('e-collapsed')) {
            activeTab = this.tabObj.element.querySelector('.e-tab-header').getElementsByClassName('e-toolbar-item')[this.tabObj.selectedItem];
            this.element.classList.remove('e-collapsed');
            activeTab.classList.add('e-active');
            EventHandler.remove(activeTab, 'click', this.ribbonExpandCollapse);
            this.trigger('expandCollapse', eventArgs);
        }
        else {
            activeTab = this.tabObj.element.querySelector('.e-tab-header .e-toolbar-item.e-active');
            this.element.classList.add('e-collapsed');
            eventArgs.expanded = false;
            activeTab.classList.remove('e-active');
            EventHandler.add(activeTab, 'click', this.ribbonExpandCollapse, this);
            this.trigger('expandCollapse', eventArgs);
        }
    };
    Ribbon.prototype.getIndex = function (index, decrement) {
        return this.menuItems.length ? (decrement ? index - 1 : index + 1) : index;
    };
    Ribbon.prototype.updateToolbar = function (index) {
        this.toolbarObj.items = this.items[index].content;
        this.toolbarObj.dataBind();
    };
    /**
     * To enable / disable the ribbon menu items.
     *
     * @param {string[]} items - Items that needs to be enabled / disabled.
     * @param {boolean} enable - Set `true` / `false` to enable / disable the menu items.
     * @param {boolean} isUniqueId - Set `true` if the given menu items `text` is a unique id.
     * @returns {void} - To enable / disable the ribbon menu items.
     */
    Ribbon.prototype.enableMenuItems = function (items, enable, isUniqueId) {
        if (enable === void 0) { enable = true; }
        if (!this.menuItems.length) {
            return;
        }
        getComponent(document.getElementById(this.element.id + "_menu"), 'menu').enableItems(items, enable, isUniqueId);
    };
    /**
     * To show/hide the menu items in Ribbon.
     *
     * @param {string[]} items - Specifies the menu items text which is to be show/hide.
     * @param {boolean} hide - Set `true` / `false` to hide / show the menu items.
     * @param {boolean} isUniqueId - Set `true` if the given menu items `text` is a unique id.
     * @returns {void} - To show/hide the menu items in Ribbon.
     */
    Ribbon.prototype.hideMenuItems = function (items, hide, isUniqueId) {
        if (hide === void 0) { hide = true; }
        if (!this.menuItems.length) {
            return;
        }
        var menuInstance = getComponent(document.getElementById(this.element.id + "_menu"), 'menu');
        if (hide) {
            menuInstance.hideItems(items, isUniqueId);
        }
        else {
            menuInstance.showItems(items, isUniqueId);
        }
    };
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
    Ribbon.prototype.addMenuItems = function (items, text, insertAfter, isUniqueId) {
        if (insertAfter === void 0) { insertAfter = true; }
        if (!this.menuItems.length) {
            return;
        }
        var menuInstance = getComponent(document.getElementById(this.element.id + "_menu"), 'menu');
        if (insertAfter) {
            menuInstance.insertAfter(items.reverse(), text, isUniqueId);
        }
        else {
            menuInstance.insertBefore(items, text, isUniqueId);
        }
    };
    /**
     * To show/hide the Ribbon tabs.
     *
     * @param {string[]} tabs - Specifies the tab header text which needs to be shown/hidden.
     * @param {boolean} hide - Set `true` / `false` to hide / show the ribbon tabs.
     * @returns {void} - To show/hide the Ribbon tabs.
     */
    Ribbon.prototype.hideTabs = function (tabs, hide) {
        var _this = this;
        if (hide === void 0) { hide = true; }
        var idx;
        var activeTab;
        var stateChanged;
        var isAllHidden;
        if (!hide) {
            isAllHidden = this.isAllHidden();
        }
        tabs.forEach(function (tab) {
            idx = _this.getTabIndex(tab, -1);
            if (idx > -1) {
                if (hide) {
                    if (!_this.items[idx].cssClass.includes(' e-hide')) {
                        _this.items[idx].cssClass = _this.items[idx].cssClass + " e-hide";
                        _this.tabObj.items[_this.getIndex(idx)].cssClass = _this.items[idx].cssClass;
                        if (activeTab === undefined && idx === _this.selectedTab) {
                            activeTab = true;
                        }
                        stateChanged = true;
                    }
                }
                else {
                    if (_this.items[idx].cssClass.includes(' e-hide')) {
                        _this.items[idx].cssClass = _this.items[idx].cssClass.replace(' e-hide', '');
                        _this.tabObj.items[_this.getIndex(idx)].cssClass = _this.items[idx].cssClass;
                        if (activeTab === undefined && idx === _this.selectedTab) {
                            activeTab = true;
                        }
                        stateChanged = true;
                    }
                }
            }
        });
        this.setProperties({ 'items': this.items }, true);
        // eslint-disable-next-line no-self-assign
        this.tabObj.items = this.tabObj.items;
        this.tabObj.dataBind();
        if (hide) {
            isAllHidden = this.isAllHidden();
            if (isAllHidden) {
                activeTab = false;
            }
        }
        if (!hide && isAllHidden) {
            activeTab = activeTab ? false : true;
        }
        if (stateChanged && isAllHidden) {
            if (this.element.classList.contains('e-collapsed')) {
                this.element.classList.remove('e-collapsed');
                this.element.querySelector('.e-drop-icon').classList.remove('e-hide');
            }
            else {
                this.element.classList.add('e-collapsed');
                this.element.querySelector('.e-drop-icon').classList.add('e-hide');
            }
        }
        if (activeTab) {
            for (var i = 0; i < this.items.length; i++) {
                if (!this.items[i].cssClass.includes(' e-hide')) {
                    this.tabObj.selectedItem = this.getIndex(i);
                    this.tabObj.dataBind();
                    break;
                }
            }
        }
    };
    Ribbon.prototype.isAllHidden = function () {
        var allHidden = true;
        for (var i = 0; i < this.items.length; i++) {
            if (!this.items[i].cssClass.includes(' e-hide')) {
                allHidden = false;
                break;
            }
        }
        return allHidden;
    };
    /**
     * To enable / disable the Ribbon tabs.
     *
     * @param {string[]} tabs - Specifies the tab header text which needs to be enabled / disabled.
     * @param {boolean} enable - Set `true` / `false` to enable / disable the ribbon tabs.
     * @returns {void} - To enable / disable the Ribbon tabs.
     */
    Ribbon.prototype.enableTabs = function (tabs, enable) {
        var _this = this;
        if (enable === void 0) { enable = true; }
        tabs.forEach(function (tab) {
            var idx = (_this.getTabIndex(tab, -1));
            if (idx > -1) {
                _this.items[idx].disabled = !enable;
                idx = _this.getIndex(idx);
                _this.tabObj.enableTab(idx, enable);
            }
        });
        this.setProperties({ 'items': this.items }, true);
    };
    /**
     * To add custom tabs.
     *
     * @param {RibbonItemModel[]} items - Specifies the Ribbon tab items to be inserted.
     * @param {string} insertBefore - Specifies the existing Ribbon header text before which the new tabs will be inserted.
     * If not specified, the new tabs will be inserted at the end.
     * @returns {void} - To add custom tabs.
     */
    Ribbon.prototype.addTabs = function (items, insertBefore) {
        var _this = this;
        var idx = this.getTabIndex(insertBefore);
        items.forEach(function (item) {
            item = new RibbonItem(_this.items[0], 'items', item, true);
            _this.items.splice(idx, 0, item);
            _this.tabObj.addTab([{ header: item.header, content: _this.toolbarObj.element }], _this.getIndex(idx));
            idx++;
        });
        this.setProperties({ 'items': this.items }, true);
        this.setProperties({ 'selectedTab': this.getIndex(this.tabObj.selectedItem, true) }, true);
    };
    Ribbon.prototype.getTabIndex = function (headerText, idx) {
        if (idx === void 0) { idx = this.items.length; }
        if (headerText) {
            for (var i = 0; i < this.items.length; i++) {
                if (this.items[i].header.text === headerText) {
                    idx = i;
                    break;
                }
            }
        }
        return idx;
    };
    /**
     * To add the custom items in Ribbon toolbar.
     *
     * @param {string} tab - Specifies the ribbon tab header text under which the specified items will be inserted..
     * @param {ItemModel[]} items - Specifies the ribbon toolbar items that needs to be inserted.
     * @param {number} index - Specifies the index text before which the new items will be inserted.
     * @returns {void} - To add the custom items in Ribbon toolbar.
     * If not specified, the new items will be inserted at the end of the toolbar.
     */
    Ribbon.prototype.addToolbarItems = function (tab, items, index) {
        var _this = this;
        var tabIdx = this.getTabIndex(tab);
        if (isNullOrUndefined(index)) {
            index = this.items[tabIdx].content.length;
        }
        items.forEach(function (item) {
            item = new Item(_this.items[tabIdx].content[0], 'content', item, true);
            _this.items[tabIdx].content.splice(index, 0, item);
            index++;
        });
        this.setProperties({ 'items': this.items }, true);
        if (tabIdx === this.selectedTab && items.length) {
            this.updateToolbar(tabIdx);
        }
    };
    /**
     * Enables or disables the specified Ribbon toolbar items or all ribbon items.
     *
     * @param {string} tab - Specifies the ribbon tab header text under which the toolbar items need to be enabled / disabled.
     * @param {number[]} items - Specifies the toolbar item indexes / unique id's which needs to be enabled / disabled.
     * If it is not specified the entire toolbar items will be enabled / disabled.
     * @param  {boolean} enable - Boolean value that determines whether the toolbar items should be enabled or disabled.
     * @returns {void} - Enables or disables the specified Ribbon toolbar items or all ribbon items.
     */
    Ribbon.prototype.enableItems = function (tab, items, enable) {
        if (enable === undefined) {
            enable = true;
        }
        if (items) {
            var tabIdx = this.getTabIndex(tab, -1);
            if (tabIdx < 0) {
                return;
            }
            for (var i = 0; i < items.length; i++) {
                if (typeof (items[i]) === 'string') {
                    for (var j = 0; j < this.items[tabIdx].content.length; j++) {
                        if (this.items[tabIdx].content[j].id === items[i]) {
                            items[i] = j;
                            break;
                        }
                    }
                }
                if (typeof (items[i]) === 'string') {
                    return;
                }
                this.items[tabIdx].content[items[i]].disabled = !enable;
                if (tabIdx !== this.selectedTab) {
                    this.setProperties({ 'items': this.items }, true);
                }
            }
            if (tabIdx === this.selectedTab) {
                this.updateToolbar(tabIdx);
            }
        }
        else {
            this.toolbarObj.disable(!enable);
        }
    };
    /**
     * To show/hide the existing Ribbon toolbar items.
     *
     * @param {string} tab - Specifies the ribbon tab header text under which the specified items need to be hidden / shown.
     * @param {number[]} indexes - Specifies the toolbar indexes which needs to be shown/hidden from UI.
     * @param {boolean} hide - Set `true` / `false` to hide / show the toolbar items.
     * @returns {void} - To show/hide the existing Ribbon toolbar items.
     */
    Ribbon.prototype.hideToolbarItems = function (tab, indexes, hide) {
        var _this = this;
        if (hide === void 0) { hide = true; }
        var tabIdx;
        for (var i = 0; i < this.items.length; i++) {
            if (this.items[i].header.text === tab) {
                tabIdx = i;
                indexes.forEach(function (idx) {
                    if (_this.items[tabIdx].content[idx]) {
                        if (hide) {
                            if (!_this.items[tabIdx].content[idx].cssClass.includes(' e-hide')) {
                                _this.items[tabIdx].content[idx].cssClass = _this.items[tabIdx].content[idx].cssClass + ' e-hide';
                            }
                        }
                        else {
                            if (_this.items[tabIdx].content[idx].cssClass.includes(' e-hide')) {
                                _this.items[tabIdx].content[idx].cssClass = _this.items[tabIdx].content[idx].cssClass.replace(' e-hide', '');
                            }
                        }
                    }
                });
                break;
            }
        }
        this.setProperties({ 'items': this.items }, true);
        if (tabIdx !== undefined && tabIdx === this.selectedTab) {
            this.updateToolbar(tabIdx);
        }
    };
    /**
     * Get component name.
     *
     * @returns {string} - Get component name.
     * @private
     */
    Ribbon.prototype.getModuleName = function () {
        return 'ribbon';
    };
    /**
     * Get the properties to be maintained in the persisted state.
     *
     * @returns {string} - Get the properties to be maintained in the persisted state.
     * @private
     */
    Ribbon.prototype.getPersistData = function () {
        return this.addOnPersist([]);
    };
    /**
     * Called internally if any of the property value changed.
     *
     * @param {RibbonModel} newProp - Specify the new properties
     * @param {RibbonModel} oldProp - specify the old properties.
     * @returns {void} - if any of the property value changed.
     * @private
     */
    Ribbon.prototype.onPropertyChanged = function (newProp, oldProp) {
        for (var _i = 0, _a = Object.keys(newProp); _i < _a.length; _i++) {
            var prop = _a[_i];
            switch (prop) {
                case 'selectedTab':
                    this.tabObj.selectedItem = this.getIndex(newProp.selectedTab);
                    this.tabObj.dataBind();
                    break;
            }
        }
    };
    __decorate([
        Property('')
    ], Ribbon.prototype, "cssClass", void 0);
    __decorate([
        Property(true)
    ], Ribbon.prototype, "menuType", void 0);
    __decorate([
        Collection([], MenuItem)
    ], Ribbon.prototype, "menuItems", void 0);
    __decorate([
        Property(0)
    ], Ribbon.prototype, "selectedTab", void 0);
    __decorate([
        Collection([], RibbonItem)
    ], Ribbon.prototype, "items", void 0);
    __decorate([
        Event()
    ], Ribbon.prototype, "selecting", void 0);
    __decorate([
        Event()
    ], Ribbon.prototype, "fileMenuItemSelect", void 0);
    __decorate([
        Event()
    ], Ribbon.prototype, "beforeFileMenuItemRender", void 0);
    __decorate([
        Event()
    ], Ribbon.prototype, "beforeOpen", void 0);
    __decorate([
        Event()
    ], Ribbon.prototype, "beforeClose", void 0);
    __decorate([
        Event()
    ], Ribbon.prototype, "selectFormat", void 0);
    __decorate([
        Event()
    ], Ribbon.prototype, "clicked", void 0);
    __decorate([
        Event()
    ], Ribbon.prototype, "created", void 0);
    __decorate([
        Event()
    ], Ribbon.prototype, "expandCollapse", void 0);
    Ribbon = __decorate([
        NotifyPropertyChanges
    ], Ribbon);
    return Ribbon;
}(Component));
export { Ribbon };
