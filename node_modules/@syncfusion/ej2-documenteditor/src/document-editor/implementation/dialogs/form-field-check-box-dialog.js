import { createElement, L10n, isNullOrUndefined } from '@syncfusion/ej2-base';
import { RadioButton, CheckBox } from '@syncfusion/ej2-buttons';
import { FieldElementBox, CheckBoxFormField } from '../viewer/page';
import { NumericTextBox } from '@syncfusion/ej2-inputs';
/**
 * Form field checkbox dialog is used to modify the value in checkbox form field.
 */
var CheckBoxFormFieldDialog = /** @class */ (function () {
    /**
     * @param {DocumentHelper} owner - Specifies the document helper.
     * @private
     */
    function CheckBoxFormFieldDialog(owner) {
        var _this = this;
        /**
         * @private
         * @param {ChangeArgs} event - Specifies the event args.
         * @returns {void}
         */
        this.changeBidirectional = function (event) {
            if (event.value === 'exact') {
                _this.autoButton.checked = !_this.exactButton.checked;
                _this.exactlyNumber.enabled = true;
            }
            else {
                _this.exactButton.checked = !_this.autoButton.checked;
                _this.exactlyNumber.enabled = false;
            }
        };
        /**
         * @private
         * @param {ChangeArgs} event - Specifies the event args.
         * @returns {void}
         */
        this.changeBidirect = function (event) {
            if (event.value === 'check') {
                _this.notCheckedButton.checked = !_this.checkedButton.checked;
            }
            else {
                _this.checkedButton.checked = !_this.notCheckedButton.checked;
            }
        };
        /**
         * @private
         * @returns {void}
         */
        this.onCancelButtonClick = function () {
            _this.documentHelper.dialog.hide();
        };
        /**
         * @private
         * @returns {void}
         */
        this.insertCheckBoxField = function () {
            _this.closeCheckBoxField();
            var checkBoxField = new CheckBoxFormField();
            checkBoxField.defaultValue = _this.checkedButton.checked;
            checkBoxField.name = _this.bookmarkInputText.value;
            checkBoxField.helpText = _this.tooltipInputText.value;
            checkBoxField.checked = checkBoxField.defaultValue;
            checkBoxField.enabled = _this.checBoxEnableElement.checked;
            if (_this.exactButton.checked) {
                checkBoxField.sizeType = 'Exactly';
                checkBoxField.size = _this.exactlyNumber.value;
            }
            else {
                checkBoxField.sizeType = 'Auto';
                checkBoxField.size = 11;
            }
            _this.owner.editor.editFormField('CheckBox', checkBoxField);
        };
        /**
         * @private
         * @returns {void}
         */
        this.closeCheckBoxField = function () {
            _this.documentHelper.dialog.hide();
            _this.documentHelper.dialog.element.style.pointerEvents = '';
        };
        this.owner = owner;
    }
    Object.defineProperty(CheckBoxFormFieldDialog.prototype, "documentHelper", {
        get: function () {
            return this.owner.documentHelper;
        },
        enumerable: true,
        configurable: true
    });
    CheckBoxFormFieldDialog.prototype.getModuleName = function () {
        return 'CheckBoxFormFieldDialog';
    };
    /* eslint-disable */
    /**
     * @private
     * @param {L10n} locale - Specifies the locale.
     * @param {boolean} isRtl - Specifies is rtl.
     * @returns {void}
     */
    CheckBoxFormFieldDialog.prototype.initCheckBoxDialog = function (localValue, isRtl) {
        this.target = createElement('div');
        var dialogDiv = createElement('div');
        var headingLabel = createElement('div', {
            className: 'e-de-ff-dlg-heading',
            innerHTML: localValue.getConstant('Check box size')
        });
        var autoDiv = createElement('div', { className: 'e-de-ff-radio-scnd-div' });
        var exactDiv = createElement('div', { className: 'e-de-ff-radio-scnd-div' });
        var autoEle = createElement('input', { className: 'e-de-rtl-btn-div' });
        var exactEle = createElement('input', { className: 'e-de-rtl-btn-div' });
        this.autoButton = new RadioButton({
            label: localValue.getConstant('Auto'), cssClass: 'e-small', change: this.changeBidirectional, checked: true,
            enableRtl: isRtl
        });
        this.exactButton = new RadioButton({
            label: localValue.getConstant('Exactly'), value: 'exact', cssClass: 'e-small', change: this.changeBidirectional,
            enableRtl: isRtl
        });
        this.exactNumberDiv = createElement('div', { className: 'e-de-ff-chck-exact' });
        var exactNumber = createElement('input', { attrs: { 'type': 'text' } });
        this.exactlyNumber = new NumericTextBox({
            format: 'n', value: 10, min: 1, max: 1584, enablePersistence: false, enabled: false, cssClass: 'e-de-check-exactnumbr-width',
            enableRtl: isRtl
        });
        var defaultValueLabel = createElement('div', {
            className: 'e-de-ff-dlg-heading',
            innerHTML: localValue.getConstant('Default value')
        });
        var notcheckDiv = createElement('div', { className: 'e-de-ff-radio-div' });
        var checkDiv = createElement('div', { className: 'e-de-ff-radio-div' });
        var notcheckEle = createElement('input', { className: 'e-de-rtl-btn-div' });
        var checkEle = createElement('input', { className: 'e-de-rtl-btn-div' });
        this.notCheckedButton = new RadioButton({
            label: localValue.getConstant('Not checked'), enableRtl: isRtl, cssClass: 'e-small', change: this.changeBidirect
        });
        this.checkedButton = new RadioButton({
            label: localValue.getConstant('Checked'), value: 'check', enableRtl: isRtl, cssClass: 'e-small',
            change: this.changeBidirect, checked: true
        });
        var fieldSettingsLabel = createElement('div', {
            className: 'e-de-ff-dlg-heading',
            innerHTML: localValue.getConstant('Field settings')
        });
        var settingsTotalDiv = createElement('div', { className: 'e-de-div-seperate-dlg' });
        var totalToolTipDiv = createElement('div', { className: 'e-de-ff-dlg-lft-hlf' });
        var totalBookmarkDiv = createElement('div', { className: 'e-de-ff-dlg-rght-hlf' });
        var toolTipLabelHeading = createElement('div', {
            className: 'e-de-ff-dlg-heading-small',
            innerHTML: localValue.getConstant('Tooltip')
        });
        this.tooltipInputText = createElement('input', { className: 'e-input e-bookmark-textbox-input' });
        var bookmarkLabelHeading = createElement('div', {
            className: 'e-de-ff-dlg-heading-small',
            innerHTML: localValue.getConstant('Name')
        });
        this.bookmarkInputText = createElement('input', { className: 'e-input e-bookmark-textbox-input' });
        var checkBoxEnableDiv = createElement('div');
        var checBoxEnableEle = createElement('input', { attrs: { type: 'checkbox' } });
        this.checBoxEnableElement = new CheckBox({
            cssClass: 'e-de-ff-dlg-check',
            label: localValue.getConstant('Check box enabled'),
            enableRtl: isRtl
        });
        if (isRtl) {
            autoDiv.classList.add('e-de-rtl');
            exactDiv.classList.add('e-de-rtl');
            this.exactNumberDiv.classList.add('e-de-rtl');
            notcheckDiv.classList.add('e-de-rtl');
            checkDiv.classList.add('e-de-rtl');
            totalToolTipDiv.classList.add('e-de-rtl');
            totalBookmarkDiv.classList.add('e-de-rtl');
        }
        this.target.appendChild(dialogDiv);
        dialogDiv.appendChild(defaultValueLabel);
        dialogDiv.appendChild(notcheckDiv);
        notcheckDiv.appendChild(notcheckEle);
        this.notCheckedButton.appendTo(notcheckEle);
        dialogDiv.appendChild(checkDiv);
        checkDiv.appendChild(checkEle);
        this.checkedButton.appendTo(checkEle);
        dialogDiv.appendChild(headingLabel);
        dialogDiv.appendChild(autoDiv);
        autoDiv.appendChild(autoEle);
        this.autoButton.appendTo(autoEle);
        dialogDiv.appendChild(exactDiv);
        exactDiv.appendChild(exactEle);
        this.exactButton.appendTo(exactEle);
        exactDiv.appendChild(this.exactNumberDiv);
        this.exactNumberDiv.appendChild(exactNumber);
        this.exactlyNumber.appendTo(exactNumber);
        dialogDiv.appendChild(fieldSettingsLabel);
        dialogDiv.appendChild(settingsTotalDiv);
        settingsTotalDiv.appendChild(totalToolTipDiv);
        settingsTotalDiv.appendChild(totalBookmarkDiv);
        totalToolTipDiv.appendChild(toolTipLabelHeading);
        totalToolTipDiv.appendChild(this.tooltipInputText);
        totalBookmarkDiv.appendChild(bookmarkLabelHeading);
        totalBookmarkDiv.appendChild(this.bookmarkInputText);
        dialogDiv.appendChild(checkBoxEnableDiv);
        checkBoxEnableDiv.appendChild(checBoxEnableEle);
        this.checBoxEnableElement.appendTo(checBoxEnableEle);
    };
    /**
     * @private
     * @returns {void}
     */
    CheckBoxFormFieldDialog.prototype.show = function () {
        var localObj = new L10n('documenteditor', this.documentHelper.owner.defaultLocale);
        localObj.setLocale(this.documentHelper.owner.locale);
        if (isNullOrUndefined(this.target)) {
            this.initCheckBoxDialog(localObj, this.documentHelper.owner.enableRtl);
        }
        this.loadCheckBoxDialog();
        this.documentHelper.dialog.header = localObj.getConstant('Check Box Form Field');
        this.documentHelper.dialog.position = { X: 'center', Y: 'center' };
        this.documentHelper.dialog.height = 'auto';
        this.documentHelper.dialog.width = '400px';
        this.documentHelper.dialog.content = this.target;
        this.documentHelper.dialog.buttons = [{
                click: this.insertCheckBoxField,
                buttonModel: { content: localObj.getConstant('Ok'), cssClass: 'e-flat e-table-cell-margin-okay', isPrimary: true }
            },
            {
                click: this.onCancelButtonClick,
                buttonModel: { content: localObj.getConstant('Cancel'), cssClass: 'e-flat e-table-cell-margin-cancel' }
            }];
        this.documentHelper.dialog.show();
    };
    /**
     * @private
     * @returns {void}
     */
    CheckBoxFormFieldDialog.prototype.loadCheckBoxDialog = function () {
        var inline = this.owner.selection.getCurrentFormField();
        if (inline instanceof FieldElementBox) {
            this.fieldBegin = inline;
            var fieldData = this.fieldBegin.formFieldData;
            if (!fieldData.defaultValue) {
                this.checkedButton.checked = false;
                this.notCheckedButton.checked = true;
            }
            else {
                this.checkedButton.checked = true;
                this.notCheckedButton.checked = false;
            }
            if (fieldData.sizeType !== 'Auto') {
                this.exactButton.checked = true;
                this.autoButton.checked = false;
                this.exactlyNumber.enabled = true;
            }
            else {
                this.autoButton.checked = true;
                this.exactButton.checked = false;
                this.exactlyNumber.enabled = false;
            }
            if (fieldData.size) {
                this.exactlyNumber.value = fieldData.size;
            }
            if (fieldData.enabled) {
                this.checBoxEnableElement.checked = true;
            }
            else {
                this.checBoxEnableElement.checked = false;
            }
            if (fieldData.name && fieldData.name !== '') {
                this.bookmarkInputText.value = fieldData.name;
            }
            else {
                this.bookmarkInputText.value = '';
            }
            if (fieldData.helpText && fieldData.helpText !== '') {
                this.tooltipInputText.value = fieldData.helpText;
            }
            else {
                this.tooltipInputText.value = '';
            }
        }
    };
    /**
     * @private
     * @returns {void}
     */
    CheckBoxFormFieldDialog.prototype.destroy = function () {
        var checkBoxDialogTarget = this.target;
        if (checkBoxDialogTarget) {
            if (checkBoxDialogTarget.parentElement) {
                checkBoxDialogTarget.parentElement.removeChild(checkBoxDialogTarget);
            }
            this.target = undefined;
        }
        this.owner = undefined;
        if (this.autoButton) {
            this.autoButton.destroy();
            this.autoButton = undefined;
        }
        if (this.exactButton) {
            this.exactButton.destroy();
            this.exactButton = undefined;
        }
        if (this.notCheckedButton) {
            this.notCheckedButton.destroy();
            this.notCheckedButton = undefined;
        }
        if (this.checkedButton) {
            this.checkedButton.destroy();
            this.checkedButton = undefined;
        }
        this.bookmarkInputText = undefined;
        this.tooltipInputText = undefined;
        if (this.checBoxEnableElement) {
            this.checBoxEnableElement.destroy();
            this.checBoxEnableElement = undefined;
        }
        if (this.exactlyNumber) {
            this.exactlyNumber.destroy();
            this.exactlyNumber = undefined;
        }
        this.exactNumberDiv = undefined;
    };
    return CheckBoxFormFieldDialog;
}());
export { CheckBoxFormFieldDialog };
