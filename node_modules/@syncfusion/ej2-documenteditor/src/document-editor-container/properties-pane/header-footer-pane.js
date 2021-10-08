/**
 * Represents document editor header and footer.
 */
import { createElement, L10n, classList } from '@syncfusion/ej2-base';
import { CheckBox } from '@syncfusion/ej2-buttons';
import { NumericTextBox } from '@syncfusion/ej2-inputs';
/**
 * @private
 */
var HeaderFooterProperties = /** @class */ (function () {
    function HeaderFooterProperties(container, isRtl) {
        this.isHeaderTopApply = false;
        this.isFooterTopApply = false;
        this.container = container;
        this.isRtl = isRtl;
        this.initHeaderFooterPane();
        this.wireEvents();
    }
    Object.defineProperty(HeaderFooterProperties.prototype, "documentEditor", {
        get: function () {
            return this.container.documentEditor;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(HeaderFooterProperties.prototype, "toolbar", {
        get: function () {
            return this.container.toolbarModule;
        },
        enumerable: true,
        configurable: true
    });
    /**
     * @private
     * @param {boolean} enable - enable/disable header footer pane.
     * @returns {void}
     */
    HeaderFooterProperties.prototype.enableDisableElements = function (enable) {
        if (enable) {
            classList(this.element, [], ['e-de-overlay']);
        }
        else {
            classList(this.element, ['e-de-overlay'], []);
        }
    };
    HeaderFooterProperties.prototype.initHeaderFooterPane = function () {
        this.initializeHeaderFooter();
        this.element.style.display = 'none';
        this.container.propertiesPaneContainer.appendChild(this.element);
    };
    HeaderFooterProperties.prototype.showHeaderFooterPane = function (isShow) {
        if (isShow) {
            if (this.toolbar) {
                this.toolbar.enableDisablePropertyPaneButton(false);
            }
            this.onSelectionChange();
        }
        if (!isShow && this.element.style.display === 'none' || (isShow && this.element.style.display === 'block')) {
            return;
        }
        this.element.style.display = isShow ? 'block' : 'none';
        this.documentEditor.resize();
    };
    HeaderFooterProperties.prototype.initializeHeaderFooter = function () {
        var _this = this;
        var localObj = new L10n('documenteditorcontainer', this.container.defaultLocale, this.container.locale);
        var elementId = 'header_footer_properties';
        this.element = createElement('div', { id: this.documentEditor.element.id + elementId, className: 'e-de-prop-pane' });
        var headerDiv = this.createDivTemplate('_header_footer', this.element, 'padding-bottom:0');
        classList(headerDiv, ['e-de-cntr-pane-padding'], []);
        var headerLabel = createElement('label', { className: 'e-de-prop-header-label' });
        headerLabel.innerHTML = localObj.getConstant('Header And Footer');
        var closeButtonFloat;
        //let optionsLabelDivPadding: string;
        //let positionLabelDivPadding: string;
        if (!this.isRtl) {
            closeButtonFloat = 'float:right;';
            //optionsLabelDivPadding = 'padding-left: 14px';
            //positionLabelDivPadding = 'padding-left: 14px;';
        }
        else {
            closeButtonFloat = 'float:left;';
            //optionsLabelDivPadding = 'padding-right: 14px';
            //positionLabelDivPadding = 'padding-right: 14px;';
        }
        var closeIcon = createElement('span', {
            id: '_header_footer_close',
            className: 'e-de-ctnr-close e-de-close-icon e-icons',
            styles: 'display:inline-block;cursor:pointer;' + closeButtonFloat
        });
        closeIcon.addEventListener('click', function () {
            _this.onClose();
        });
        headerDiv.appendChild(headerLabel);
        headerDiv.appendChild(closeIcon);
        var optionsLabelDiv = this.createDivTemplate(elementId + '_options', this.element);
        classList(optionsLabelDiv, ['e-de-cntr-pane-padding', 'e-de-prop-separator-line'], []);
        var optionsLabel = createElement('label', { className: 'e-de-ctnr-prop-label', styles: 'height:20px;' });
        optionsLabel.innerHTML = localObj.getConstant('Options');
        optionsLabelDiv.appendChild(optionsLabel);
        var optionsDiv = this.createDivTemplate(elementId + '_optionsDiv', optionsLabelDiv);
        var firstPageDiv = this.createDivTemplate(elementId + '_firstPageDiv', optionsDiv);
        classList(firstPageDiv, ['e-de-hdr-ftr-frst-div'], []);
        var firstPage = createElement('input', { id: 'firstPage', className: 'e-de-prop-sub-label' });
        firstPageDiv.appendChild(firstPage);
        this.firstPage = new CheckBox({ label: localObj.getConstant('Different First Page'), change: this.changeFirstPageOptions.bind(this), cssClass: 'e-de-prop-sub-label', enableRtl: this.isRtl });
        this.firstPage.appendTo(firstPage);
        firstPageDiv.children[0].setAttribute('title', localObj.getConstant('Different header and footer for first page'));
        var oddOrEvenDiv = this.createDivTemplate(elementId + '_oddOrEvenDiv', optionsDiv);
        var oddOrEven = createElement('input', { id: 'oddOrEven', className: 'e-de-sub-prop-label' });
        oddOrEvenDiv.appendChild(oddOrEven);
        this.oddOrEven = new CheckBox({ label: localObj.getConstant('Different Odd And Even Pages'), change: this.changeoddOrEvenOptions.bind(this), cssClass: 'e-de-prop-sub-label', enableRtl: this.isRtl });
        this.oddOrEven.appendTo(oddOrEven);
        oddOrEvenDiv.children[0].setAttribute('title', localObj.getConstant('Different header and footer for odd and even pages'));
        // let autoFieldLabelDiv: HTMLElement = this.createDivTemplate(element + '_autoFieldLabelDiv', div, 'padding-top:10px;padding-left: 10px;');
        // let autoFieldLabel: HTMLElement = createElement('label', { className: 'e-de-header-prop-label', styles: 'height:20px;' });
        // autoFieldLabel.innerHTML = 'Insert Autofield';
        // autoFieldLabelDiv.appendChild(autoFieldLabel);
        // let autofieldDiv: HTMLElement = this.createDivTemplate(element + '_autofieldDiv', autoFieldLabelDiv, 'display:inline-flex;');
        // let pageNumberDiv: HTMLElement = this.createDivTemplate(element + '_pageNumberDiv', autofieldDiv, 'margin-right:8px;');
        // let pageNumber: HTMLInputElement = createElement('input', { id: 'pageNumber' }) as HTMLInputElement;
        // pageNumberDiv.appendChild(pageNumber);
        // this.pageNumber = new CheckBox({ label: 'Page Number', change: this.changePageNumber });
        // this.pageNumber.appendTo(pageNumber);
        // let pageCountDiv: HTMLElement = this.createDivTemplate(element + '_pageCountDiv', autofieldDiv);
        // let pageCount: HTMLInputElement = createElement('input', { id: 'pageCount' }) as HTMLInputElement;
        // pageCountDiv.appendChild(pageCount);
        // this.pageCount = new CheckBox({ label: 'Page Count', change: this.changePageCount });
        // this.pageCount.appendTo(pageCount);
        // let autoFieldLine: HTMLElement = createElement('div', { className: 'e-de-prop-separator-line', styles: 'margin-top:7px;' });
        // autoFieldLabelDiv.appendChild(autoFieldLine);
        var positionLabelDiv = this.createDivTemplate(elementId + '_positionLabelDiv', this.element);
        classList(positionLabelDiv, ['e-de-cntr-pane-padding', 'e-de-prop-separator-line'], []);
        var positionLabel = createElement('label', { className: 'e-de-ctnr-prop-label', styles: 'height:20px;' });
        positionLabel.innerHTML = localObj.getConstant('Position');
        positionLabelDiv.appendChild(positionLabel);
        var positionDiv = this.createDivTemplate(elementId + '_positionDiv', positionLabelDiv);
        //let width: string;
        //let headerFooterDivMargin: string;
        //if (!this.isRtl) {
        //width = 'width: 128px;';
        //headerFooterDivMargin = 'margin-right:8px;';
        //} else {
        //width = 'width: 150px;';
        //headerFooterDivMargin = 'margin-left:8px;';
        //}
        var headerTopDiv = this.createDivTemplate(elementId + '_headerTopDiv', positionDiv);
        classList(headerTopDiv, ['e-de-hdr-ftr-top-div'], []);
        var headerTopLabel = createElement('label', { className: 'e-de-prop-sub-label', styles: 'display:block' });
        headerTopLabel.innerHTML = localObj.getConstant('Header from Top');
        headerTopDiv.appendChild(headerTopLabel);
        var headerFromTop = createElement('input', { id: this.documentEditor.element.id + '_headerFromTop', className: 'e-de-prop-sub-label' });
        headerTopDiv.appendChild(headerFromTop);
        this.headerFromTop = new NumericTextBox({
            value: 36, cssClass: 'e-de-prop-header-numeric',
            showSpinButton: false, format: 'n0', decimals: 2, max: 1584, min: 0, enableRtl: this.isRtl
        });
        this.headerFromTop.appendTo(headerFromTop);
        this.headerFromTop.element.parentElement.setAttribute('title', localObj.getConstant('Distance from top of the page to top of the header'));
        var footerBottomDiv = this.createDivTemplate(elementId + '_footerBottomDiv', positionDiv);
        var footerBottomLabel = createElement('label', { className: 'e-de-prop-sub-label', styles: 'display:block' });
        footerBottomLabel.innerHTML = localObj.getConstant('Footer from Bottom');
        footerBottomDiv.appendChild(footerBottomLabel);
        var footerFromTop = createElement('input', { id: this.documentEditor.element.id + '_footerFromTop', className: 'e-de-prop-sub-label' });
        footerBottomDiv.appendChild(footerFromTop);
        this.footerFromTop = new NumericTextBox({
            value: 36, cssClass: 'e-de-prop-header-numeric',
            showSpinButton: false, format: 'n0', decimals: 2, max: 1584, min: 0, enableRtl: this.isRtl
        });
        this.footerFromTop.appendTo(footerFromTop);
        this.footerFromTop.element.parentElement.setAttribute('title', localObj.getConstant('Distance from bottom of the page to bottom of the footer'));
    };
    HeaderFooterProperties.prototype.createDivTemplate = function (id, parentDiv, style) {
        var divElement;
        if (style) {
            divElement = createElement('div', { id: id, styles: style });
        }
        else {
            divElement = createElement('div', { id: id });
        }
        parentDiv.appendChild(divElement);
        return divElement;
    };
    HeaderFooterProperties.prototype.wireEvents = function () {
        var _this = this;
        this.headerFromTop.element.addEventListener('click', function () {
            _this.isHeaderTopApply = true;
        });
        this.footerFromTop.element.addEventListener('click', function () {
            _this.isFooterTopApply = true;
        });
        this.headerFromTop.element.addEventListener('keydown', this.onHeaderValue.bind(this));
        this.footerFromTop.element.addEventListener('keydown', this.onFooterValue.bind(this));
        this.headerFromTop.element.addEventListener('blur', function () {
            _this.changeHeaderValue();
            _this.isHeaderTopApply = false;
        });
        this.footerFromTop.element.addEventListener('blur', function () {
            _this.changeFooterValue();
            _this.isFooterTopApply = false;
        });
    };
    HeaderFooterProperties.prototype.onClose = function () {
        this.container.showHeaderProperties = true;
        this.container.documentEditor.selection.closeHeaderFooter();
    };
    HeaderFooterProperties.prototype.changeFirstPageOptions = function () {
        var _this = this;
        if (!this.documentEditor.isReadOnly) {
            this.documentEditor.selection.sectionFormat.differentFirstPage = this.firstPage.checked;
            setTimeout(function () {
                _this.documentEditor.focusIn();
            }, 10);
        }
    };
    HeaderFooterProperties.prototype.changeoddOrEvenOptions = function () {
        var _this = this;
        if (!this.documentEditor.isReadOnly) {
            this.documentEditor.selection.sectionFormat.differentOddAndEvenPages = this.oddOrEven.checked;
            setTimeout(function () {
                _this.documentEditor.focusIn();
            }, 10);
        }
    };
    HeaderFooterProperties.prototype.changeHeaderValue = function () {
        if (!this.isHeaderTopApply) {
            return;
        }
        if (!this.documentEditor.isReadOnly) {
            var headerTop = this.headerFromTop.value;
            if (headerTop > this.headerFromTop.max) {
                headerTop = this.headerFromTop.max;
            }
            this.documentEditor.selection.sectionFormat.headerDistance = headerTop;
        }
    };
    HeaderFooterProperties.prototype.onHeaderValue = function (e) {
        var _this = this;
        if (e.keyCode === 13) {
            setTimeout(function () {
                _this.changeHeaderValue();
                _this.isHeaderTopApply = false;
            }, 30);
        }
    };
    HeaderFooterProperties.prototype.onFooterValue = function (e) {
        var _this = this;
        if (e.keyCode === 13) {
            setTimeout(function () {
                _this.changeFooterValue();
                _this.isFooterTopApply = false;
            }, 30);
        }
    };
    HeaderFooterProperties.prototype.changeFooterValue = function () {
        if (!this.isFooterTopApply) {
            return;
        }
        if (!this.documentEditor.isReadOnly) {
            var footerTop = this.footerFromTop.value;
            if (footerTop > this.footerFromTop.max) {
                footerTop = this.footerFromTop.max;
            }
            this.documentEditor.selection.sectionFormat.footerDistance = footerTop;
        }
    };
    HeaderFooterProperties.prototype.onSelectionChange = function () {
        this.headerFromTop.value = this.documentEditor.selection.sectionFormat.headerDistance;
        this.footerFromTop.value = this.documentEditor.selection.sectionFormat.footerDistance;
        if (this.documentEditor.selection.sectionFormat.differentFirstPage) {
            this.firstPage.checked = true;
        }
        else {
            this.firstPage.checked = false;
        }
        if (this.documentEditor.selection.sectionFormat.differentOddAndEvenPages) {
            this.oddOrEven.checked = true;
        }
        else {
            this.oddOrEven.checked = false;
        }
    };
    HeaderFooterProperties.prototype.destroy = function () {
        if (this.headerFromTop) {
            this.headerFromTop.destroy();
            this.headerFromTop = undefined;
        }
        if (this.footerFromTop) {
            this.footerFromTop.destroy();
            this.footerFromTop = undefined;
        }
    };
    return HeaderFooterProperties;
}());
export { HeaderFooterProperties };
