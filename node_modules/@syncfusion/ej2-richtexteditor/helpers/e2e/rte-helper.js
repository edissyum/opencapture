"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const e2e_1 = require("@syncfusion/ej2-base/helpers/e2e");
class RichTextEditorHelper extends e2e_1.TestHelper {
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
    getQuickToolbarElement() {
        return this.selector(".e-rte-quick-popup");
    }
    getToolbar() {
        return this.selector('#' + this.id + "_toolbar");
    }
    getCharCount() {
        return this.selector(".e-rte-character-count");
    }
    getTableDialog() {
        return this.selector('#' + this.id + "_tabledialog");
    }
    getImageDialog() {
        return this.selector('#' + this.id + "_defaultRTE_image");
    }
    getLinkDialog() {
        return this.selector('#' + this.id + "_rtelink");
    }
    getFontNamePopup() {
        return this.selector('#' + this.id + "_toolbar_FontName-popup");
    }
    getFontSizePopup() {
        return this.selector('#' + this.id + "_toolbar_FontSize-popup");
    }
    getFontColorPopup() {
        return this.selector('#' + this.id + "toolbar_FontColor-popup");
    }
    getBackgroundColorPopup() {
        return this.selector('#' + this.id + "toolbar_BackgroundColor-popup");
    }
    getFormatPopup() {
        return this.selector('#' + this.id + "toolbar_Formats-popup");
    }
    getAlignmentPopup() {
        return this.selector('#' + this.id + "toolbar_Alignments-popup");
    }
    getContent() {
        return this.selector(".e-rte-content");
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
exports.RichTextEditorHelper = RichTextEditorHelper;
