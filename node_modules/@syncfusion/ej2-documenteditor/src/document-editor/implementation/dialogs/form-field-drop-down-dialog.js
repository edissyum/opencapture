import { createElement, L10n, isNullOrUndefined } from '@syncfusion/ej2-base';
import { CheckBox, Button } from '@syncfusion/ej2-buttons';
import { FieldElementBox, DropDownFormField } from '../viewer/page';
import { ListView } from '@syncfusion/ej2-lists';
/**
 * Form field drop-down dialog is used to modify the value in drop-down form field.
 */
var DropDownFormFieldDialog = /** @class */ (function () {
    function DropDownFormFieldDialog(owner) {
        var _this = this;
        /**
         * @private
         * @returns {void}
         */
        this.addItemtoList = function () {
            _this.dropDownItems.push(_this.drpDownItemsInput.value);
            _this.currentSelectedItem = _this.drpDownItemsInput.value;
            _this.drpDownItemsInput.value = '';
            _this.enableOrDisableButton();
            _this.updateList();
        };
        /**
         * @private
         * @returns {void}
         */
        this.removeItemFromList = function () {
            for (var i = 0; i < _this.dropDownItems.length; i++) {
                if (_this.dropDownItems[i] === _this.currentSelectedItem) {
                    _this.dropDownItems.splice(i, 1);
                }
            }
            _this.updateList();
        };
        /**
         * @private
         * @returns {void}
         */
        this.selectHandler = function (args) {
            _this.currentSelectedItem = args.text;
        };
        /**
         * @private
         * @returns {void}
         */
        this.moveUpItem = function () {
            var index = _this.getSelectedIndex();
            _this.moveUp(index, (index - 1));
            _this.updateList();
        };
        /**
         * @private
         * @returns {void}
         */
        this.moveDownItem = function () {
            var index = _this.getSelectedIndex();
            _this.moveDown(index, (index + 1));
            _this.updateList();
        };
        /**
         * @private
         * @returns {void}
         */
        this.onKeyUpOnTextBox = function () {
            _this.enableOrDisableButton();
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
        this.insertDropDownField = function () {
            var dropDownField = new DropDownFormField();
            dropDownField.dropdownItems = _this.dropDownItems;
            dropDownField.selectedIndex = 0;
            dropDownField.name = _this.bookmarkInput.value;
            dropDownField.helpText = _this.tooltipInput.value;
            dropDownField.enabled = _this.dropDownEnable.checked;
            _this.owner.editor.editFormField('DropDown', dropDownField);
            _this.closeDropDownField();
        };
        /**
         * @private
         * @returns {void}
         */
        this.closeDropDownField = function () {
            _this.documentHelper.dialog.hide();
            _this.documentHelper.dialog.element.style.pointerEvents = '';
        };
        this.owner = owner;
    }
    Object.defineProperty(DropDownFormFieldDialog.prototype, "documentHelper", {
        get: function () {
            return this.owner.documentHelper;
        },
        enumerable: true,
        configurable: true
    });
    DropDownFormFieldDialog.prototype.getModuleName = function () {
        return 'DropDownFormFieldDialog';
    };
    /* eslint-disable  */
    /**
     * @private
     * @param {L10n} localValue - Specifies the locale value
     * @param {boolean} isRtl - Specifies the is rtl
     * @returns {void}
     */
    DropDownFormFieldDialog.prototype.initTextDialog = function (localValue, isRtl) {
        this.target = createElement('div');
        var dialogDiv = createElement('div');
        var firstDiv = createElement('div', { className: 'e-de-drp-dwn-frst-div' });
        var drpDownItemsLabel = createElement('div', {
            className: 'e-de-ff-dlg-heading-small',
            innerHTML: localValue.getConstant('Drop-down items')
        });
        this.drpDownItemsInput = createElement('input', {
            className: 'e-input e-bookmark-textbox-input',
            id: 'fielditems_text_box'
        });
        this.drpDownItemsInput.addEventListener('keyup', this.onKeyUpOnTextBox);
        var secondDiv = createElement('div', { className: 'e-de-ff-drpdwn-dlg-scndiv' });
        var itemsDrpItemsLabel = createElement('div', {
            className: 'e-de-ff-dlg-drpdwn-heading',
            innerHTML: localValue.getConstant('Items in drop-down list')
        });
        var listviewDiv = createElement('div', {
            className: 'e-bookmark-listViewDiv e-de-ff-drpdwn-listview',
            attrs: { style: 'height:100%' }
        });
        this.listviewInstance = new ListView({
            cssClass: 'e-bookmark-listview',
            select: this.selectHandler
        });
        var buttonDiv = createElement('div');
        var addButtonDiv = createElement('div', { className: 'e-bookmark-addbutton' });
        var addButtonEle = createElement('button', {
            innerHTML: localValue.getConstant('ADD'),
            attrs: { type: 'button', style: 'height:36px;width:100%' }
        });
        this.addButton = new Button({ cssClass: 'e-button-custom' });
        this.addButton.disabled = true;
        addButtonEle.addEventListener('click', this.addItemtoList.bind(this));
        var editButtonDiv = createElement('div', { className: 'e-bookmark-addbutton' });
        editButtonDiv.style.display = 'none';
        var editButtonEle = createElement('button', {
            innerHTML: 'EDIT',
            attrs: { type: 'button', style: 'height:36px;width:100%' }
        });
        this.editButton = new Button({ cssClass: 'e-button-custom' });
        var removeButtonDiv = createElement('div', { className: 'e-bookmark-addbutton' });
        var removeButtonEle = createElement('button', {
            innerHTML: localValue.getConstant('REMOVE'),
            attrs: { type: 'button', style: 'height:36px;width:100%' }
        });
        this.removeButton = new Button({ cssClass: 'e-button-custom' });
        removeButtonEle.addEventListener('click', this.removeItemFromList.bind(this));
        var moveBtnDiv = createElement('div', { attrs: { style: 'display:inline-flex' } });
        var moveUpButtonDiv = createElement('div', { className: 'e-bookmark-addbutton' });
        var moveUpButtonEle = createElement('button', {
            attrs: { type: 'button', style: 'height:36px;width:36px' },
            className: 'e-de-ff-drpdwn-mvup'
        });
        this.moveUpButton = new Button({ cssClass: 'e-button-custom', iconCss: 'e-de-arrow-up' });
        moveUpButtonEle.addEventListener('click', this.moveUpItem.bind(this));
        var moveDownButtonDiv = createElement('div', { className: 'e-bookmark-addbutton' });
        var moveDownButtonEle = createElement('button', {
            attrs: { type: 'button', style: 'height:36px;width:36px' },
            className: 'e-de-ff-drpdwn-mvdn'
        });
        this.moveDownButton = new Button({ cssClass: 'e-button-custom', iconCss: 'e-de-arrow-down' });
        moveDownButtonEle.addEventListener('click', this.moveDownItem.bind(this));
        var fileSettingsLabel = createElement('div', {
            className: 'e-de-ff-dlg-heading',
            innerHTML: localValue.getConstant('Field settings')
        });
        var thirdDiv = createElement('div', { className: 'e-de-div-seperate-dlg' });
        var toolTipDiv = createElement('div', { className: 'e-de-ff-dlg-lft-hlf' });
        var bookmarkDiv = createElement('div', { className: 'e-de-ff-dlg-rght-hlf' });
        var toolTipLabel = createElement('div', {
            className: 'e-de-ff-dlg-heading-small',
            innerHTML: localValue.getConstant('Tooltip')
        });
        this.tooltipInput = createElement('input', { className: 'e-input e-bookmark-textbox-input' });
        var bookmarkLabel = createElement('div', {
            className: 'e-de-ff-dlg-heading-small',
            innerHTML: localValue.getConstant('Name')
        });
        this.bookmarkInput = createElement('input', { className: 'e-input e-bookmark-textbox-input' });
        var dropDownEnableDiv = createElement('div');
        var dropDownEnableEle = createElement('input', { attrs: { type: 'checkbox' } });
        this.dropDownEnable = new CheckBox({
            cssClass: 'e-de-ff-dlg-check',
            label: localValue.getConstant('Dropdown enabled'),
            enableRtl: isRtl
        });
        if (isRtl) {
            listviewDiv.classList.add('e-de-rtl');
            moveUpButtonEle.classList.add('e-de-rtl');
            toolTipDiv.classList.add('e-de-rtl');
            bookmarkDiv.classList.add('e-de-rtl');
        }
        this.target.appendChild(dialogDiv);
        dialogDiv.appendChild(firstDiv);
        firstDiv.appendChild(drpDownItemsLabel);
        firstDiv.appendChild(this.drpDownItemsInput);
        dialogDiv.appendChild(itemsDrpItemsLabel);
        dialogDiv.appendChild(secondDiv);
        secondDiv.appendChild(listviewDiv);
        this.listviewInstance.appendTo(listviewDiv);
        secondDiv.appendChild(buttonDiv);
        buttonDiv.appendChild(addButtonDiv);
        addButtonDiv.appendChild(addButtonEle);
        this.addButton.appendTo(addButtonEle);
        buttonDiv.appendChild(editButtonDiv);
        editButtonDiv.appendChild(editButtonEle);
        this.editButton.appendTo(editButtonEle);
        buttonDiv.appendChild(removeButtonDiv);
        removeButtonDiv.appendChild(removeButtonEle);
        this.removeButton.appendTo(removeButtonEle);
        buttonDiv.appendChild(moveBtnDiv);
        moveBtnDiv.appendChild(moveUpButtonDiv);
        moveUpButtonDiv.appendChild(moveUpButtonEle);
        this.moveUpButton.appendTo(moveUpButtonEle);
        moveBtnDiv.appendChild(moveDownButtonDiv);
        moveDownButtonDiv.appendChild(moveDownButtonEle);
        this.moveDownButton.appendTo(moveDownButtonEle);
        dialogDiv.appendChild(fileSettingsLabel);
        dialogDiv.appendChild(thirdDiv);
        thirdDiv.appendChild(toolTipDiv);
        toolTipDiv.appendChild(toolTipLabel);
        toolTipDiv.appendChild(this.tooltipInput);
        thirdDiv.appendChild(bookmarkDiv);
        bookmarkDiv.appendChild(bookmarkLabel);
        bookmarkDiv.appendChild(this.bookmarkInput);
        dialogDiv.appendChild(dropDownEnableDiv);
        dropDownEnableDiv.appendChild(dropDownEnableEle);
        this.dropDownEnable.appendTo(dropDownEnableEle);
    };
    /**
     * @private
     * @returns {void}
     */
    DropDownFormFieldDialog.prototype.show = function () {
        var localObj = new L10n('documenteditor', this.documentHelper.owner.defaultLocale);
        localObj.setLocale(this.documentHelper.owner.locale);
        if (isNullOrUndefined(this.target)) {
            this.initTextDialog(localObj, this.documentHelper.owner.enableRtl);
        }
        this.loadDropDownDialog();
        this.documentHelper.dialog.header = localObj.getConstant('Drop Down Form Field');
        this.documentHelper.dialog.position = { X: 'center', Y: 'center' };
        this.documentHelper.dialog.height = 'auto';
        this.documentHelper.dialog.width = '448px';
        this.documentHelper.dialog.content = this.target;
        this.documentHelper.dialog.buttons = [{
                click: this.insertDropDownField,
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
    DropDownFormFieldDialog.prototype.loadDropDownDialog = function () {
        var inline = this.owner.selection.getCurrentFormField();
        if (inline instanceof FieldElementBox) {
            this.fieldBegin = inline;
            this.dropDownInstance = inline.formFieldData;
            if (this.dropDownInstance.dropdownItems.length > 0) {
                var index = this.dropDownInstance.selectedIndex;
                this.currentSelectedItem = this.dropDownInstance.dropdownItems[index];
            }
            if (this.dropDownInstance.enabled) {
                this.dropDownEnable.checked = true;
            }
            else {
                this.dropDownEnable.disabled = false;
            }
            if (this.dropDownInstance.helpText !== '') {
                this.tooltipInput.value = this.dropDownInstance.helpText;
            }
            else {
                this.tooltipInput.value = '';
            }
            if (this.dropDownInstance.name !== '') {
                this.bookmarkInput.value = this.dropDownInstance.name;
            }
            else {
                this.bookmarkInput.value = '';
            }
            this.dropDownItems = this.dropDownInstance.dropdownItems.slice();
            this.updateList();
        }
    };
    // sets updated list to dialog & refresh the List
    DropDownFormFieldDialog.prototype.updateList = function () {
        this.listviewInstance.dataSource = this.dropDownItems.slice();
        this.listviewInstance.dataBind();
        if (this.currentSelectedItem) {
            var toSelectItem = this.currentSelectedItem;
            this.listviewInstance.selectItem(toSelectItem);
        }
    };
    DropDownFormFieldDialog.prototype.getSelectedIndex = function () {
        for (var i = 0; i < this.dropDownItems.length; i++) {
            if (this.dropDownItems[i] === this.currentSelectedItem) {
                return i;
            }
        }
        return 0;
    };
    DropDownFormFieldDialog.prototype.moveUp = function (fromIndex, toIndex) {
        var tempData = [];
        if (fromIndex === 0) {
            for (var i = 0; i < this.dropDownItems.length; i++) {
                if (i < (this.dropDownItems.length - 1)) {
                    tempData[i] = this.dropDownItems[i + 1];
                }
                else {
                    tempData[i] = this.dropDownItems[0];
                }
            }
            this.dropDownItems = tempData;
        }
        else {
            var temp = this.dropDownItems[fromIndex];
            this.dropDownItems[fromIndex] = this.dropDownItems[toIndex];
            this.dropDownItems[toIndex] = temp;
        }
    };
    DropDownFormFieldDialog.prototype.moveDown = function (fromIndex, toIndex) {
        var tempData = [];
        if (fromIndex === (this.dropDownItems.length - 1)) {
            for (var i = 0; i < this.dropDownItems.length; i++) {
                if (i !== 0) {
                    tempData[i] = this.dropDownItems[i - 1];
                }
                else {
                    tempData[i] = this.dropDownItems[(this.dropDownItems.length - 1)];
                }
            }
            this.dropDownItems = tempData;
        }
        else {
            var temp = this.dropDownItems[fromIndex];
            this.dropDownItems[fromIndex] = this.dropDownItems[toIndex];
            this.dropDownItems[toIndex] = temp;
        }
    };
    DropDownFormFieldDialog.prototype.enableOrDisableButton = function () {
        if (!isNullOrUndefined(this.addButton)) {
            this.addButton.disabled = (this.drpDownItemsInput.value === '');
        }
    };
    /**
     * @private
     * @returns {void}
     */
    DropDownFormFieldDialog.prototype.destroy = function () {
        var dropDownDialogTarget = this.target;
        if (dropDownDialogTarget) {
            if (dropDownDialogTarget.parentElement) {
                dropDownDialogTarget.parentElement.removeChild(dropDownDialogTarget);
            }
            this.target = undefined;
        }
        this.owner = undefined;
        this.drpDownItemsInput = undefined;
        if (this.listviewInstance) {
            this.listviewInstance.destroy();
            this.listviewInstance = undefined;
        }
        if (this.addButton) {
            this.addButton.destroy();
            this.addButton = undefined;
        }
        if (this.editButton) {
            this.editButton.destroy();
            this.editButton = undefined;
        }
        if (this.removeButton) {
            this.removeButton.destroy();
            this.removeButton = undefined;
        }
        if (this.moveUpButton) {
            this.moveUpButton.destroy();
            this.moveUpButton = undefined;
        }
        if (this.moveDownButton) {
            this.moveDownButton.destroy();
            this.moveDownButton = undefined;
        }
        this.tooltipInput = undefined;
        this.bookmarkInput = undefined;
        if (this.dropDownEnable) {
            this.dropDownEnable.destroy();
            this.dropDownEnable = undefined;
        }
        this.dropDownInstance = undefined;
    };
    return DropDownFormFieldDialog;
}());
export { DropDownFormFieldDialog };
