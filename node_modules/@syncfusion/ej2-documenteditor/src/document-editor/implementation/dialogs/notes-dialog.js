import { NumericTextBox } from '@syncfusion/ej2-inputs';
import { L10n, createElement, isNullOrUndefined } from '@syncfusion/ej2-base';
import { DropDownList } from '@syncfusion/ej2-dropdowns';
import { WSectionFormat } from '../format/section-format';
/**
 * The notes dialog is used to insert footnote.
 */
var NotesDialog = /** @class */ (function () {
    /**
     * @param {DocumentHelper} documentHelper - Specifies the document helper.
     * @private
     */
    function NotesDialog(documentHelper) {
        var _this = this;
        this.list = undefined;
        /**
         * @private
         */
        this.noteNumberFormat = undefined;
        this.sectionFormat = undefined;
        /**
         * @private
         * @returns {void}
         */
        this.onCancelButtonClick = function () {
            _this.documentHelper.dialog.hide();
            _this.documentHelper.updateFocus();
            _this.unWireEventsAndBindings();
        };
        /**
         * @private
         * @returns {void}
         */
        this.loadFontDialog = function () {
            _this.documentHelper.updateFocus();
            var format;
            var section;
            if (_this.sectionFormat) {
                section = _this.sectionFormat;
            }
            else {
                section = _this.documentHelper.owner.selection.sectionFormat;
            }
            if (_this.documentHelper.selection.isinFootnote) {
                var footnotesFormat = section.footNoteNumberFormat;
                var startAt = section.initialFootNoteNumber;
                format = _this.reversetype(footnotesFormat);
                _this.notesList.value = format;
                _this.startValueTextBox.value = startAt;
            }
            else {
                var endnotesFormat = section.endnoteNumberFormat;
                format = _this.reversetype(endnotesFormat);
                var startAt = section.initialEndNoteNumber;
                _this.notesList.value = format;
                _this.startValueTextBox.value = startAt;
            }
        };
        /**
         * @private
         * @returns {void}
         */
        this.onInsertFootnoteClick = function () {
            var format = new WSectionFormat(undefined);
            if (!isNullOrUndefined(_this.notesList)) {
                var formats = (_this.notesList.value).toString();
                var renderFormat = _this.types(formats);
                var startValue = _this.startValueTextBox.value;
                if (!isNullOrUndefined(_this.notesList)) {
                    if (_this.documentHelper.selection.isinFootnote) {
                        format.footNoteNumberFormat = renderFormat;
                        format.footNoteNumberFormat = renderFormat;
                        format.initialFootNoteNumber = startValue;
                        _this.documentHelper.owner.editorModule.onApplySectionFormat(undefined, format);
                    }
                    else {
                        format.endnoteNumberFormat = renderFormat;
                        format.endnoteNumberFormat = renderFormat;
                        format.initialEndNoteNumber = startValue;
                        _this.documentHelper.owner.editorModule.onApplySectionFormat(undefined, format);
                    }
                }
            }
            _this.documentHelper.hideDialog();
        };
        /**
         * @private
         * @returns {void}
         */
        this.unWireEventsAndBindings = function () {
            _this.notesList.value = undefined;
        };
        this.documentHelper = documentHelper;
    }
    NotesDialog.prototype.getModuleName = function () {
        return 'FootNotesDialog';
    };
    /**
     * @private
     * @param {L10n} localValue - Specifies the locale value
     * @param {boolean} isRtl - Specifies the is rtl
     * @returns {void}
     */
    NotesDialog.prototype.notesDialog = function (localValue, isRtl) {
        var idName = this.documentHelper.owner.containerId + '_insert_Footnote';
        this.target = createElement('div', { id: idName, className: 'e-de-insert-footnote' });
        var firstDiv = createElement('div');
        var container = createElement('div', {
            className: 'e-de-insert-footnote-dlg-sub-header', innerHTML: localValue.getConstant('Start at')
        });
        var startatValue = createElement('div');
        this.footCount = createElement('input', {
            attrs: { type: 'text' }, id: this.documentHelper.owner.containerId + 'row'
        });
        startatValue.appendChild(this.footCount);
        var numberformat = createElement('div', {
            className: 'e-de-insert-footnote-dlg-sub-header', innerHTML: localValue.getConstant('Number format')
        });
        var numberFormatDiv = createElement('div', { className: 'e-de-insert-footnote-dlg-header' });
        var formatType = createElement('select', {
            id: this.target.id + '_papersize', styles: 'padding-bottom: 20px;',
            innerHTML: '<option value="1, 2, 3, ...">' + localValue.getConstant('1, 2, 3, ...') +
                '</option><option value="a, b, c, ...">' + localValue.getConstant('a, b, c, ...') +
                '</option><option value="A, B, C, ...">' + localValue.getConstant('A, B, C, ...') +
                '</option><option value="I, II, III, ...">' + localValue.getConstant('I, II, III, ...') +
                '</option><option value="i, ii, iii, ...">' + localValue.getConstant('i, ii, iii, ...') + '</option>'
        });
        numberFormatDiv.appendChild(formatType);
        this.notesList = new DropDownList({ enableRtl: isRtl });
        this.notesList.appendTo(formatType);
        firstDiv.appendChild(numberformat);
        firstDiv.appendChild(numberFormatDiv);
        firstDiv.appendChild(container);
        firstDiv.appendChild(startatValue);
        this.target.appendChild(firstDiv);
        this.startValueTextBox = new NumericTextBox({
            format: '#',
            min: 1,
            max: 99999,
            enablePersistence: false
        });
        this.startValueTextBox.appendTo(this.footCount);
    };
    /**
     * @private
     * @returns {void}
     */
    NotesDialog.prototype.show = function () {
        var localValue = new L10n('documenteditor', this.documentHelper.owner.defaultLocale);
        localValue.setLocale(this.documentHelper.owner.locale);
        if (!this.target) {
            this.notesDialog(localValue);
        }
        if (this.documentHelper.selection.caret.style.display !== 'none') {
            this.documentHelper.selection.caret.style.display = 'none';
        }
        //let footType: any = this.documentHelper.selection.startInternal.currentWidget.paragraph.containerWidget;
        if (this.documentHelper.selection.isinFootnote) {
            this.documentHelper.dialog.header = localValue.getConstant('Footnote');
        }
        else {
            this.documentHelper.dialog.header = localValue.getConstant('Endnote');
        }
        this.documentHelper.dialog.height = 'auto';
        this.documentHelper.dialog.width = 'auto';
        this.documentHelper.dialog.content = this.target;
        this.documentHelper.dialog.beforeOpen = this.loadFontDialog;
        this.documentHelper.dialog.buttons = [{
                click: this.onInsertFootnoteClick,
                buttonModel: { content: localValue.getConstant('Apply'), cssClass: 'e-flat e-table-ok', isPrimary: true }
            },
            {
                click: this.onCancelButtonClick,
                buttonModel: { content: localValue.getConstant('Cancel'), cssClass: 'e-flat e-table-cancel' }
            }];
        this.startValueTextBox.value = 1;
        this.documentHelper.dialog.close = this.documentHelper.updateFocus;
        this.documentHelper.dialog.dataBind();
        this.documentHelper.dialog.show();
        if (this.documentHelper.selection.isinEndnote) {
            var alignValue = this.endnoteListValue(this.list);
            this.notesList.index = alignValue;
        }
    };
    NotesDialog.prototype.types = function (type) {
        switch (type) {
            case '1, 2, 3, ...':
                return 'Arabic';
            case 'A, B, C, ...':
                return 'UpperCaseLetter';
            case 'a, b, c, ...':
                return 'LowerCaseLetter';
            case 'I, II, III, ...':
                return 'LowerCaseRoman';
            case 'i, ii, iii, ...':
                return 'UpperCaseRoman';
            default:
                return 'Arabic';
        }
    };
    NotesDialog.prototype.reversetype = function (type) {
        switch (type) {
            case 'Arabic':
                return '1, 2, 3, ...';
            case 'UpperCaseLetter':
                return 'A, B, C, ...';
            case 'LowerCaseLetter':
                return 'a, b, c, ...';
            case 'UpperCaseRoman':
                return 'I, II, III, ...';
            case 'LowerCaseRoman':
                return 'i, ii, iii, ...';
            default:
                return '1, 2, 3, ...';
        }
    };
    // eslint-disable-next-line
    NotesDialog.prototype.endnoteListValue = function (listFocus) {
        var value;
        if (listFocus === 'A, B, C, ...') {
            value = 0;
        }
        else if (listFocus === '1, 2, 3, ...') {
            value = 1;
        }
        else if (listFocus === 'a, b, c, ...') {
            value = 2;
        }
        else {
            value = 3;
        }
        //  else {
        //     value = 4;
        // }
        return value;
    };
    /**
     * @private
     * @returns {void}
     */
    NotesDialog.prototype.destroy = function () {
        if (this.footCount) {
            if (this.footCount.parentElement) {
                this.footCount.parentElement.removeChild(this.footCount);
            }
            this.footCount = undefined;
        }
        if (this.startValueTextBox) {
            this.startValueTextBox.destroy();
            this.startValueTextBox = undefined;
        }
        if (this.notesList) {
            this.notesList.destroy();
            this.notesList = undefined;
        }
        this.footCount = undefined;
    };
    return NotesDialog;
}());
export { NotesDialog };
