"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const e2e_1 = require("@syncfusion/ej2-base/helpers/e2e");
class PivotFieldListHelper extends e2e_1.TestHelper {
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
    getFieldListPopupElement() {
        return this.selector('#' + this.id + '_Wrapper');
    }
    getFilterPopupElement() {
        return this.selector('#' + this.id + '_EditorTreeView');
    }
    getAggregationContextMenuElement() {
        return this.selector('#' + this.id + 'valueFieldContextMenu');
    }
    getValueSettingsDialogElement() {
        return this.selector('#' + this.id + '_Wrapper_ValueDialog');
    }
    getCalculatedMemberPopupElement() {
        return this.selector('#' + this.id + '_calculateddialog');
    }
}
exports.PivotFieldListHelper = PivotFieldListHelper;
