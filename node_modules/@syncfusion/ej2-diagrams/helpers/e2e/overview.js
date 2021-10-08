"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const e2e_1 = require("@syncfusion/ej2-base/helpers/e2e");
class OverviewHelper extends e2e_1.TestHelper {
    constructor(id, wrapperFn) {
        super();
        this.id = id;
        if (wrapperFn !== undefined) {
            this.wrapperFn = wrapperFn;
        }
        return this;
    }
    getDiagramLayer() {
        return this.selector('#' + this.id + '_diagramLayer_div');
    }
    getHtmlLayer() {
        return this.selector('#' + this.id + '_htmlLayer');
    }
    getHandle() {
        return this.selector('#' + this.id + '_canvasoverviewhandle');
    }
}
exports.OverviewHelper = OverviewHelper;
