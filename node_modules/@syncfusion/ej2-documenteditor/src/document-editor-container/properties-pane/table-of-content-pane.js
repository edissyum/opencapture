import { createElement, L10n, classList } from '@syncfusion/ej2-base';
import { Button, CheckBox } from '@syncfusion/ej2-buttons';
import { DropDownList } from '@syncfusion/ej2-dropdowns';
/**
 * TOC Properties pane
 *
 * @private
 */
var TocProperties = /** @class */ (function () {
    function TocProperties(container, isRtl) {
        this.container = container;
        this.elementId = this.documentEditor.element.id;
        this.isRtl = isRtl;
        this.initializeTocPane();
    }
    Object.defineProperty(TocProperties.prototype, "documentEditor", {
        get: function () {
            return this.container.documentEditor;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(TocProperties.prototype, "toolbar", {
        get: function () {
            return this.container.toolbarModule;
        },
        enumerable: true,
        configurable: true
    });
    /**
     * @private
     * @param {boolean} enable - enable/disable table of content pane.
     * @returns {void}
     */
    TocProperties.prototype.enableDisableElements = function (enable) {
        if (enable) {
            classList(this.element, [], ['e-de-overlay']);
        }
        else {
            classList(this.element, ['e-de-overlay'], []);
        }
    };
    TocProperties.prototype.initializeTocPane = function () {
        this.localObj = new L10n('documenteditorcontainer', this.container.defaultLocale, this.container.locale);
        this.element = createElement('div', { id: this.elementId + '_tocProperties', className: 'e-de-prop-pane' });
        var container = createElement('div', { className: 'e-de-cntr-pane-padding e-de-prop-separator-line' });
        this.tocHeaderDiv(container);
        this.initTemplates(container);
        container = createElement('div', { className: 'e-de-cntr-pane-padding' });
        this.tocOptionsDiv(container);
        this.contentStylesDropdown(container);
        this.checkboxContent(container);
        this.buttonDiv(container);
        this.wireEvents();
        this.updateTocProperties();
        this.container.propertiesPaneContainer.appendChild(this.element);
    };
    TocProperties.prototype.updateTocProperties = function () {
        this.rightalignPageNumber.checked = true;
        this.showPageNumber.checked = true;
        this.hyperlink.checked = true;
    };
    TocProperties.prototype.wireEvents = function () {
        var _this = this;
        this.cancelBtn.element.addEventListener('click', function () {
            _this.onClose();
        });
        this.updateBtn.element.addEventListener('click', this.onInsertToc.bind(this));
        this.closeButton.addEventListener('click', function () {
            _this.onClose();
        });
    };
    TocProperties.prototype.onClose = function () {
        if (this.container.showPropertiesPane
            && this.container.previousContext !== 'TableOfContents') {
            this.container.showPropertiesPaneOnSelection();
        }
        else {
            this.showTocPane(false);
            if (this.toolbar) {
                this.toolbar.enableDisablePropertyPaneButton(false);
            }
            this.container.showPropertiesPane = false;
        }
    };
    TocProperties.prototype.tocHeaderDiv = function (container) {
        var closeButtonFloat;
        //let headerDivMargin: string;
        var closeButtonMargin;
        if (!this.isRtl) {
            closeButtonFloat = 'float:right;';
            //headerDivMargin = 'margin-left:5.5px;';
            closeButtonMargin = 'margin-right:7px;';
        }
        else {
            closeButtonFloat = 'float:left;';
            //headerDivMargin = 'margin-right:5.5px;';
            closeButtonMargin = 'margin-left:7px;';
        }
        var headerDiv = createElement('div', {
            id: this.elementId + 'toc_id',
            styles: 'display: block;'
        });
        container.appendChild(headerDiv);
        this.element.appendChild(container);
        var title = createElement('label', {
            className: 'e-de-ctnr-prop-label'
        });
        title.textContent = this.localObj.getConstant('Table of Contents');
        headerDiv.appendChild(title);
        this.closeButton = createElement('span', {
            className: 'e-de-ctnr-close e-icons',
            styles: 'cursor: pointer;display:inline-block;color: #4A4A4A;' + closeButtonFloat + closeButtonMargin
        });
        headerDiv.appendChild(this.closeButton);
    };
    TocProperties.prototype.initTemplates = function (container) {
        this.template1(container);
        // let div: HTMLElement = createElement('div', { styles: 'display:block;border-top: 1px solid #E0E0E0;' }); this.element.appendChild(div);
    };
    TocProperties.prototype.template1 = function (container) {
        this.template1Div = createElement('div', {
            className: 'e-de-toc-template1'
        });
        if (this.isRtl) {
            this.template1Div.classList.add('e-de-rtl');
        }
        container.appendChild(this.template1Div);
        var templateContent1 = createElement('div', {
            className: 'e-de-toc-template1-content1'
        });
        templateContent1.textContent = this.localObj.getConstant('HEADING - - - - 1');
        this.template1Div.appendChild(templateContent1);
        var templateContent2 = createElement('div', {
            className: 'e-de-toc-template1-content2'
        });
        templateContent2.textContent = this.localObj.getConstant('HEADING - - - - 2');
        this.template1Div.appendChild(templateContent2);
        var templateContent3 = createElement('div', {
            className: 'e-de-toc-template1-content3'
        });
        templateContent3.textContent = this.localObj.getConstant('HEADING - - - - 3');
        this.template1Div.appendChild(templateContent3);
    };
    TocProperties.prototype.tocOptionsDiv = function (container) {
        var optionsDiv = createElement('div');
        container.appendChild(optionsDiv);
        this.element.appendChild(container);
        if (this.isRtl) {
            optionsDiv.classList.add('e-de-rtl');
        }
        var label = createElement('label', { className: 'e-de-ctnr-prop-label' });
        label.textContent = this.localObj.getConstant('Options');
        optionsDiv.appendChild(label);
    };
    /* eslint-disable-next-line max-len */
    TocProperties.prototype.createDropDownButton = function (id, parentDiv, iconCss, content, selectedIndex) {
        var buttonElement = createElement('input', { id: id });
        parentDiv.appendChild(buttonElement);
        var dropDownBtn = new DropDownList({ index: selectedIndex, dataSource: content, popupHeight: '150px', cssClass: 'e-de-prop-font-button' }, buttonElement);
        return dropDownBtn;
    };
    /* eslint-disable */
    TocProperties.prototype.contentStylesDropdown = function (container) {
        var _this = this;
        var contentStyleElementMargin;
        if (!this.isRtl) {
            contentStyleElementMargin = 'margin-left:5.5px;';
        }
        else {
            contentStyleElementMargin = 'margin-right:5.5px;';
        }
        var contentStyleElement = createElement('div', { id: 'contentstyle_div' });
        contentStyleElement.setAttribute('title', this.localObj.getConstant('Number of heading or outline levels to be shown in table of contents'));
        container.appendChild(contentStyleElement);
        // let items: ItemModel[] = [{ text: '___________', id: 'solid' }];
        // this.borderStyle = this.createDropDownButton(
        //     this.elementId + '_borderStyleDiv',
        //     'width:120px;height:28px;margin-top:8px', contentStyleElement, 'e-de-icon-stroke-size', 'Solid', items
        // );
        var labelMargin;
        if (!this.isRtl) {
            labelMargin = 'margin-right:8px;';
        }
        else {
            labelMargin = 'margin-left:8px';
        }
        var label = createElement('label', { className: 'e-de-prop-sub-label', styles: 'display:block' });
        label.textContent = this.localObj.getConstant('Levels');
        contentStyleElement.appendChild(label);
        container.appendChild(contentStyleElement);
        var dataSource = ['1', '2', '3', '4', '5', '6', '7', '8', '9'];
        this.borderLevelStyle = this.createDropDownButton(this.elementId + '_borderLevelDiv', contentStyleElement, '', dataSource, 2);
        this.borderLevelStyle.change = function (args) {
            _this.borderLevelStyle.value = args.item.value;
        };
        container.appendChild(contentStyleElement);
    };
    TocProperties.prototype.checkboxContent = function (container) {
        var checkboxElementMargin;
        if (!this.isRtl) {
            checkboxElementMargin = 'margin-left:5.5px;';
        }
        else {
            checkboxElementMargin = 'margin-right:5.5px;';
        }
        var checkboxElement = createElement('div', { id: 'toc_checkboxDiv', styles: 'margin-bottom:36px;' });
        container.appendChild(checkboxElement);
        var showPageNumberDiv = createElement('div', { className: 'e-de-toc-checkbox1' });
        showPageNumberDiv.setAttribute('title', this.localObj.getConstant('Show page numbers in table of contents'));
        checkboxElement.appendChild(showPageNumberDiv);
        var showpagenumberCheckboxElement = createElement('input', { id: 'showpagenumber', styles: 'width:12px;height:12px;margin-bottom:8px', className: 'e-de-prop-sub-label' });
        showPageNumberDiv.appendChild(showpagenumberCheckboxElement);
        this.showPageNumber = new CheckBox({
            label: this.localObj.getConstant('Show page numbers'),
            enableRtl: this.isRtl
        });
        this.showPageNumber.appendTo(showpagenumberCheckboxElement);
        var rightAlignDiv = createElement('div', { className: 'e-de-toc-checkbox2' });
        rightAlignDiv.setAttribute('title', this.localObj.getConstant('Right align page numbers in table of contents'));
        checkboxElement.appendChild(rightAlignDiv);
        var rightalignpagenumberCheckboxElement = createElement('input', { id: 'rightalignpagenumber', styles: 'width:12px;height:12px', className: 'e-de-prop-sub-label' });
        rightAlignDiv.appendChild(rightalignpagenumberCheckboxElement);
        this.rightalignPageNumber = new CheckBox({
            label: this.localObj.getConstant('Right align page numbers'),
            enableRtl: this.isRtl
        });
        this.rightalignPageNumber.appendTo(rightalignpagenumberCheckboxElement);
        var hyperlinkDiv = createElement('div', { className: 'e-de-toc-checkbox3' });
        hyperlinkDiv.setAttribute('title', this.localObj.getConstant('Use hyperlinks instead of page numbers'));
        checkboxElement.appendChild(hyperlinkDiv);
        var hyperlinkCheckboxElement = createElement('input', { id: 'hyperlinkdiv', styles: 'width:12px;height:12px', className: 'e-de-prop-sub-label' });
        hyperlinkDiv.appendChild(hyperlinkCheckboxElement);
        this.hyperlink = new CheckBox({
            label: this.localObj.getConstant('Use hyperlinks'),
            enableRtl: this.isRtl
        });
        this.hyperlink.appendTo(hyperlinkCheckboxElement);
    };
    TocProperties.prototype.buttonDiv = function (container) {
        var footerElementFloat;
        if (!this.isRtl) {
            footerElementFloat = 'float:right';
        }
        else {
            footerElementFloat = 'float:left';
        }
        var footerElement = createElement('div', { id: 'footerDiv', styles: footerElementFloat });
        container.appendChild(footerElement);
        var updatebuttoncontentStyleElement = createElement('button', {
            id: 'footerupdatebuttonDiv',
            attrs: { type: 'button' }
        });
        footerElement.appendChild(updatebuttoncontentStyleElement);
        this.updateBtn = new Button({
            content: this.localObj.getConstant('Update'), cssClass: 'btn-update', isPrimary: true
        });
        this.updateBtn.appendTo(updatebuttoncontentStyleElement);
        var cancelbuttoncontentStyleElement = createElement('button', {
            id: 'footercancelbuttonDiv',
            attrs: { type: 'button' }
        });
        footerElement.appendChild(cancelbuttoncontentStyleElement);
        this.cancelBtn = new Button({
            content: this.localObj.getConstant('Cancel'), cssClass: this.isRtl ? 'e-de-btn-cancel-rtl' : 'e-de-btn-cancel'
        });
        this.cancelBtn.appendTo(cancelbuttoncontentStyleElement);
    };
    TocProperties.prototype.showTocPane = function (isShow, previousContextType) {
        if (!isShow && this.element.style.display === 'none' || (isShow && this.element.style.display === 'block')) {
            return;
        }
        this.element.style.display = isShow ? 'block' : 'none';
        this.updateBtn.content = this.documentEditor.selection.contextType === 'TableOfContents' ? this.localObj.getConstant('Update') : this.localObj.getConstant('Insert');
        this.prevContext = this.documentEditor.selection.contextType;
        this.documentEditor.resize();
        if (isShow) {
            this.updateBtn.element.focus();
        }
    };
    TocProperties.prototype.onInsertToc = function () {
        var tocSettings = {
            startLevel: 1,
            endLevel: parseInt(this.borderLevelStyle.value, 0),
            includeHyperlink: this.hyperlink.checked,
            includePageNumber: this.showPageNumber.checked,
            rightAlign: this.rightalignPageNumber.checked
        };
        if (tocSettings.rightAlign) {
            tocSettings.tabLeader = 'Dot';
        }
        this.documentEditor.editor.insertTableOfContents(tocSettings);
    };
    TocProperties.prototype.destroy = function () {
        this.container = undefined;
        if (this.showPageNumber) {
            this.showPageNumber.destroy();
            this.showPageNumber = undefined;
        }
        if (this.rightalignPageNumber) {
            this.rightalignPageNumber.destroy();
            this.rightalignPageNumber = undefined;
        }
        if (this.borderBtn) {
            this.borderBtn.destroy();
            this.borderBtn = undefined;
        }
        if (this.borderLevelStyle) {
            this.borderLevelStyle.destroy();
            this.borderLevelStyle = undefined;
        }
    };
    return TocProperties;
}());
export { TocProperties };
