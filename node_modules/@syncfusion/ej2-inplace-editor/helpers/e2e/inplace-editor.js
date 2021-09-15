"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const e2e_1 = require("@syncfusion/ej2-base/helpers/e2e");
class InPlaceEditorHelper extends e2e_1.TestHelper {
    constructor(id, wrapperFn) {
        super();
        this.id = id;
        if (wrapperFn !== undefined) {
            this.wrapperFn = wrapperFn;
        }
        return this;
    }
    getElement() {
        return this.selector('#' + this.id);
    }
    getValueElement() {
        return this.selector('#' + this.id + ' .e-editable-value');
    }
    getEditIconElement() {
        return this.selector('#' + this.id + ' .e-editable-overlay-icon');
    }
    getPopupElement() {
        return this.selector('.e-inplaceeditor-tip');
    }
    getLoadingElement(mode) {
        return (mode === 'Popup' ? this.selector('.e-inplaceeditor-tip .e-editable-loading') : this.selector('#' + this.id + ' .e-editable-loading'));
    }
    getErrorElement(mode) {
        return (mode === 'Popup' ? this.selector('.e-inplaceeditor-tip .e-editable-error') : this.selector('#' + this.id + ' .e-editable-error'));
    }
    getFormElement(mode) {
        return (mode === 'Popup' ? this.selector('.e-inplaceeditor-tip .e-editable-form') : this.selector('#' + this.id + ' .e-editable-form'));
    }
    getButtonsWrapper(mode) {
        return (mode === 'Popup' ? this.selector('.e-inplaceeditor-tip .e-editable-action-buttons') : this.selector('#' + this.id + ' .e-editable-action-buttons'));
    }
    getSaveButton(mode) {
        return (mode === 'Popup' ? this.selector('.e-inplaceeditor-tip .e-btn-save') : this.selector('#' + this.id + ' .e-btn-save'));
    }
    getCancelButton(mode) {
        return (mode === 'Popup' ? this.selector('.e-inplaceeditor-tip .e-btn-cancel') : this.selector('#' + this.id + ' .e-btn-cancel'));
    }
    getComponentWrapper(mode) {
        return (mode === 'Popup' ? this.selector('.e-inplaceeditor-tip .e-editable-component') : this.selector('#' + this.id + ' .e-editable-component'));
    }
    getComponentElement(mode) {
        return (mode === 'Popup' ? this.selector('.e-inplaceeditor-tip #' + this.id + '_editor') : this.selector('#' + this.id + '  #' + this.id + '_editor'));
    }
    getModel(property) {
        this.getModel(property);
    }
    setModel(property, value) {
        this.setModel(property, value);
    }
    invoke(fName, args) {
        this.invoke(fName, args);
    }
}
exports.InPlaceEditorHelper = InPlaceEditorHelper;
