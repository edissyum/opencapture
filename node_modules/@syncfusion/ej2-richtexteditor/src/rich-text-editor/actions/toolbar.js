import { addClass, Browser, EventHandler, detach, removeClass, select, selectAll, KeyboardEvents } from '@syncfusion/ej2-base';
import { isNullOrUndefined as isNOU, closest, isNullOrUndefined } from '@syncfusion/ej2-base';
import { setStyleAttribute, extend } from '@syncfusion/ej2-base';
import * as events from '../base/constant';
import * as classes from '../base/classes';
import { RenderType, ToolbarType } from '../base/enum';
import { setToolbarStatus, updateUndoRedoStatus, getTBarItemsIndex, getCollection, toObjectLowerCase, isIDevice } from '../base/util';
import { updateDropDownFontFormatLocale } from '../base/util';
import * as model from '../models/items';
import { ToolbarRenderer } from '../renderer/toolbar-renderer';
import { BaseToolbar } from './base-toolbar';
import { DropDownButtons } from './dropdown-buttons';
import { ToolbarAction } from './toolbar-action';
/**
 * `Toolbar` module is used to handle Toolbar actions.
 */
var Toolbar = /** @class */ (function () {
    function Toolbar(parent, serviceLocator) {
        this.parent = parent;
        this.isToolbar = false;
        this.locator = serviceLocator;
        this.isTransformChild = false;
        this.renderFactory = this.locator.getService('rendererFactory');
        model.updateDropDownLocale(this.parent);
        updateDropDownFontFormatLocale(this.parent);
        this.renderFactory.addRenderer(RenderType.Toolbar, new ToolbarRenderer(this.parent));
        this.toolbarRenderer = this.renderFactory.getRenderer(RenderType.Toolbar);
        this.baseToolbar = new BaseToolbar(this.parent, this.locator);
        this.addEventListener();
        if (this.parent.toolbarSettings && Object.keys(this.parent.toolbarSettings.itemConfigs).length > 0) {
            extend(this.tools, model.tools, toObjectLowerCase(this.parent.toolbarSettings.itemConfigs), true);
        }
        else {
            this.tools = model.tools;
        }
    }
    Toolbar.prototype.initializeInstance = function () {
        this.contentRenderer = this.renderFactory.getRenderer(RenderType.Content);
        this.editableElement = this.contentRenderer.getEditPanel();
        this.editPanel = this.contentRenderer.getPanel();
    };
    Toolbar.prototype.toolbarBindEvent = function () {
        if (!this.parent.inlineMode.enable) {
            this.keyBoardModule = new KeyboardEvents(this.getToolbarElement(), {
                keyAction: this.toolBarKeyDown.bind(this), keyConfigs: this.parent.formatter.keyConfig, eventName: 'keydown'
            });
        }
    };
    Toolbar.prototype.toolBarKeyDown = function (e) {
        switch (e.action) {
            case 'escape':
                this.parent.contentModule.getEditPanel().focus();
                break;
        }
    };
    Toolbar.prototype.createToolbarElement = function () {
        this.tbElement = this.parent.createElement('div', { id: this.parent.getID() + '_toolbar' });
        if (!Browser.isDevice && this.parent.inlineMode.enable && isIDevice()) {
            return;
        }
        else {
            if (this.parent.toolbarSettings.enableFloating && !this.parent.inlineMode.enable) {
                this.tbWrapper = this.parent.createElement('div', {
                    id: this.parent.getID() + '_toolbar_wrapper',
                    innerHTML: this.tbElement.outerHTML,
                    className: classes.CLS_TB_WRAP
                });
                this.tbElement = this.tbWrapper.firstElementChild;
                this.parent.element.insertBefore(this.tbWrapper, this.editPanel);
            }
            else {
                this.parent.element.insertBefore(this.tbElement, this.editPanel);
            }
        }
    };
    Toolbar.prototype.getToolbarMode = function () {
        var tbMode;
        switch (this.parent.toolbarSettings.type) {
            case ToolbarType.Expand:
                tbMode = 'Extended';
                break;
            case ToolbarType.Scrollable:
                tbMode = 'Scrollable';
                break;
            default:
                tbMode = 'MultiRow';
        }
        if (isIDevice() && this.parent.toolbarSettings.type === ToolbarType.Expand) {
            tbMode = ToolbarType.Scrollable;
        }
        return tbMode;
    };
    Toolbar.prototype.checkToolbarResponsive = function (ele) {
        if (!Browser.isDevice || isIDevice()) {
            return false;
        }
        var tBarMode;
        if (this.parent.toolbarSettings.type === ToolbarType.Expand) {
            tBarMode = ToolbarType.MultiRow;
        }
        else {
            tBarMode = this.parent.toolbarSettings.type;
        }
        this.baseToolbar.render({
            container: ((this.parent.inlineMode.enable) ? 'quick' : 'toolbar'),
            items: this.parent.toolbarSettings.items,
            mode: tBarMode,
            target: ele
        });
        if (this.parent.toolbarSettings.type === ToolbarType.Expand) {
            addClass([ele], ['e-rte-tb-mobile']);
            if (this.parent.inlineMode.enable) {
                this.addFixedTBarClass();
            }
            else {
                addClass([ele], [classes.CLS_TB_STATIC]);
            }
        }
        this.wireEvents();
        this.dropDownModule.renderDropDowns({
            container: ele,
            containerType: ((this.parent.inlineMode.enable) ? 'quick' : 'toolbar'),
            items: this.parent.toolbarSettings.items
        });
        this.parent.notify(events.renderColorPicker, {
            container: this.tbElement,
            containerType: ((this.parent.inlineMode.enable) ? 'quick' : 'toolbar'),
            items: this.parent.toolbarSettings.items
        });
        return true;
    };
    Toolbar.prototype.checkIsTransformChild = function () {
        this.isTransformChild = false;
        var transformElements = selectAll('[style*="transform"]', document);
        for (var i = 0; i < transformElements.length; i++) {
            if (!isNullOrUndefined(transformElements[i].contains) && transformElements[i].contains(this.parent.element)) {
                this.isTransformChild = true;
                break;
            }
        }
    };
    Toolbar.prototype.toggleFloatClass = function (e) {
        var topValue;
        var isBody = false;
        var isFloat = false;
        var scrollParent;
        var floatOffset = this.parent.floatingToolbarOffset;
        if (e && this.parent.iframeSettings.enable && this.parent.inputElement.ownerDocument === e.target) {
            scrollParent = e.target.body;
        }
        else if (e && e.target !== document) {
            scrollParent = e.target;
        }
        else {
            isBody = true;
            scrollParent = document.body;
        }
        var tbHeight = this.getToolbarHeight() + this.getExpandTBarPopHeight();
        if (this.isTransformChild) {
            topValue = 0;
            var scrollParentRelativeTop = 0;
            var trgHeight = this.parent.element.offsetHeight;
            if (isBody) {
                var bodyStyle = window.getComputedStyle(scrollParent);
                scrollParentRelativeTop = parseFloat(bodyStyle.marginTop.split('px')[0]) + parseFloat(bodyStyle.paddingTop.split('px')[0]);
            }
            var targetTop = this.parent.element.getBoundingClientRect().top;
            var scrollParentYOffset = (Browser.isMSPointer && isBody) ? window.pageYOffset : scrollParent.parentElement.scrollTop;
            var scrollParentRect = scrollParent.getBoundingClientRect();
            var scrollParentTop = (!isBody) ? scrollParentRect.top : (scrollParentRect.top + scrollParentYOffset);
            var outOfRange = ((targetTop - ((!isBody) ? scrollParentTop : 0))
                + trgHeight > tbHeight + floatOffset) ? false : true;
            if (targetTop > (scrollParentTop + floatOffset) || targetTop < -trgHeight || ((targetTop < 0) ? outOfRange : false)) {
                isFloat = false;
                removeClass([this.tbElement], [classes.CLS_TB_ABS_FLOAT]);
            }
            else if (targetTop < (scrollParentTop + floatOffset)) {
                if (targetTop < 0) {
                    topValue = (-targetTop) + scrollParentTop;
                }
                else {
                    topValue = scrollParentTop - targetTop;
                }
                topValue = (isBody) ? topValue - scrollParentRelativeTop : topValue;
                addClass([this.tbElement], [classes.CLS_TB_ABS_FLOAT]);
                isFloat = true;
            }
        }
        else {
            var parent_1 = this.parent.element.getBoundingClientRect();
            if (window.innerHeight < parent_1.top) {
                return;
            }
            topValue = (e && e.target !== document) ? scrollParent.getBoundingClientRect().top : 0;
            if ((parent_1.bottom < (floatOffset + tbHeight + topValue)) || parent_1.bottom < 0 || parent_1.top > floatOffset + topValue) {
                isFloat = false;
            }
            else if (parent_1.top < floatOffset) {
                isFloat = true;
            }
        }
        if (!isFloat) {
            removeClass([this.tbElement], [classes.CLS_TB_FLOAT]);
            setStyleAttribute(this.tbElement, { top: 0 + 'px', width: '100%' });
        }
        else {
            addClass([this.tbElement], [classes.CLS_TB_FLOAT]);
            setStyleAttribute(this.tbElement, { width: this.parent.element.offsetWidth + 'px', top: (floatOffset + topValue) + 'px' });
        }
    };
    Toolbar.prototype.renderToolbar = function () {
        this.initializeInstance();
        this.createToolbarElement();
        if (this.checkToolbarResponsive(this.tbElement)) {
            return;
        }
        if (this.parent.inlineMode.enable) {
            this.parent.notify(events.renderInlineToolbar, {});
        }
        else {
            this.baseToolbar.render({
                container: 'toolbar',
                items: this.parent.toolbarSettings.items,
                mode: this.getToolbarMode(),
                target: this.tbElement
            });
            if (!this.parent.inlineMode.enable) {
                if (this.parent.toolbarSettings.enableFloating) {
                    this.checkIsTransformChild();
                    this.toggleFloatClass();
                }
                addClass([this.parent.element], [classes.CLS_RTE_TB_ENABLED]);
                if (this.parent.toolbarSettings.type === ToolbarType.Expand) {
                    addClass([this.parent.element], [classes.CLS_RTE_EXPAND_TB]);
                }
            }
        }
        this.wireEvents();
        if (this.parent.inlineMode.enable && !isIDevice()) {
            this.addFixedTBarClass();
        }
        if (!this.parent.inlineMode.enable) {
            this.dropDownModule.renderDropDowns({
                container: this.tbElement,
                containerType: 'toolbar',
                items: this.parent.toolbarSettings.items
            });
            this.parent.notify(events.renderColorPicker, {
                container: this.tbElement,
                containerType: 'toolbar',
                items: this.parent.toolbarSettings.items
            });
            this.refreshToolbarOverflow();
        }
        var divEle = this.parent.element.querySelector('.e-rte-srctextarea');
        var iframeEle = this.parent.element.querySelector('.e-source-content');
        if ((!this.parent.iframeSettings.enable && (!isNOU(divEle) && divEle.style.display === 'block')) ||
            (this.parent.iframeSettings.enable && (!isNOU(iframeEle) && iframeEle.style.display === 'block'))) {
            this.parent.notify(events.updateToolbarItem, {
                targetItem: 'SourceCode', updateItem: 'Preview',
                baseToolbar: this.parent.getBaseToolbarObject()
            });
            this.parent.disableToolbarItem(this.parent.toolbarSettings.items);
        }
    };
    /**
     * addFixedTBarClass method
     *
     * @returns {void}
     * @hidden

     */
    Toolbar.prototype.addFixedTBarClass = function () {
        addClass([this.tbElement], [classes.CLS_TB_FIXED]);
    };
    /**
     * removeFixedTBarClass method
     *
     * @returns {void}
     * @hidden

     */
    Toolbar.prototype.removeFixedTBarClass = function () {
        removeClass([this.tbElement], [classes.CLS_TB_FIXED]);
    };
    Toolbar.prototype.showFixedTBar = function () {
        addClass([this.tbElement], [classes.CLS_SHOW]);
        if (Browser.isIos) {
            addClass([this.tbElement], [classes.CLS_TB_IOS_FIX]);
        }
    };
    Toolbar.prototype.hideFixedTBar = function () {
        // eslint-disable-next-line
        (!this.isToolbar) ? removeClass([this.tbElement], [classes.CLS_SHOW, classes.CLS_TB_IOS_FIX]) : this.isToolbar = false;
    };
    /**
     * updateItem method
     *
     * @param {IUpdateItemsModel} args - specifies the arguments.
     * @returns {void}
     * @hidden

     */
    Toolbar.prototype.updateItem = function (args) {
        var item = this.tools[args.updateItem.toLocaleLowerCase()];
        var trgItem = this.tools[args.targetItem.toLocaleLowerCase()];
        var index = getTBarItemsIndex(getCollection(trgItem.subCommand), args.baseToolbar.toolbarObj.items)[0];
        if (!isNOU(index)) {
            var prefixId = this.parent.inlineMode.enable ? '_quick_' : '_toolbar_';
            args.baseToolbar.toolbarObj.items[index].id = this.parent.getID() + prefixId + item.id;
            args.baseToolbar.toolbarObj.items[index].prefixIcon = item.icon;
            args.baseToolbar.toolbarObj.items[index].tooltipText = item.tooltip;
            args.baseToolbar.toolbarObj.items[index].subCommand = item.subCommand;
            args.baseToolbar.toolbarObj.dataBind();
        }
        else {
            this.addTBarItem(args, 0);
        }
    };
    Toolbar.prototype.updateToolbarStatus = function (args) {
        if (!this.tbElement || (this.parent.inlineMode.enable && (isIDevice() || !Browser.isDevice))) {
            return;
        }
        var options = {
            args: args,
            dropDownModule: this.dropDownModule,
            parent: this.parent,
            tbElements: selectAll('.' + classes.CLS_TB_ITEM, this.tbElement),
            tbItems: this.baseToolbar.toolbarObj.items
        };
        setToolbarStatus(options, (this.parent.inlineMode.enable ? true : false), this.parent);
    };
    Toolbar.prototype.fullScreen = function (e) {
        this.parent.fullScreenModule.showFullScreen(e);
    };
    Toolbar.prototype.hideScreen = function (e) {
        this.parent.fullScreenModule.hideFullScreen(e);
    };
    /**
     * getBaseToolbar method
     *
     * @returns {void}
     * @hidden

     */
    Toolbar.prototype.getBaseToolbar = function () {
        return this.baseToolbar;
    };
    /**
     * addTBarItem method
     *
     * @param {IUpdateItemsModel} args - specifies the arguments.
     * @param {number} index - specifies the index value.
     * @returns {void}
     * @hidden

     */
    Toolbar.prototype.addTBarItem = function (args, index) {
        args.baseToolbar.toolbarObj.addItems([args.baseToolbar.getObject(args.updateItem, 'toolbar')], index);
    };
    /**
     * enableTBarItems method
     *
     * @param {BaseToolbar} baseToolbar - specifies the toolbar.
     * @param {string} items - specifies the string value.
     * @param {boolean} isEnable - specifies the boolean value.
     * @param {boolean} muteToolbarUpdate - specifies the toolbar.
     * @returns {void}
     * @hidden

     */
    Toolbar.prototype.enableTBarItems = function (baseToolbar, items, isEnable, muteToolbarUpdate) {
        var trgItems = getTBarItemsIndex(getCollection(items), baseToolbar.toolbarObj.items);
        this.tbItems = selectAll('.' + classes.CLS_TB_ITEM, baseToolbar.toolbarObj.element);
        for (var i = 0; i < trgItems.length; i++) {
            var item = this.tbItems[trgItems[i]];
            if (item) {
                baseToolbar.toolbarObj.enableItems(item, isEnable);
            }
        }
        if (!select('.e-rte-srctextarea', this.parent.element) && !muteToolbarUpdate) {
            updateUndoRedoStatus(baseToolbar, this.parent.formatter.editorManager.undoRedoManager.getUndoStatus());
        }
    };
    /**
     * removeTBarItems method
     *
     * @param {string} items - specifies the string value.
     * @returns {void}
     * @hidden

     */
    Toolbar.prototype.removeTBarItems = function (items) {
        if (isNullOrUndefined(this.baseToolbar.toolbarObj)) {
            this.baseToolbar = this.parent.getBaseToolbarObject();
        }
        var trgItems = getTBarItemsIndex(getCollection(items), this.baseToolbar.toolbarObj.items);
        this.tbItems = (this.parent.inlineMode.enable) ? selectAll('.' + classes.CLS_TB_ITEM, this.baseToolbar.toolbarObj.element)
            : selectAll('.' + classes.CLS_TB_ITEM, this.parent.element);
        for (var i = 0; i < trgItems.length; i++) {
            this.baseToolbar.toolbarObj.removeItems(this.tbItems[trgItems[i]]);
        }
    };
    /**
     * getExpandTBarPopHeight method
     *
     * @returns {void}
     * @hidden

     */
    Toolbar.prototype.getExpandTBarPopHeight = function () {
        var popHeight = 0;
        if (this.parent.toolbarSettings.type === ToolbarType.Expand && this.tbElement.classList.contains('e-extended-toolbar')) {
            var expandPopup = select('.e-toolbar-extended', this.tbElement);
            if (expandPopup && this.tbElement.classList.contains('e-expand-open')
                || expandPopup && expandPopup.classList.contains('e-popup-open')) {
                addClass([expandPopup], [classes.CLS_VISIBLE]);
                popHeight = popHeight + expandPopup.offsetHeight;
                removeClass([expandPopup], [classes.CLS_VISIBLE]);
            }
            else {
                removeClass([this.tbElement], [classes.CLS_EXPAND_OPEN]);
            }
        }
        return popHeight;
    };
    /**
     * getToolbarHeight method
     *
     * @returns {void}
     * @hidden

     */
    Toolbar.prototype.getToolbarHeight = function () {
        return this.tbElement.offsetHeight;
    };
    /**
     * getToolbarElement method
     *
     * @returns {void}
     * @hidden

     */
    Toolbar.prototype.getToolbarElement = function () {
        return select('.' + classes.CLS_TOOLBAR, this.parent.element);
    };
    /**
     * refreshToolbarOverflow method
     *
     * @returns {void}
     * @hidden

     */
    Toolbar.prototype.refreshToolbarOverflow = function () {
        this.baseToolbar.toolbarObj.refreshOverflow();
    };
    Toolbar.prototype.isToolbarDestroyed = function () {
        return this.baseToolbar.toolbarObj && !this.baseToolbar.toolbarObj.isDestroyed;
    };
    Toolbar.prototype.destroyToolbar = function () {
        if (this.isToolbarDestroyed()) {
            this.parent.unWireScrollElementsEvents();
            this.unWireEvents();
            this.parent.notify(events.destroyColorPicker, {});
            this.dropDownModule.destroyDropDowns();
            this.baseToolbar.toolbarObj.destroy();
            this.removeEventListener();
            removeClass([this.parent.element], [classes.CLS_RTE_TB_ENABLED]);
            removeClass([this.parent.element], [classes.CLS_RTE_EXPAND_TB]);
            var tbWrapper = select('.' + classes.CLS_TB_WRAP, this.parent.element);
            var tbElement = select('.' + classes.CLS_TOOLBAR, this.parent.element);
            if (!isNullOrUndefined(tbWrapper)) {
                detach(tbWrapper);
            }
            else if (!isNullOrUndefined(tbElement)) {
                detach(tbElement);
            }
        }
    };
    /**
     * Destroys the ToolBar.
     *
     * @function destroy
     * @returns {void}
     * @hidden

     */
    Toolbar.prototype.destroy = function () {
        if (this.isToolbarDestroyed()) {
            this.destroyToolbar();
            if (this.keyBoardModule) {
                this.keyBoardModule.destroy();
            }
        }
    };
    Toolbar.prototype.scrollHandler = function (e) {
        if (!this.parent.inlineMode.enable) {
            if (this.parent.toolbarSettings.enableFloating && this.getDOMVisibility(this.tbElement)) {
                this.toggleFloatClass(e.args);
            }
        }
    };
    Toolbar.prototype.getDOMVisibility = function (el) {
        if (!el.offsetParent && el.offsetWidth === 0 && el.offsetHeight === 0) {
            return false;
        }
        return true;
    };
    Toolbar.prototype.mouseDownHandler = function () {
        if (Browser.isDevice && this.parent.inlineMode.enable && !isIDevice()) {
            this.showFixedTBar();
        }
    };
    Toolbar.prototype.focusChangeHandler = function () {
        if (Browser.isDevice && this.parent.inlineMode.enable && !isIDevice()) {
            this.isToolbar = false;
            this.hideFixedTBar();
        }
    };
    Toolbar.prototype.dropDownBeforeOpenHandler = function () {
        this.isToolbar = true;
    };
    // eslint-disable-next-line
    Toolbar.prototype.tbFocusHandler = function (e) {
        var activeElm = document.activeElement;
        var isToolbaractive = closest(activeElm, '.e-rte-toolbar');
        if (activeElm === this.parent.getToolbarElement() || isToolbaractive === this.parent.getToolbarElement()) {
            var toolbarItem = this.parent.getToolbarElement().querySelectorAll('.e-expended-nav');
            for (var i = 0; i < toolbarItem.length; i++) {
                if (isNOU(this.parent.getToolbarElement().querySelector('.e-insert-table-btn'))) {
                    toolbarItem[i].setAttribute('tabindex', '0');
                }
                else {
                    toolbarItem[i].setAttribute('tabindex', '1');
                }
            }
        }
    };
    Toolbar.prototype.tbKeydownHandler = function (e) {
        if (e.target.classList.contains('e-dropdown-btn') ||
            e.target.getAttribute('id') === this.parent.getID() + '_toolbar_CreateTable') {
            e.target.setAttribute('tabindex', '0');
        }
    };
    Toolbar.prototype.toolbarClickHandler = function (e) {
        var trg = closest(e.originalEvent.target, '.e-hor-nav');
        if (trg && this.parent.toolbarSettings.type === ToolbarType.Expand && !isNOU(trg)) {
            if (!trg.classList.contains('e-nav-active')) {
                removeClass([this.tbElement], [classes.CLS_EXPAND_OPEN]);
                this.parent.setContentHeight('toolbar', false);
            }
            else {
                addClass([this.tbElement], [classes.CLS_EXPAND_OPEN]);
                this.parent.setContentHeight('toolbar', true);
            }
        }
        else if (Browser.isDevice || this.parent.inlineMode.enable) {
            this.isToolbar = true;
        }
        if (isNOU(trg) && this.parent.toolbarSettings.type === ToolbarType.Expand) {
            removeClass([this.tbElement], [classes.CLS_EXPAND_OPEN]);
        }
    };
    Toolbar.prototype.wireEvents = function () {
        if (this.parent.inlineMode.enable && isIDevice()) {
            return;
        }
        EventHandler.add(this.tbElement, 'focusin', this.tbFocusHandler, this);
        EventHandler.add(this.tbElement, 'keydown', this.tbKeydownHandler, this);
    };
    Toolbar.prototype.unWireEvents = function () {
        EventHandler.remove(this.tbElement, 'focusin', this.tbFocusHandler);
        EventHandler.remove(this.tbElement, 'keydown', this.tbKeydownHandler);
    };
    Toolbar.prototype.addEventListener = function () {
        if (this.parent.isDestroyed) {
            return;
        }
        this.dropDownModule = new DropDownButtons(this.parent, this.locator);
        this.toolbarActionModule = new ToolbarAction(this.parent);
        this.parent.on(events.initialEnd, this.renderToolbar, this);
        this.parent.on(events.scroll, this.scrollHandler, this);
        this.parent.on(events.bindOnEnd, this.toolbarBindEvent, this);
        this.parent.on(events.toolbarUpdated, this.updateToolbarStatus, this);
        this.parent.on(events.modelChanged, this.onPropertyChanged, this);
        this.parent.on(events.refreshBegin, this.onRefresh, this);
        this.parent.on(events.destroy, this.destroy, this);
        this.parent.on(events.enableFullScreen, this.fullScreen, this);
        this.parent.on(events.disableFullScreen, this.hideScreen, this);
        this.parent.on(events.updateToolbarItem, this.updateItem, this);
        this.parent.on(events.beforeDropDownOpen, this.dropDownBeforeOpenHandler, this);
        this.parent.on(events.expandPopupClick, this.parent.setContentHeight, this.parent);
        this.parent.on(events.focusChange, this.focusChangeHandler, this);
        this.parent.on(events.mouseDown, this.mouseDownHandler, this);
        this.parent.on(events.sourceCodeMouseDown, this.mouseDownHandler, this);
        if (!this.parent.inlineMode.enable && !isIDevice()) {
            this.parent.on(events.toolbarClick, this.toolbarClickHandler, this);
        }
    };
    Toolbar.prototype.removeEventListener = function () {
        if (this.parent.isDestroyed) {
            return;
        }
        this.parent.off(events.initialEnd, this.renderToolbar);
        this.parent.off(events.scroll, this.scrollHandler);
        this.parent.off(events.bindOnEnd, this.toolbarBindEvent);
        this.parent.off(events.toolbarUpdated, this.updateToolbarStatus);
        this.parent.off(events.modelChanged, this.onPropertyChanged);
        this.parent.off(events.refreshBegin, this.onRefresh);
        this.parent.off(events.destroy, this.destroy);
        this.parent.off(events.enableFullScreen, this.parent.fullScreenModule.showFullScreen);
        this.parent.off(events.disableFullScreen, this.parent.fullScreenModule.hideFullScreen);
        this.parent.off(events.updateToolbarItem, this.updateItem);
        this.parent.off(events.beforeDropDownOpen, this.dropDownBeforeOpenHandler);
        this.parent.off(events.expandPopupClick, this.parent.setContentHeight);
        this.parent.off(events.focusChange, this.focusChangeHandler);
        this.parent.off(events.mouseDown, this.mouseDownHandler);
        this.parent.off(events.sourceCodeMouseDown, this.mouseDownHandler);
        if (!this.parent.inlineMode.enable && !isIDevice()) {
            this.parent.off(events.toolbarClick, this.toolbarClickHandler);
        }
    };
    Toolbar.prototype.onRefresh = function () {
        this.refreshToolbarOverflow();
        this.parent.setContentHeight('', true);
    };
    /**
     * Called internally if any of the property value changed.
     *
     * @param {RichTextEditorModel} e - specifies the string value
     * @returns {void}
     * @hidden

     */
    Toolbar.prototype.onPropertyChanged = function (e) {
        if (!isNullOrUndefined(e.newProp.inlineMode)) {
            for (var _i = 0, _a = Object.keys(e.newProp.inlineMode); _i < _a.length; _i++) {
                var prop = _a[_i];
                switch (prop) {
                    case 'enable':
                        this.refreshToolbar();
                        break;
                }
            }
        }
        if (e.module !== this.getModuleName()) {
            return;
        }
        this.refreshToolbar();
    };
    Toolbar.prototype.refreshToolbar = function () {
        if (isNullOrUndefined(this.baseToolbar.toolbarObj)) {
            this.baseToolbar = this.parent.getBaseToolbarObject();
        }
        var tbWrapper = select('.' + classes.CLS_TB_WRAP, this.parent.element);
        var tbElement = select('.' + classes.CLS_TOOLBAR, this.parent.element);
        if (tbElement || tbWrapper) {
            this.destroyToolbar();
        }
        if (this.parent.toolbarSettings.enable) {
            this.addEventListener();
            this.renderToolbar();
            this.parent.wireScrollElementsEvents();
            if (!select('.e-rte-srctextarea', this.parent.element)) {
                updateUndoRedoStatus(this.baseToolbar, this.parent.formatter.editorManager.undoRedoManager.getUndoStatus());
            }
            this.parent.notify(events.dynamicModule, {});
        }
    };
    /**
     * For internal use only - Get the module name.
     *
     * @returns {void}
     * @hidden
     */
    Toolbar.prototype.getModuleName = function () {
        return 'toolbar';
    };
    return Toolbar;
}());
export { Toolbar };
