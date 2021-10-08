"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const e2e_1 = require("@syncfusion/ej2-base/helpers/e2e");
class ToastHelper extends e2e_1.TestHelper {
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
    getToastElement() {
        return this.selector('#' + this.id + ' .e-toast');
    }
    getMessageWrapper() {
        return this.selector('#' + this.id + ' .e-toast-message');
    }
    getTitleElement() {
        return this.selector('#' + this.id + ' .e-toast-title');
    }
    getContentElement() {
        return this.selector('#' + this.id + ' .e-toast-content');
    }
    getProgressElement() {
        return this.selector('#' + this.id + ' .e-toast-progress');
    }
    getButtonWrapper() {
        return this.selector('#' + this.id + ' .e-toast-actions');
    }
    getButtons() {
        return this.selector('#' + this.id + ' .e-toast-btn');
    }
    getCloseButton() {
        return this.selector('#' + this.id + ' .e-toast-close-icon');
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
exports.ToastHelper = ToastHelper;
