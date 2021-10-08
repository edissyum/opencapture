import { Toolbar as BaseToolbar } from '@syncfusion/ej2-navigations';
import { select, isNullOrUndefined as isNOU, closest, selectAll } from '@syncfusion/ej2-base';
import { createDialog } from '../pop-up/dialog';
import * as events from '../base/constant';
import * as CLS from '../base/classes';
import { refresh, getPathObject, getLocaleText, getCssClass, sortbyClickHandler } from '../common/utility';
import { createDeniedDialog, updateLayout } from '../common/utility';
import { GetDetails } from '../common/operations';
import { DropDownButton } from '@syncfusion/ej2-splitbuttons';
import { cutFiles, copyFiles, pasteHandler, hasEditAccess } from '../common/index';
import { doDownload, createNewFolder, uploadItem } from '../common/index';
/**
 * Toolbar module
 */
var Toolbar = /** @class */ (function () {
    /**
     * Constructor for the Toolbar module
     *
     * @hidden
     * @param {IFileManager} parent - specifies the parent element.
     * @private
     */
    function Toolbar(parent) {
        this.default = ['Delete', 'Rename', 'Download', 'Cut', 'Copy', 'Paste'];
        this.single = ['Delete', 'Rename', 'Download', 'Cut', 'Copy'];
        this.multiple = ['Delete', 'Download', 'Cut', 'Copy', 'Refresh'];
        this.selection = ['NewFolder', 'Upload', 'SortBy', 'Refresh'];
        this.parent = parent;
        this.render();
        this.addEventListener();
    }
    Toolbar.prototype.render = function () {
        var _this = this;
        this.items = this.toolbarItemData(this.getItems(this.parent.toolbarSettings.items.map(function (item) { return item.trim(); })));
        var eventArgs = { items: this.items };
        this.parent.trigger('toolbarCreate', eventArgs, function (toolbarCreateArgs) {
            _this.items = toolbarCreateArgs.items;
            _this.toolbarObj = new BaseToolbar({
                items: _this.items,
                created: _this.toolbarCreateHandler.bind(_this),
                overflowMode: 'Popup',
                clicked: _this.onClicked.bind(_this),
                enableHtmlSanitizer: _this.parent.enableHtmlSanitizer,
                enableRtl: _this.parent.enableRtl
            });
            _this.toolbarObj.isStringTemplate = true;
            _this.toolbarObj.appendTo('#' + _this.parent.element.id + CLS.TOOLBAR_ID);
        });
    };
    Toolbar.prototype.getItemIndex = function (item) {
        var itemId = this.getId(item);
        for (var i = 0; i < this.items.length; i++) {
            if (this.items[i].id === itemId) {
                return i;
            }
        }
        return -1;
    };
    Toolbar.prototype.getItems = function (items) {
        var currItems = items.slice();
        if (this.parent.isDevice && this.parent.allowMultiSelection) {
            currItems.push('SelectAll');
        }
        return currItems;
    };
    /* istanbul ignore next */
    Toolbar.prototype.onClicked = function (args) {
        var _this = this;
        if (isNOU(args.item) || !args.item.id) {
            return;
        }
        var tool = args.item.id.substr((this.parent.element.id + '_tb_').length);
        // eslint-disable-next-line
        var details;
        if (tool === 'refresh' || tool === 'newfolder' || tool === 'upload') {
            details = [getPathObject(this.parent)];
            this.parent.itemData = details;
        }
        else {
            this.parent.notify(events.selectedData, {});
            details = this.parent.itemData;
        }
        var eventArgs = { cancel: false, fileDetails: details, item: args.item };
        this.parent.trigger('toolbarClick', eventArgs, function (toolbarClickArgs) {
            var sItems;
            var target;
            if (!toolbarClickArgs.cancel) {
                switch (tool) {
                    case 'sortby':
                        target = closest(args.originalEvent.target, '.' + CLS.TB_ITEM);
                        if (target && target.classList.contains('e-toolbar-popup')) {
                            args.cancel = true;
                        }
                        break;
                    case 'newfolder':
                        createNewFolder(_this.parent);
                        break;
                    case 'cut':
                        cutFiles(_this.parent);
                        break;
                    case 'copy':
                        copyFiles(_this.parent);
                        break;
                    case 'delete':
                        for (var i = 0; i < details.length; i++) {
                            if (!hasEditAccess(details[i])) {
                                createDeniedDialog(_this.parent, details[i], events.permissionEdit);
                                return;
                            }
                        }
                        createDialog(_this.parent, 'Delete');
                        break;
                    case 'details':
                        _this.parent.notify(events.detailsInit, {});
                        sItems = _this.parent.selectedItems;
                        if (_this.parent.activeModule === 'navigationpane') {
                            sItems = [];
                        }
                        GetDetails(_this.parent, sItems, _this.parent.path, 'details');
                        break;
                    case 'paste':
                        _this.parent.folderPath = '';
                        pasteHandler(_this.parent);
                        break;
                    case 'refresh':
                        refresh(_this.parent);
                        break;
                    case 'download':
                        doDownload(_this.parent);
                        break;
                    case 'rename':
                        if (!hasEditAccess(details[0])) {
                            createDeniedDialog(_this.parent, details[0], events.permissionEdit);
                        }
                        else {
                            _this.parent.notify(events.renameInit, {});
                            createDialog(_this.parent, 'Rename');
                        }
                        break;
                    case 'upload':
                        uploadItem(_this.parent);
                        break;
                    case 'selectall':
                        _this.parent.notify(events.selectAllInit, {});
                        break;
                    case 'selection':
                        _this.parent.notify(events.clearAllInit, {});
                        break;
                }
            }
        });
    };
    Toolbar.prototype.toolbarCreateHandler = function () {
        if (!isNOU(select('#' + this.getId('SortBy'), this.parent.element))) {
            var items = [
                { id: this.getPupupId('name'), text: getLocaleText(this.parent, 'Name'), iconCss: CLS.TB_OPTION_DOT },
                { id: this.getPupupId('size'), text: getLocaleText(this.parent, 'Size') },
                { id: this.getPupupId('date'), text: getLocaleText(this.parent, 'DateModified') },
                { separator: true },
                { id: this.getPupupId('ascending'), text: getLocaleText(this.parent, 'Ascending'),
                    iconCss: this.parent.sortOrder === 'Ascending' ? CLS.TB_OPTION_TICK : '' },
                { id: this.getPupupId('descending'), text: getLocaleText(this.parent, 'Descending'),
                    iconCss: this.parent.sortOrder === 'Descending' ? CLS.TB_OPTION_TICK : '' },
                { id: this.getPupupId('none'), text: getLocaleText(this.parent, 'None'),
                    iconCss: this.parent.sortOrder === 'None' ? CLS.TB_OPTION_TICK : '' }
            ];
            this.buttonObj = new DropDownButton({
                items: items, cssClass: getCssClass(this.parent, CLS.ROOT_POPUP),
                select: sortbyClickHandler.bind(this, this.parent),
                enableHtmlSanitizer: this.parent.enableHtmlSanitizer,
                enableRtl: this.parent.enableRtl, iconCss: CLS.ICON_SHORTBY
            });
            this.buttonObj.isStringTemplate = true;
            this.buttonObj.appendTo('#' + this.getId('SortBy'));
        }
        if (!isNOU(select('#' + this.getId('View'), this.parent.element))) {
            var gridSpan = '<span class="' + CLS.ICON_GRID + ' ' + CLS.MENU_ICON + '"></span>';
            var largeIconSpan = '<span class="' + CLS.ICON_LARGE + ' ' + CLS.MENU_ICON + '"></span>';
            var layoutItems = [
                {
                    id: this.getPupupId('large'), text: largeIconSpan + getLocaleText(this.parent, 'View-LargeIcons'),
                    iconCss: this.parent.view === 'Details' ? '' : CLS.TB_OPTION_TICK
                },
                {
                    id: this.getPupupId('details'), text: gridSpan + getLocaleText(this.parent, 'View-Details'),
                    iconCss: this.parent.view === 'Details' ? CLS.TB_OPTION_TICK : ''
                }
            ];
            this.layoutBtnObj = new DropDownButton({
                iconCss: this.parent.view === 'Details' ? CLS.ICON_GRID : CLS.ICON_LARGE,
                cssClass: getCssClass(this.parent, 'e-caret-hide ' + CLS.ROOT_POPUP),
                items: layoutItems, select: this.layoutChange.bind(this),
                enableRtl: this.parent.enableRtl,
                enableHtmlSanitizer: this.parent.enableHtmlSanitizer,
                content: '<span class="e-tbar-btn-text">' + getLocaleText(this.parent, 'View') + '</span>'
            });
            this.layoutBtnObj.isStringTemplate = true;
            this.layoutBtnObj.appendTo('#' + this.getId('View'));
        }
        this.hideItems(this.default, true);
        this.hideStatus();
        var btnElement = selectAll('.e-btn', this.toolbarObj.element);
        var _loop_1 = function (btnCount) {
            /* istanbul ignore next */
            btnElement[btnCount].onkeydown = function (e) {
                if (e.keyCode === 13 && !e.target.classList.contains('e-fe-popup')) {
                    e.preventDefault();
                }
            };
            btnElement[btnCount].onkeyup = function (e) {
                if (e.keyCode === 13 && !e.target.classList.contains('e-fe-popup')) {
                    btnElement[btnCount].click();
                }
            };
        };
        for (var btnCount = 0; btnCount < btnElement.length; btnCount++) {
            _loop_1(btnCount);
        }
        this.parent.refreshLayout();
    };
    Toolbar.prototype.updateSortByButton = function () {
        if (this.buttonObj) {
            var items = this.buttonObj.items;
            for (var itemCount = 0; itemCount < items.length; itemCount++) {
                if (items[itemCount].id === this.getPupupId('name')) {
                    items[itemCount].iconCss = this.parent.sortBy === 'name' ? CLS.TB_OPTION_DOT : '';
                }
                else if (items[itemCount].id === this.getPupupId('size')) {
                    items[itemCount].iconCss = this.parent.sortBy === 'size' ? CLS.TB_OPTION_DOT : '';
                }
                else if (items[itemCount].id === this.getPupupId('date')) {
                    items[itemCount].iconCss = this.parent.sortBy === '_fm_modified' ? CLS.TB_OPTION_DOT : '';
                }
                else if (items[itemCount].id === this.getPupupId('ascending')) {
                    items[itemCount].iconCss = this.parent.sortOrder === 'Ascending' ? CLS.TB_OPTION_TICK : '';
                }
                else if (items[itemCount].id === this.getPupupId('descending')) {
                    items[itemCount].iconCss = this.parent.sortOrder === 'Descending' ? CLS.TB_OPTION_TICK : '';
                }
                else if (items[itemCount].id === this.getPupupId('none')) {
                    items[itemCount].iconCss = this.parent.sortOrder === 'None' ? CLS.TB_OPTION_TICK : '';
                }
            }
        }
    };
    Toolbar.prototype.getPupupId = function (id) {
        return this.parent.element.id + '_ddl_' + id.toLowerCase();
    };
    Toolbar.prototype.layoutChange = function (args) {
        if (this.parent.view === 'Details') {
            if (args.item.id === this.getPupupId('large')) {
                updateLayout(this.parent, 'LargeIcons');
            }
        }
        else {
            if (args.item.id === this.getPupupId('details')) {
                updateLayout(this.parent, 'Details');
            }
        }
    };
    Toolbar.prototype.toolbarItemData = function (data) {
        var items = [];
        var mode = 'Both';
        if (this.parent.isMobile) {
            mode = 'Overflow';
        }
        for (var i = 0; i < data.length; i++) {
            var item = void 0;
            var itemId = this.getId(data[i]);
            var itemText = getLocaleText(this.parent, data[i]);
            var itemTooltip = getLocaleText(this.parent, 'Tooltip-' + data[i]);
            var spanElement = '<span class="e-tbar-btn-text e-tbar-ddb-text">' + itemText + '</span>';
            switch (data[i]) {
                case '|':
                    item = { type: 'Separator' };
                    break;
                case 'Upload':
                    item = { id: itemId, text: itemText, tooltipText: itemTooltip, prefixIcon: CLS.ICON_UPLOAD, showTextOn: mode };
                    break;
                case 'SortBy':
                    item = {
                        id: itemId, tooltipText: itemTooltip,
                        template: '<button id="' + itemId + '" class="e-tbar-btn e-tbtn-txt" tabindex="-1">' + spanElement + '</button>'
                    };
                    break;
                case 'Refresh':
                    item = { id: itemId, text: itemText, tooltipText: itemTooltip, prefixIcon: CLS.ICON_REFRESH, showTextOn: mode };
                    break;
                case 'Selection':
                    item = {
                        id: itemId, text: itemText, tooltipText: itemTooltip, suffixIcon: CLS.ICON_CLEAR, overflow: 'Show',
                        align: 'Right'
                    };
                    break;
                case 'View':
                    item = {
                        id: itemId, tooltipText: itemTooltip, prefixIcon: this.parent.view === 'Details' ? CLS.ICON_GRID : CLS.ICON_LARGE,
                        overflow: 'Show', align: 'Right', text: itemText, showTextOn: 'Overflow',
                        template: '<button id="' + itemId + '" class="e-tbar-btn e-tbtn-txt" tabindex="-1" aria-label=' +
                            getLocaleText(this.parent, 'View') + '></button>'
                    };
                    break;
                case 'Details':
                    item = {
                        id: itemId, tooltipText: itemTooltip, prefixIcon: CLS.ICON_DETAILS, overflow: 'Show', align: 'Right',
                        text: itemText, showTextOn: 'Overflow'
                    };
                    break;
                case 'NewFolder':
                    item = { id: itemId, text: itemText, tooltipText: itemTooltip, prefixIcon: CLS.ICON_NEWFOLDER, showTextOn: mode };
                    break;
                case 'Cut':
                    item = { id: itemId, text: itemText, tooltipText: itemTooltip, prefixIcon: CLS.ICON_CUT, showTextOn: mode };
                    break;
                case 'Copy':
                    item = { id: itemId, text: itemText, tooltipText: itemTooltip, prefixIcon: CLS.ICON_COPY, showTextOn: mode };
                    break;
                case 'Paste':
                    item = { id: itemId, text: itemText, tooltipText: itemTooltip, prefixIcon: CLS.ICON_PASTE, showTextOn: mode };
                    break;
                case 'Delete':
                    item = { id: itemId, text: itemText, tooltipText: itemTooltip, prefixIcon: CLS.ICON_DELETE, showTextOn: mode };
                    break;
                case 'Rename':
                    item = { id: itemId, text: itemText, tooltipText: itemTooltip, prefixIcon: CLS.ICON_RENAME, showTextOn: mode };
                    break;
                case 'Download':
                    item = { id: itemId, text: itemText, tooltipText: itemTooltip, prefixIcon: CLS.ICON_DOWNLOAD, showTextOn: mode };
                    break;
                case 'SelectAll':
                    item = { id: itemId, text: itemText, tooltipText: itemTooltip, prefixIcon: CLS.ICON_SELECTALL, showTextOn: mode };
                    break;
                default:
                    item = { id: itemId, text: itemText, tooltipText: itemTooltip };
                    break;
            }
            items.push(item);
        }
        return items;
    };
    Toolbar.prototype.getId = function (id) {
        return this.parent.element.id + '_tb_' + id.toLowerCase();
    };
    Toolbar.prototype.addEventListener = function () {
        this.parent.on(events.modelChanged, this.onPropertyChanged, this);
        this.parent.on(events.selectionChanged, this.onSelectionChanged, this);
        this.parent.on(events.layoutChange, this.onLayoutChange, this);
        this.parent.on(events.showPaste, this.showPaste, this);
        this.parent.on(events.hidePaste, this.hidePaste, this);
        this.parent.on(events.destroy, this.destroy, this);
        this.parent.on(events.sortByChange, this.updateSortByButton, this);
    };
    Toolbar.prototype.reRenderToolbar = function (e) {
        var _this = this;
        if (e.newProp.toolbarSettings.items !== undefined) {
            this.items = this.toolbarItemData(this.getItems(e.newProp.toolbarSettings.items.map(function (item) { return item.trim(); })));
            var eventArgs = { items: this.items };
            this.parent.trigger('toolbarCreate', eventArgs, function (toolbarCreateArgs) {
                if (_this.buttonObj) {
                    _this.buttonObj.destroy();
                }
                if (_this.layoutBtnObj) {
                    _this.layoutBtnObj.destroy();
                }
                _this.items = toolbarCreateArgs.items;
                _this.toolbarObj.items = _this.items;
                _this.toolbarObj.dataBind();
                _this.toolbarCreateHandler();
            });
        }
    };
    Toolbar.prototype.onSelectionChanged = function () {
        this.hideStatus();
        this.hideItems(this.single, true);
        this.hideItems(this.selection, false);
        if (this.parent.selectedItems.length === 1) {
            this.hideItems(this.single, false);
            this.hideItems(this.selection, true);
        }
        else if (this.parent.selectedItems.length > 1) {
            this.hideItems(this.multiple, false);
            this.hideItems(this.selection, true);
        }
        var ele = select('#' + this.getId('Selection'), this.toolbarObj.element);
        if (this.parent.selectedItems.length > 0 && ele) {
            var txt = void 0;
            if (this.parent.selectedItems.length === 1) {
                txt = this.parent.selectedItems.length + ' ' + getLocaleText(this.parent, 'Item-Selection');
            }
            else {
                txt = this.parent.selectedItems.length + ' ' + getLocaleText(this.parent, 'Items-Selection');
            }
            select('.e-tbar-btn-text', ele).textContent = txt;
            this.toolbarObj.hideItem(ele.parentElement, false);
        }
    };
    Toolbar.prototype.hideItems = function (tools, toHide) {
        for (var i = 0; i < tools.length; i++) {
            var ele = select('#' + this.getId(tools[i]), this.parent.element);
            if (ele) {
                this.toolbarObj.hideItem(ele.parentElement, toHide);
            }
        }
    };
    Toolbar.prototype.hideStatus = function () {
        var ele = select('#' + this.getId('Selection'), this.toolbarObj.element);
        if (ele) {
            this.toolbarObj.hideItem(ele.parentElement, true);
        }
    };
    Toolbar.prototype.showPaste = function () {
        this.hideItems(['Paste'], false);
    };
    Toolbar.prototype.hidePaste = function () {
        this.hideItems(['Paste'], true);
    };
    Toolbar.prototype.onLayoutChange = function () {
        if (this.layoutBtnObj) {
            this.layoutBtnObj.iconCss = this.parent.view === 'Details' ? CLS.ICON_GRID : CLS.ICON_LARGE;
            var items = this.layoutBtnObj.items;
            for (var itemCount = 0; itemCount < items.length; itemCount++) {
                if (items[itemCount].id === this.getPupupId('large')) {
                    items[itemCount].iconCss = this.parent.view === 'LargeIcons' ? CLS.TB_OPTION_TICK : '';
                }
                else if (items[itemCount].id === this.getPupupId('details')) {
                    items[itemCount].iconCss = this.parent.view === 'Details' ? CLS.TB_OPTION_TICK : '';
                }
            }
        }
    };
    Toolbar.prototype.removeEventListener = function () {
        this.parent.off(events.modelChanged, this.onPropertyChanged);
        this.parent.off(events.selectionChanged, this.onSelectionChanged);
        this.parent.off(events.layoutChange, this.onLayoutChange);
        this.parent.off(events.showPaste, this.showPaste);
        this.parent.off(events.hidePaste, this.hidePaste);
        this.parent.off(events.destroy, this.destroy);
        this.parent.off(events.sortByChange, this.updateSortByButton);
    };
    /**
     * For internal use only - Get the module name.
     *
     * @returns {string} - returns module name.
     * @private
     */
    Toolbar.prototype.getModuleName = function () {
        return 'toolbar';
    };
    Toolbar.prototype.onPropertyChanged = function (e) {
        if (e.module !== this.getModuleName() && e.module !== 'common') {
            /* istanbul ignore next */
            return;
        }
        for (var _i = 0, _a = Object.keys(e.newProp); _i < _a.length; _i++) {
            var prop = _a[_i];
            switch (prop) {
                case 'cssClass':
                    if (this.buttonObj) {
                        this.buttonObj.cssClass = getCssClass(this.parent, CLS.ROOT_POPUP);
                    }
                    if (this.layoutBtnObj) {
                        this.layoutBtnObj.cssClass = getCssClass(this.parent, 'e-caret-hide ' + CLS.ROOT_POPUP);
                    }
                    break;
                case 'height':
                case 'width':
                    this.toolbarObj.refreshOverflow();
                    break;
                case 'toolbarSettings':
                    this.reRenderToolbar(e);
                    break;
            }
        }
    };
    Toolbar.prototype.destroy = function () {
        if (this.parent.isDestroyed) {
            return;
        }
        this.removeEventListener();
        if (this.buttonObj) {
            this.buttonObj.destroy();
        }
        if (this.layoutBtnObj) {
            this.layoutBtnObj.destroy();
        }
        this.toolbarObj.destroy();
        this.parent.refreshLayout();
    };
    Toolbar.prototype.enableItems = function (items, isEnable) {
        for (var i = 0; i < items.length; i++) {
            var ele = select('#' + this.getId(items[i]), this.parent.element);
            if (ele) {
                this.toolbarObj.enableItems(ele.parentElement, isEnable);
            }
        }
    };
    return Toolbar;
}());
export { Toolbar };
