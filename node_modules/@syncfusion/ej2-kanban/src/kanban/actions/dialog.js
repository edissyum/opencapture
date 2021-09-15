/* eslint-disable @typescript-eslint/no-explicit-any */
import { append, createElement, remove, isNullOrUndefined, closest, extend } from '@syncfusion/ej2-base';
import { DropDownList } from '@syncfusion/ej2-dropdowns';
import { FormValidator, NumericTextBox, TextBox } from '@syncfusion/ej2-inputs';
import { Dialog } from '@syncfusion/ej2-popups';
import * as events from '../base/constant';
import * as cls from '../base/css-constant';
/**
 * Dialog module is used to perform card actions.
 */
var KanbanDialog = /** @class */ (function () {
    /**
     * Constructor for dialog module
     *
     * @param {Kanban} parent Accepts the kanban instance
     */
    function KanbanDialog(parent) {
        this.preventUpdate = false;
        this.parent = parent;
    }
    KanbanDialog.prototype.openDialog = function (action, data) {
        this.action = action;
        this.parent.activeCardData.data = data;
        this.renderDialog(data, action);
        this.dialogObj.show();
    };
    KanbanDialog.prototype.closeDialog = function () {
        this.dialogObj.hide();
    };
    KanbanDialog.prototype.renderDialog = function (args, action) {
        this.element = createElement('div', { id: this.parent.element.id + '_dialog_wrapper' });
        this.parent.element.appendChild(this.element);
        var dialogModel = {
            buttons: this.getDialogButtons(action),
            content: this.getDialogContent(args, action),
            cssClass: cls.DIALOG_CLASS,
            enableRtl: this.parent.enableRtl,
            header: this.parent.localeObj.getConstant(action === 'Add' ? 'addTitle' : action === 'Edit' ? 'editTitle' : 'deleteTitle'),
            height: 'auto',
            isModal: true,
            showCloseIcon: true,
            width: (action === 'Delete') ? 400 : 350,
            visible: false,
            beforeOpen: this.onBeforeDialogOpen.bind(this),
            beforeClose: this.onBeforeDialogClose.bind(this)
        };
        this.dialogObj = new Dialog(extend(dialogModel, action !== 'Delete' ? (this.parent.dialogSettings.model || {}) : {}), this.element);
        if (action !== 'Delete') {
            this.applyFormValidation();
        }
        this.dialogObj.element.querySelector('.e-dlg-closeicon-btn').title = this.parent.localeObj.getConstant('close');
    };
    KanbanDialog.prototype.getDialogContent = function (args, action) {
        if (action === 'Delete') {
            return this.parent.localeObj.getConstant('deleteContent');
        }
        else {
            var container = createElement('div', { className: cls.FORM_WRAPPER_CLASS });
            var form = createElement('form', {
                id: this.parent.element.id + 'EditForm',
                className: cls.FORM_CLASS, attrs: { onsubmit: 'return false;' }
            });
            if (this.parent.dialogSettings.template) {
                if (args) {
                    this.destroyComponents();
                    [].slice.call(form.childNodes).forEach(function (node) { return remove(node); });
                }
                var templateId = this.parent.element.id + '_dialogTemplate';
                var dialogTemplate = this.parent.templateParser(this.parent.dialogSettings.template)(args, this.parent, 'dialogTemplate', templateId, false);
                append(dialogTemplate, form);
                this.parent.renderTemplates();
            }
            else {
                var dialogWrapper = createElement('div', { className: cls.DIALOG_CONTENT_CONTAINER });
                form.appendChild(dialogWrapper);
                var table = createElement('table');
                dialogWrapper.appendChild(table);
                var dialogFields = this.getDialogFields();
                for (var _i = 0, dialogFields_1 = dialogFields; _i < dialogFields_1.length; _i++) {
                    var field = dialogFields_1[_i];
                    var tr = createElement('tr');
                    table.appendChild(tr);
                    tr.appendChild(createElement('td', { className: 'e-label', innerHTML: field.text ? field.text : field.key }));
                    var td = createElement('td');
                    tr.appendChild(td);
                    td.appendChild(this.renderComponents(field));
                }
            }
            container.appendChild(form);
            return container;
        }
    };
    KanbanDialog.prototype.getDialogFields = function () {
        var fields = this.parent.dialogSettings.fields;
        if (fields.length === 0) {
            fields = [
                { text: 'ID', key: this.parent.cardSettings.headerField, type: 'TextBox' },
                { key: this.parent.keyField, type: 'DropDown' },
                { key: this.parent.cardSettings.contentField, type: 'TextArea' }
            ];
            if (this.parent.sortSettings.field) {
                fields.splice(fields.length - 1, 0, { key: this.parent.sortSettings.field, type: 'TextBox' });
            }
            if (this.parent.swimlaneSettings.keyField) {
                fields.splice(fields.length - 1, 0, { key: this.parent.swimlaneSettings.keyField, type: 'DropDown' });
            }
        }
        return fields;
    };
    KanbanDialog.prototype.getDialogButtons = function (action) {
        var primaryButtonClass = action === 'Delete' ? 'e-dialog-yes' : action === 'Add' ? 'e-dialog-add' : 'e-dialog-edit';
        var flatButtonClass = action === 'Delete' ? 'e-dialog-no' : 'e-dialog-cancel';
        var dialogButtons = [
            {
                buttonModel: {
                    cssClass: 'e-flat ' + primaryButtonClass, isPrimary: true,
                    content: this.parent.localeObj.getConstant(action === 'Add' || action === 'Edit' ? 'save' : 'yes')
                },
                click: this.dialogButtonClick.bind(this)
            }, {
                buttonModel: {
                    cssClass: 'e-flat ' + flatButtonClass, isPrimary: false,
                    content: this.parent.localeObj.getConstant(action === 'Add' || action === 'Edit' ? 'cancel' : 'no')
                },
                click: this.dialogButtonClick.bind(this)
            }
        ];
        if (action === 'Edit') {
            var deleteButton = {
                buttonModel: { cssClass: 'e-flat e-dialog-delete', isPrimary: false, content: this.parent.localeObj.getConstant('delete') },
                click: this.dialogButtonClick.bind(this)
            };
            dialogButtons.splice(0, 0, deleteButton);
        }
        return dialogButtons;
    };
    KanbanDialog.prototype.renderComponents = function (field) {
        var wrapper = createElement('div', { className: field.key + '_wrapper' });
        var element = createElement('input', { className: cls.FIELD_CLASS, attrs: { 'name': field.key } });
        wrapper.appendChild(element);
        var divElement;
        var dropDownOptions;
        var controlObj;
        var fieldValue = this.parent.activeCardData.data ?
            this.parent.activeCardData.data[field.key] : null;
        switch (field.type) {
            case 'DropDown':
                if (field.key === this.parent.keyField) {
                    var currentKeys = this.parent.layoutModule.columnKeys;
                    if (this.parent.actionModule.hideColumnKeys.length > 0) {
                        currentKeys = [];
                        for (var i = 0; i < this.parent.columns.length; i++) {
                            if (this.parent.layoutModule.isColumnVisible(this.parent.columns[i])) {
                                var isNumeric = typeof this.parent.columns[i].keyField === 'number';
                                if (isNumeric) {
                                    currentKeys = currentKeys.concat(this.parent.columns[i].keyField.toString());
                                }
                                else {
                                    currentKeys = currentKeys.concat(this.parent.columns[i].keyField.split(',').map(function (e) { return e.trim(); }));
                                }
                            }
                        }
                    }
                    dropDownOptions = { dataSource: currentKeys, value: fieldValue ? fieldValue.toString() : fieldValue };
                }
                else if (field.key === this.parent.swimlaneSettings.keyField) {
                    dropDownOptions = {
                        dataSource: [].slice.call(this.parent.layoutModule.kanbanRows),
                        fields: { text: 'textField', value: 'keyField' }, value: fieldValue
                    };
                }
                controlObj = new DropDownList(dropDownOptions);
                break;
            case 'Numeric':
                controlObj = new NumericTextBox({ value: fieldValue });
                break;
            case 'TextBox':
                controlObj = new TextBox({ value: fieldValue });
                if (fieldValue && this.parent.cardSettings.headerField === field.key) {
                    controlObj.enabled = false;
                }
                break;
            case 'TextArea':
                remove(element);
                divElement = createElement('div');
                element = createElement('textarea', {
                    className: cls.FIELD_CLASS, attrs: { 'name': field.key, 'rows': '3' },
                    innerHTML: fieldValue
                });
                wrapper.appendChild(divElement).appendChild(element);
                break;
            default:
                break;
        }
        if (controlObj) {
            controlObj.appendTo(element);
        }
        return wrapper;
    };
    KanbanDialog.prototype.onBeforeDialogOpen = function (args) {
        var _this = this;
        var eventProp = {
            data: this.parent.activeCardData.data,
            cancel: false, element: this.element,
            target: this.parent.activeCardData.element,
            requestType: this.action
        };
        this.storeElement = document.activeElement;
        if (parseInt(args.maxHeight, 10) <= 250) {
            args.maxHeight = '250px';
        }
        this.parent.trigger(events.dialogOpen, eventProp, function (openArgs) {
            args.cancel = openArgs.cancel;
            if (openArgs.cancel) {
                _this.destroy();
            }
        });
    };
    KanbanDialog.prototype.onBeforeDialogClose = function (args) {
        var _this = this;
        var formInputs = this.getFormElements();
        var cardObj = {};
        if (args.isInteracted) {
            /* close icon preventing data update */
            this.preventUpdate = true;
        }
        if (!this.preventUpdate) {
            for (var _i = 0, formInputs_1 = formInputs; _i < formInputs_1.length; _i++) {
                var input = formInputs_1[_i];
                var columnName = input.name || this.getColumnName(input);
                if (!isNullOrUndefined(columnName) && columnName !== '') {
                    var value = this.getValueFromElement(input);
                    if (columnName === this.parent.cardSettings.headerField) {
                        value = this.getIDType() === 'string' ? value : parseInt(value, 10);
                    }
                    cardObj[columnName] = value;
                }
            }
        }
        this.preventUpdate = false;
        cardObj = extend(this.parent.activeCardData.data, cardObj);
        var eventProp = { data: cardObj, cancel: false, element: this.element, requestType: this.action };
        this.parent.trigger(events.dialogClose, eventProp, function (closeArgs) {
            args.cancel = closeArgs.cancel;
            if (!closeArgs.cancel) {
                _this.cardData = eventProp.data;
                _this.destroy();
                _this.parent.actionModule.SingleCardSelection(_this.cardData);
            }
        });
    };
    KanbanDialog.prototype.getIDType = function () {
        if (this.parent.kanbanData.length !== 0) {
            return typeof (this.parent.kanbanData[0][this.parent.cardSettings.headerField]);
        }
        return 'string';
    };
    KanbanDialog.prototype.applyFormValidation = function () {
        var _this = this;
        var form = this.element.querySelector('.' + cls.FORM_CLASS);
        var rules = {};
        for (var _i = 0, _a = this.parent.dialogSettings.fields; _i < _a.length; _i++) {
            var field = _a[_i];
            rules[field.key] = (field.validationRules && Object.keys(field.validationRules).length > 0) ? field.validationRules : null;
        }
        this.formObj = new FormValidator(form, {
            rules: rules,
            customPlacement: function (inputElement, error) {
                var id = error.getAttribute('for');
                var elem = _this.element.querySelector('#' + id + '_Error');
                if (!elem) {
                    _this.createTooltip(inputElement, error, id, '');
                }
            },
            validationComplete: function (args) {
                var elem = _this.element.querySelector('#' + args.inputName + '_Error');
                if (elem) {
                    elem.style.display = (args.status === 'failure') ? '' : 'none';
                }
            }
        });
    };
    KanbanDialog.prototype.createTooltip = function (element, error, name, display) {
        var dlgContent;
        var client;
        var inputClient = element.parentElement.getBoundingClientRect();
        if (this.element.classList.contains(cls.DIALOG_CLASS)) {
            dlgContent = this.element;
            client = this.element.getBoundingClientRect();
        }
        else {
            dlgContent = this.element.querySelector('.e-kanban-dialog .e-dlg-content');
            client = dlgContent.getBoundingClientRect();
        }
        var div = createElement('div', {
            className: 'e-tooltip-wrap e-popup ' + cls.ERROR_VALIDATION_CLASS,
            id: name + '_Error',
            styles: 'display:' + display + ';top:' +
                (inputClient.bottom - client.top + dlgContent.scrollTop + 9) + 'px;left:' +
                (inputClient.left - client.left + dlgContent.scrollLeft + inputClient.width / 2) + 'px;'
        });
        var content = createElement('div', { className: 'e-tip-content' });
        content.appendChild(error);
        var arrow = createElement('div', { className: 'e-arrow-tip e-tip-top' });
        arrow.appendChild(createElement('div', { className: 'e-arrow-tip-outer e-tip-top' }));
        arrow.appendChild(createElement('div', { className: 'e-arrow-tip-inner e-tip-top' }));
        div.appendChild(content);
        div.appendChild(arrow);
        dlgContent.appendChild(div);
        div.style.left = (parseInt(div.style.left, 10) - div.offsetWidth / 2) + 'px';
    };
    KanbanDialog.prototype.destroyToolTip = function () {
        if (this.element) {
            this.element.querySelectorAll('.' + cls.ERROR_VALIDATION_CLASS).forEach(function (node) { return remove(node); });
        }
        if (this.formObj && this.formObj.element) {
            this.formObj.reset();
        }
    };
    KanbanDialog.prototype.dialogButtonClick = function (event) {
        var target = event.target.cloneNode(true);
        var id = this.formObj.element.id;
        if (document.getElementById(id) && this.formObj.validate() &&
            (target.classList.contains('e-dialog-edit') || target.classList.contains('e-dialog-add'))) {
            this.dialogObj.hide();
            if (target.classList.contains('e-dialog-edit')) {
                var activeCard = this.parent.activeCardData;
                var updateIndex = void 0;
                if (activeCard.data[this.parent.keyField] === this.cardData[this.parent.keyField]
                    && activeCard.element) {
                    updateIndex = [].slice.call(activeCard.element.parentElement.children).indexOf(activeCard.element);
                }
                this.parent.crudModule.updateCard(this.cardData, updateIndex);
            }
            if (target.classList.contains('e-dialog-add')) {
                this.parent.crudModule.addCard(this.cardData);
            }
            this.parent.actionModule.SingleCardSelection(this.cardData);
            this.cardData = null;
        }
        if (!target.classList.contains('e-dialog-edit') && !target.classList.contains('e-dialog-add')) {
            if (target.classList.contains('e-dialog-cancel')) {
                this.preventUpdate = true;
            }
            this.dialogObj.hide();
            if (target.classList.contains('e-dialog-yes')) {
                this.parent.crudModule.deleteCard(this.parent.activeCardData.data);
            }
            else if (target.classList.contains('e-dialog-no')) {
                this.openDialog('Edit', this.parent.activeCardData.data);
            }
            else if (target.classList.contains('e-dialog-delete')) {
                this.openDialog('Delete', this.parent.activeCardData.data);
            }
        }
    };
    KanbanDialog.prototype.getFormElements = function () {
        var elements = [].slice.call(this.element.querySelectorAll('.' + cls.FIELD_CLASS));
        var validElements = [];
        for (var _i = 0, elements_1 = elements; _i < elements_1.length; _i++) {
            var element = elements_1[_i];
            if (element.classList.contains('e-control')) {
                validElements.push(element);
            }
            else if (element.querySelector('.e-control')) {
                validElements.push(element.querySelector('.e-control'));
            }
            else {
                validElements.push(element);
            }
        }
        return validElements;
    };
    KanbanDialog.prototype.getColumnName = function (element) {
        var attrName = element.getAttribute('data-name') || '';
        if (attrName === '') {
            var isDropDowns = false;
            var fieldSelector = '';
            if (element.classList.contains('e-dropdownlist') || element.classList.contains('e-multiselect')) {
                fieldSelector = element.classList.contains('e-dropdownlist') ? 'e-ddl' : 'e-multiselect';
                isDropDowns = true;
            }
            else if (element.classList.contains('e-numerictextbox')) {
                fieldSelector = 'e-numeric';
            }
            var classSelector = isDropDowns ? "." + fieldSelector + ":not(.e-control)" : "." + fieldSelector;
            var control = closest(element, classSelector) || element.querySelector("." + fieldSelector);
            if (control) {
                var attrEle = control.querySelector('[name]');
                if (attrEle) {
                    attrName = attrEle.name;
                }
            }
        }
        return attrName;
    };
    KanbanDialog.prototype.getValueFromElement = function (element) {
        var value;
        if (element.classList.contains('e-dropdownlist')) {
            value = element.ej2_instances[0].value;
        }
        else if (element.classList.contains('e-multiselect')) {
            value = element.ej2_instances[0].value;
        }
        else if (element.classList.contains('e-checkbox')) {
            value = element.ej2_instances[0].checked;
        }
        else {
            if (element.type === 'checkbox') {
                value = element.checked;
            }
            else {
                value = element.value;
            }
        }
        return value;
    };
    KanbanDialog.prototype.destroyComponents = function () {
        var formelement = this.getFormElements();
        for (var _i = 0, formelement_1 = formelement; _i < formelement_1.length; _i++) {
            var element = formelement_1[_i];
            var instance = element.ej2_instances;
            if (instance && instance.length > 0) {
                instance.forEach(function (node) { return node.destroy(); });
            }
        }
    };
    KanbanDialog.prototype.destroy = function () {
        this.destroyToolTip();
        this.destroyComponents();
        if (this.dialogObj) {
            this.dialogObj.destroy();
            this.storeElement.focus();
            this.dialogObj = null;
            remove(this.element);
            this.element = null;
        }
    };
    return KanbanDialog;
}());
export { KanbanDialog };
