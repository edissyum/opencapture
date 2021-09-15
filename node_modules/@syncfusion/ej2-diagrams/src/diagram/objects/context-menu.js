var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
/* eslint-disable @typescript-eslint/no-explicit-any */
import { isBlazor } from '@syncfusion/ej2-base';
import { remove } from '@syncfusion/ej2-base';
import { ContextMenu as Menu } from '@syncfusion/ej2-navigations';
import { contextMenuClick, contextMenuOpen, contextMenuBeforeItemRender } from '../enum/enum';
import { createHtmlElement } from '../../diagram/utility/dom-util';
/**
 * @private
 */
export var menuClass = {
    content: '.e-diagramcontent',
    copy: 'e-copy',
    paste: 'e-paste',
    undo: 'e-undo',
    redo: 'e-redo',
    cut: 'e-cut',
    selectAll: 'e-selectall',
    grouping: 'e-grouping',
    group: 'e-group',
    unGroup: 'e-ungroup',
    bringToFront: 'e-bringfront',
    sendToBack: 'e-sendback',
    moveForward: 'e-bringforward',
    sendBackward: 'e-sendbackward',
    order: 'e-order'
};
/**
 * 'ContextMenu module used to handle context menu actions.'
 *
 * @private
 */
var DiagramContextMenu = /** @class */ (function () {
    function DiagramContextMenu(parent, service) {
        this.defaultItems = {};
        /**
         * @private
         */
        this.disableItems = [];
        /**
         * @private
         */
        this.hiddenItems = [];
        this.localeText = this.setLocaleKey();
        this.parent = parent;
        this.serviceLocator = service;
        this.addEventListener();
    }
    /**
     * addEventListener method \
     *
     * @returns { void } addEventListener method .\
     *
     * @private
     */
    DiagramContextMenu.prototype.addEventListener = function () {
        if (this.parent.isDestroyed) {
            return;
        }
        this.parent.on('initial-load', this.render, this);
    };
    /**
     * removeEventListener method \
     *
     * @returns { void } removeEventListener method .\
     *
     * @private
     */
    DiagramContextMenu.prototype.removeEventListener = function () {
        if (this.parent.isDestroyed) {
            return;
        }
        this.parent.off('initial-load', this.render);
    };
    DiagramContextMenu.prototype.render = function () {
        this.l10n = this.serviceLocator.getService('localization');
        if (!isBlazor()) {
            this.element = createHtmlElement('ul', { id: this.parent.element.id + '_contextMenu' });
            this.parent.element.appendChild(this.element);
            var target = '#' + this.parent.element.id;
            this.contextMenu = new Menu({
                items: this.getMenuItems(),
                enableRtl: this.parent.enableRtl,
                enablePersistence: this.parent.enablePersistence,
                locale: this.parent.locale,
                target: target,
                select: this.contextMenuItemClick.bind(this),
                beforeOpen: this.contextMenuBeforeOpen.bind(this),
                onOpen: this.contextMenuOpen.bind(this),
                beforeItemRender: this.BeforeItemRender.bind(this),
                onClose: this.contextMenuOnClose.bind(this),
                cssClass: 'e-diagram-menu',
                animationSettings: { effect: 'None' }
            });
            this.contextMenu.appendTo(this.element);
        }
    };
    DiagramContextMenu.prototype.getMenuItems = function () {
        var menuItems = [];
        var orderItems = [];
        var groupItems = [];
        if (!this.parent.contextMenuSettings.showCustomMenuOnly) {
            for (var _i = 0, _a = this.getDefaultItems(); _i < _a.length; _i++) {
                var item = _a[_i];
                if (item.toLocaleLowerCase().indexOf('group') !== -1) {
                    if (item.toLocaleLowerCase() !== 'grouping') {
                        groupItems.push(this.buildDefaultItems(item));
                    }
                }
                else if (item.toLocaleLowerCase().indexOf('order') !== -1) {
                    if (item.toLocaleLowerCase() !== 'order') {
                        orderItems.push(this.buildDefaultItems(item));
                    }
                }
                else {
                    menuItems.push(this.buildDefaultItems(item));
                }
            }
            if (groupItems.length > 0) {
                var orderGroup = this.buildDefaultItems('grouping');
                orderGroup.items = groupItems;
                menuItems.push(orderGroup);
            }
            if (orderItems.length > 0) {
                var orderGroup = this.buildDefaultItems('order');
                orderGroup.items = orderItems;
                menuItems.push(orderGroup);
            }
        }
        if (this.parent.contextMenuSettings.items) {
            for (var _b = 0, _c = this.parent.contextMenuSettings.items; _b < _c.length; _b++) {
                var customItem = _c[_b];
                menuItems.push(customItem);
            }
        }
        return menuItems;
    };
    DiagramContextMenu.prototype.contextMenuOpen = function () {
        this.isOpen = true;
    };
    DiagramContextMenu.prototype.BeforeItemRender = function (args) {
        this.parent.trigger(contextMenuBeforeItemRender, args);
    };
    DiagramContextMenu.prototype.contextMenuItemClick = function (args) {
        document.getElementById(this.parent.element.id + 'content').focus();
        this.parent.trigger(contextMenuClick, args);
        var item = this.getKeyFromId(args.item.id);
        if (!args.cancel) {
            switch (item) {
                case 'cut':
                    this.parent.cut();
                    break;
                case 'copy':
                    this.parent.copy();
                    break;
                case 'undo':
                    this.parent.undo();
                    break;
                case 'redo':
                    this.parent.redo();
                    break;
                case 'paste':
                    this.parent.paste();
                    break;
                case 'selectAll':
                    this.parent.selectAll();
                    break;
                case 'group':
                    this.parent.group();
                    break;
                case 'unGroup':
                    this.parent.unGroup();
                    break;
                case 'bringToFrontOrder':
                    this.parent.bringToFront();
                    break;
                case 'moveForwardOrder':
                    this.parent.moveForward();
                    break;
                case 'sendToBackOrder':
                    this.parent.sendToBack();
                    break;
                case 'sendBackwardOrder':
                    this.parent.sendBackward();
                    break;
            }
        }
    };
    DiagramContextMenu.prototype.contextMenuOnClose = function (args) {
        var parent = 'parentObj';
        if (args.items.length > 0 && args.items[0][parent] instanceof Menu) {
            this.updateItemStatus();
        }
    };
    DiagramContextMenu.prototype.getLocaleText = function (item) {
        return this.l10n.getConstant(this.localeText[item]);
    };
    DiagramContextMenu.prototype.updateItemStatus = function () {
        this.contextMenu.showItems(this.hiddenItems, true);
        this.contextMenu.enableItems(this.disableItems, false, true);
        this.hiddenItems = [];
        this.disableItems = [];
        this.isOpen = false;
    };
    /**
     * ensureItems method \
     *
     * @returns { void } ensureItems method .\
     * @param {MenuItemModel} item - provide the item value.
     * @param {Event} event - provide the event value.
     *
     * @private
     */
    DiagramContextMenu.prototype.ensureItems = function (item, event) {
        var key = this.getKeyFromId(item.id);
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        var dItem = this.defaultItems[key];
        if (this.getDefaultItems().indexOf(key) !== -1) {
            if (item.target && (event || this.parent.checkMenu) &&
                !this.ensureTarget(item)) {
                this.hiddenItems.push(item.id);
            }
        }
    };
    /**
     * refreshItems method \
     *
     * @returns { void } refreshItems method .\
     *
     * @private
     */
    DiagramContextMenu.prototype.refreshItems = function () {
        this.updateItems();
        this.contextMenu.refresh();
    };
    DiagramContextMenu.prototype.updateItems = function () {
        var canInsert = true;
        for (var i = 0; i < this.parent.contextMenuSettings.items.length; i++) {
            var items = this.parent.contextMenuSettings.items[i];
            for (var j = 0; j < this.contextMenu.items.length; j++) {
                if (this.contextMenu.items[j].text === this.parent.contextMenuSettings.items[i].text) {
                    canInsert = false;
                }
            }
            if (canInsert) {
                this.contextMenu.insertAfter([items], this.contextMenu.items[this.contextMenu.items.length - 1].text);
            }
        }
    };
    DiagramContextMenu.prototype.contextMenuBeforeOpen = function (args) {
        return __awaiter(this, void 0, void 0, function () {
            var diagramArgs, _i, _a, item, _b, _c, newItem, hidden, contextItems, i, item, i, item;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        if (!this.parent.checkMenu &&
                            (window.navigator.userAgent.indexOf('Linux') !== -1 || window.navigator.userAgent.indexOf('X11') !== -1)) {
                            this.parent.checkMenu = args.cancel = true;
                        }
                        if (this.parent.checkMenu) {
                            this.hiddenItems = [];
                        }
                        diagramArgs = args;
                        diagramArgs.hiddenItems = [];
                        for (_i = 0, _a = args.items; _i < _a.length; _i++) {
                            item = _a[_i];
                            this.ensureItems(item, args.event);
                            if (item.items.length) {
                                for (_b = 0, _c = item.items; _b < _c.length; _b++) {
                                    newItem = _c[_b];
                                    this.ensureItems(newItem, args.event);
                                }
                            }
                        }
                        this.eventArgs = args.event;
                        if (!isBlazor()) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.parent.trigger(contextMenuOpen, diagramArgs)];
                    case 1:
                        diagramArgs =
                            (_d.sent()) || diagramArgs;
                        if (typeof diagramArgs === 'string') {
                            diagramArgs = JSON.parse(diagramArgs);
                        }
                        return [3 /*break*/, 3];
                    case 2:
                        this.parent.trigger(contextMenuOpen, diagramArgs);
                        _d.label = 3;
                    case 3:
                        hidden = true;
                        this.hiddenItems = this.hiddenItems.concat(diagramArgs.hiddenItems);
                        this.contextMenu.enableItems(this.disableItems, false, true);
                        contextItems = this;
                        for (i = 0; i < args.items.length; i++) {
                            item = args.items[i];
                            if (contextItems.hiddenItems.indexOf(item.id) > -1) {
                                contextItems.contextMenu.hideItems([item.id], true);
                            }
                        }
                        for (i = 0; i < contextItems.contextMenu.items.length; i++) {
                            item = contextItems.contextMenu.items[i];
                            if (contextItems.hiddenItems.indexOf(item.id) === -1) {
                                hidden = false;
                                contextItems.contextMenu.showItems([item.id], true);
                            }
                        }
                        if (hidden) {
                            diagramArgs.cancel = hidden;
                            this.hiddenItems = [];
                        }
                        /* tslint:disable */
                        if (this.parent.selectedItems.nodes.length && this.parent.selectedItems.nodes[0].isPhase) {
                            args.cancel = true;
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    DiagramContextMenu.prototype.ensureTarget = function (item) {
        var selectedLength = this.parent.selectedItems.nodes.length +
            this.parent.selectedItems.connectors.length;
        var itemText = this.getKeyFromId(item.id);
        var target = false;
        switch (itemText) {
            case 'undo':
                target = this.parent.historyManager && this.parent.historyManager.canUndo ? true : false;
                break;
            case 'redo':
                target = this.parent.historyManager && this.parent.historyManager.canRedo ? true : false;
                break;
            case 'paste':
                target = this.parent.commandHandler.clipboardData.clipObject ? true : false;
                break;
            case 'selectAll':
                target = this.parent.nodes.length + this.parent.connectors.length ? true : false;
                break;
            case 'grouping':
                target = ((selectedLength > 1) || (this.parent.selectedItems.nodes[0] && this.parent.selectedItems.nodes[0].children
                    && this.parent.selectedItems.nodes[0].children.length > 1)) ? true : false;
                break;
            case 'group':
                target = selectedLength > 1;
                break;
            case 'unGroup':
                target = ((this.parent.selectedItems.nodes[0] && this.parent.selectedItems.nodes[0].children
                    && this.parent.selectedItems.nodes[0].children.length > 1)) ? true : false;
                break;
            case 'cut':
            case 'copy':
            case 'order':
            case 'bringToFrontOrder':
            case 'moveForwardOrder':
            case 'sendToBackOrder':
            case 'sendBackwardOrder':
                target = selectedLength ? true : false;
                break;
        }
        return target;
    };
    /**
     *To destroy the context menu
     *
     * @returns {void} To destroy the context menu
     */
    DiagramContextMenu.prototype.destroy = function () {
        if (!isBlazor()) {
            this.contextMenu.destroy();
            remove(this.element);
        }
        this.removeEventListener();
    };
    DiagramContextMenu.prototype.getModuleName = function () {
        return 'contextMenu';
    };
    DiagramContextMenu.prototype.generateID = function (item) {
        return this.parent.element.id + '_contextMenu_' + item;
    };
    DiagramContextMenu.prototype.getKeyFromId = function (id) {
        return id.replace(this.parent.element.id + '_contextMenu_', '');
    };
    DiagramContextMenu.prototype.buildDefaultItems = function (item) {
        var menuItem;
        switch (item) {
            case 'copy':
                menuItem = { target: menuClass.content, iconCss: menuClass.copy };
                break;
            case 'cut':
                menuItem = { target: menuClass.content, iconCss: menuClass.cut };
                break;
            case 'paste':
                menuItem = { target: menuClass.content, iconCss: menuClass.paste };
                break;
            case 'undo':
                menuItem = { target: menuClass.content, iconCss: menuClass.undo };
                break;
            case 'redo':
                menuItem = { target: menuClass.content, iconCss: menuClass.redo };
                break;
            case 'grouping':
                menuItem = { target: menuClass.content };
                break;
            case 'group':
                menuItem = { target: menuClass.content, iconCss: menuClass.group };
                break;
            case 'unGroup':
                menuItem = { target: menuClass.content, iconCss: menuClass.unGroup };
                break;
            case 'order':
                menuItem = { target: menuClass.content, iconCss: menuClass.order };
                break;
            case 'bringToFrontOrder':
                menuItem = { target: menuClass.content, iconCss: menuClass.bringToFront };
                break;
            case 'moveForwardOrder':
                menuItem = { target: menuClass.content, iconCss: menuClass.moveForward };
                break;
            case 'sendToBackOrder':
                menuItem = { target: menuClass.content, iconCss: menuClass.sendToBack };
                break;
            case 'sendBackwardOrder':
                menuItem = { target: menuClass.content, iconCss: menuClass.sendBackward };
                break;
            case 'selectAll':
                menuItem = { target: menuClass.content };
                break;
        }
        this.defaultItems[item] = {
            text: this.getLocaleText(item), id: this.generateID(item),
            target: menuItem.target, iconCss: menuItem.iconCss ? 'e-icons ' + menuItem.iconCss : ''
        };
        return this.defaultItems[item];
    };
    DiagramContextMenu.prototype.getDefaultItems = function () {
        return [
            'copy',
            'cut', 'paste', 'undo', 'redo', 'selectAll', 'grouping', 'group', 'unGroup', 'order',
            'bringToFrontOrder', 'moveForwardOrder', 'sendToBackOrder', 'sendBackwardOrder'
        ];
    };
    DiagramContextMenu.prototype.setLocaleKey = function () {
        return {
            'copy': 'Copy',
            'cut': 'Cut',
            'paste': 'Paste',
            'undo': 'Undo',
            'redo': 'Redo',
            'selectAll': 'SelectAll',
            'grouping': 'Grouping',
            'group': 'Group',
            'unGroup': 'UnGroup',
            'order': 'Order',
            'bringToFrontOrder': 'BringToFront',
            'moveForwardOrder': 'MoveForward',
            'sendToBackOrder': 'SendToBack',
            'sendBackwardOrder': 'SendBackward'
        };
    };
    return DiagramContextMenu;
}());
export { DiagramContextMenu };
