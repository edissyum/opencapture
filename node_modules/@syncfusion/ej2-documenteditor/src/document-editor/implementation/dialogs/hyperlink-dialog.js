import { createElement, isNullOrUndefined, L10n } from '@syncfusion/ej2-base';
import { DropDownList } from '@syncfusion/ej2-dropdowns';
import { CheckBox } from '@syncfusion/ej2-buttons';
/**
 * The Hyperlink dialog is used to insert or edit hyperlink at selection.
 */
/* eslint-disable max-len */
var HyperlinkDialog = /** @class */ (function () {
    /**
     * @param {DocumentHelper} documentHelper - Specifies the document helper.
     * @private
     */
    function HyperlinkDialog(documentHelper) {
        var _this = this;
        this.displayText = '';
        this.navigationUrl = undefined;
        this.bookmarkDropdown = undefined;
        this.bookmarkCheckbox = undefined;
        this.bookmarks = [];
        /**
         * @private
         * @param {KeyboardEvent} event - Specifies the event args.
         * @returns {void}
         */
        this.onKeyUpOnUrlBox = function (event) {
            if (event.keyCode === 13) {
                if (_this.displayTextBox.value !== '' && _this.urlTextBox.value !== '') {
                    _this.onInsertHyperlink();
                }
                return;
            }
            //const selectedText: string = this.documentHelper.selection.text;
            var urlValue = _this.urlTextBox.value;
            if (urlValue.substring(0, 4).toLowerCase() === 'www.') {
                _this.urlTextBox.value = 'http://' + urlValue;
            }
            if (_this.displayText === '') {
                _this.displayTextBox.value = urlValue;
            }
            _this.enableOrDisableInsertButton();
        };
        /**
         * @private
         * @returns {void}
         */
        this.onKeyUpOnDisplayBox = function () {
            _this.displayText = _this.displayTextBox.value;
            _this.enableOrDisableInsertButton();
        };
        /**
         * @private
         * @returns {void}
         */
        this.onInsertButtonClick = function () {
            _this.onInsertHyperlink();
        };
        /**
         * @private
         * @returns {void}
         */
        this.onCancelButtonClick = function () {
            _this.documentHelper.dialog.hide();
            _this.clearValue();
            _this.documentHelper.updateFocus();
        };
        /**
         * @private
         * @returns {void}
         */
        this.loadHyperlinkDialog = function () {
            _this.documentHelper.updateFocus();
            _this.bookmarks = [];
            for (var i = 0; i < _this.documentHelper.bookmarks.keys.length; i++) {
                var bookmark = _this.documentHelper.bookmarks.keys[i];
                if (bookmark.indexOf('_') !== 0) {
                    _this.bookmarks.push(bookmark);
                }
            }
            var fieldBegin = _this.documentHelper.selection.getHyperlinkField();
            if (!isNullOrUndefined(fieldBegin)) {
                if (!isNullOrUndefined(fieldBegin.fieldSeparator)) {
                    var format = undefined;
                    var fieldObj = _this.documentHelper.selection.getHyperlinkDisplayText(fieldBegin.fieldSeparator.line.paragraph, fieldBegin.fieldSeparator, fieldBegin.fieldEnd, false, format);
                    _this.displayText = fieldObj.displayText;
                    _this.displayTextBox.disabled = fieldObj.isNestedField;
                }
                _this.displayTextBox.value = _this.displayText;
                var link = _this.documentHelper.selection.getLinkText(fieldBegin);
                _this.urlTextBox.value = _this.navigationUrl = link;
                _this.documentHelper.dialog.header = _this.localObj.getConstant('Edit Hyperlink');
            }
            else {
                _this.displayText = _this.documentHelper.selection.getText(true);
                if (_this.displayText !== '') {
                    if (_this.displayText.indexOf(String.fromCharCode(65532)) !== -1 ||
                        _this.displayText.indexOf('\r') !== -1 && (_this.displayText.lastIndexOf('\r') !== -1 &&
                            _this.displayText.slice(0, -1).indexOf('\r') !== -1)) {
                        _this.displayTextBox.value = '<<Selection in document>>';
                        _this.displayTextBox.disabled = true;
                    }
                    else {
                        _this.displayTextBox.value = _this.displayText;
                    }
                }
            }
            _this.bookmarkDiv.style.display = 'none';
            _this.addressText.style.display = 'block';
            _this.urlTextBox.style.display = 'block';
            _this.bookmarkCheckbox.checked = false;
            _this.bookmarkDropdown.dataSource = _this.documentHelper.bookmarks.keys;
            _this.insertButton = document.getElementsByClassName('e-hyper-insert')[0];
            _this.enableOrDisableInsertButton();
            _this.urlTextBox.focus();
            if (_this.documentHelper.selection.caret.style.display !== 'none') {
                _this.documentHelper.selection.caret.style.display = 'none';
            }
        };
        /**
         * @private
         * @returns {void}
         */
        this.closeHyperlinkDialog = function () {
            _this.clearValue();
            _this.documentHelper.updateFocus();
        };
        /**
         * @private
         * @param {CheckBoxChangeArgs} args - Specifies the event args.
         * @returns {void}
         */
        this.onUseBookmarkChange = function (args) {
            if (args.checked) {
                _this.bookmarkDiv.style.display = 'block';
                _this.bookmarkDropdown.dataSource = _this.bookmarks;
                _this.addressText.style.display = 'none';
                _this.urlTextBox.style.display = 'none';
            }
            else {
                _this.bookmarkDiv.style.display = 'none';
                _this.addressText.style.display = 'block';
                _this.urlTextBox.style.display = 'block';
            }
        };
        /**
         * @private
         * @returns {void}
         */
        this.onBookmarkchange = function () {
            if (_this.bookmarkDropdown.value !== '') {
                _this.insertButton.disabled = false;
            }
        };
        this.documentHelper = documentHelper;
    }
    HyperlinkDialog.prototype.getModuleName = function () {
        return 'HyperlinkDialog';
    };
    /**
     * @private
     * @param {L10n} localValue - Specifies the locale value
     * @param {boolean} isRtl - Specifies the is rtl
     * @returns {void}
     */
    HyperlinkDialog.prototype.initHyperlinkDialog = function (localValue, isRtl) {
        var id = this.documentHelper.owner.containerId + '_insert_hyperlink';
        this.target = createElement('div', { id: id, className: 'e-de-hyperlink' });
        var container = createElement('div');
        var displayText = createElement('div', { className: 'e-de-hyperlink-dlg-title', innerHTML: localValue.getConstant('Text to display') });
        this.displayTextBox = createElement('input', { id: this.documentHelper.owner.containerId + '_display_text', className: 'e-input e-de-hyperlink-dlg-input' });
        this.displayTextBox.addEventListener('keyup', this.onKeyUpOnDisplayBox);
        container.appendChild(displayText);
        container.appendChild(this.displayTextBox);
        this.addressText = createElement('div', { className: 'e-de-hyperlink-dlg-title', innerHTML: localValue.getConstant('Address') });
        this.urlTextBox = createElement('input', { id: this.documentHelper.owner.containerId + '_url_text', className: 'e-input e-de-hyperlink-dlg-input', attrs: { autofocus: 'true' } });
        this.urlTextBox.addEventListener('input', this.onKeyUpOnUrlBox);
        this.urlTextBox.addEventListener('keyup', this.onKeyUpOnUrlBox);
        container.appendChild(this.addressText);
        container.appendChild(this.urlTextBox);
        this.bookmarkDiv = createElement('div', { styles: 'display:none;' });
        var bookmarkText = createElement('div', { className: 'e-de-hyperlink-dlg-title', innerHTML: localValue.getConstant('Bookmark') });
        var bookmarkTextElement = createElement('div', { className: 'e-de-hyperlink-dlg-bookmark' });
        var bookmarkValue = createElement('input', { id: 'e-de-hyperlink-dlg-bookmark-value' });
        bookmarkTextElement.appendChild(bookmarkValue);
        this.bookmarkDropdown = new DropDownList({ dataSource: [], change: this.onBookmarkchange, popupHeight: '230px', width: '230px', noRecordsTemplate: localValue.getConstant('No bookmarks found') });
        this.bookmarkDropdown.appendTo(bookmarkValue);
        this.bookmarkDiv.appendChild(bookmarkText);
        this.bookmarkDiv.appendChild(bookmarkTextElement);
        container.appendChild(this.bookmarkDiv);
        var bookmarkCheckDiv = createElement('div', { className: 'e-de-hyperlink-bookmark-check e-de-hyperlink-dlg-title' });
        var bookmarkCheck = createElement('input', { attrs: { type: 'checkbox' }, id: this.target.id + '_bookmark', className: this.target.id + '_bookmarkcheck' });
        bookmarkCheckDiv.appendChild(bookmarkCheck);
        this.bookmarkCheckbox = new CheckBox({
            label: localValue.getConstant('Use bookmarks'),
            enableRtl: isRtl, change: this.onUseBookmarkChange
        });
        this.bookmarkCheckbox.appendTo(bookmarkCheck);
        container.appendChild(bookmarkCheckDiv);
        this.target.appendChild(container);
    };
    /**
     * @private
     * @returns {void}
     */
    HyperlinkDialog.prototype.show = function () {
        this.localObj = new L10n('documenteditor', this.documentHelper.owner.defaultLocale);
        this.localObj.setLocale(this.documentHelper.owner.locale);
        if (!this.target) {
            this.initHyperlinkDialog(this.localObj, this.documentHelper.owner.enableRtl);
        }
        this.documentHelper.dialog.header = this.localObj.getConstant('Insert Hyperlink');
        this.documentHelper.dialog.height = 'auto';
        this.documentHelper.dialog.width = 'auto';
        this.documentHelper.dialog.content = this.target;
        this.documentHelper.dialog.buttons = [{
                click: this.onInsertButtonClick,
                buttonModel: { content: this.localObj.getConstant('Ok'), cssClass: 'e-flat e-hyper-insert', isPrimary: true }
            },
            {
                click: this.onCancelButtonClick,
                buttonModel: { content: this.localObj.getConstant('Cancel'), cssClass: 'e-flat e-hyper-cancel' }
            }];
        this.documentHelper.dialog.dataBind();
        this.documentHelper.dialog.beforeOpen = this.loadHyperlinkDialog;
        this.documentHelper.dialog.close = this.closeHyperlinkDialog;
        this.documentHelper.dialog.show();
    };
    /**
     * @private
     * @returns {void}
     */
    HyperlinkDialog.prototype.hide = function () {
        this.closeHyperlinkDialog();
    };
    HyperlinkDialog.prototype.enableOrDisableInsertButton = function () {
        if (!isNullOrUndefined(this.insertButton)) {
            this.insertButton.disabled = (this.urlTextBox.value === '' || this.displayTextBox.value === '');
        }
    };
    /**
     * @private
     * @returns {void}
     */
    HyperlinkDialog.prototype.onInsertHyperlink = function () {
        var displayText = this.displayTextBox.value.trim();
        var address = this.urlTextBox.value.trim();
        var isBookmark = false;
        if (!isNullOrUndefined(this.bookmarkDropdown.value) && this.bookmarkDropdown.value !== '') {
            address = this.bookmarkDropdown.value;
            isBookmark = true;
        }
        if (address === '') {
            this.documentHelper.hideDialog();
            return;
        }
        if (displayText === '' && address !== '') {
            displayText = address;
        }
        else {
            displayText = this.displayTextBox.value;
        }
        if (!isNullOrUndefined(this.navigationUrl)) {
            this.documentHelper.owner.editorModule.editHyperlink(this.documentHelper.selection, address, displayText, isBookmark);
        }
        else {
            var remove = (this.documentHelper.selection.text !== displayText ||
                this.documentHelper.selection.text.indexOf('\r') === -1) && !this.displayTextBox.disabled;
            this.documentHelper.owner.editorModule.insertHyperlinkInternal(address, displayText, remove, isBookmark);
        }
        this.documentHelper.hideDialog();
        this.navigationUrl = undefined;
    };
    /**
     * @private
     * @returns {void}
     */
    HyperlinkDialog.prototype.clearValue = function () {
        this.displayTextBox.value = '';
        this.urlTextBox.value = '';
        this.displayText = '';
        this.displayTextBox.disabled = false;
        this.bookmarks = [];
    };
    /**
     * @private
     * @returns {void}
     */
    HyperlinkDialog.prototype.destroy = function () {
        if (this.displayTextBox) {
            this.displayTextBox.innerHTML = '';
            this.displayTextBox = undefined;
        }
        if (this.urlTextBox) {
            this.urlTextBox.parentElement.removeChild(this.urlTextBox);
            this.urlTextBox = undefined;
        }
        this.documentHelper = undefined;
        if (!isNullOrUndefined(this.target)) {
            if (this.target.parentElement) {
                this.target.parentElement.removeChild(this.target);
            }
            this.target.innerHTML = '';
            this.target = undefined;
        }
    };
    return HyperlinkDialog;
}());
export { HyperlinkDialog };
