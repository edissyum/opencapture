"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const e2e_1 = require("@syncfusion/ej2-base/helpers/e2e");
class RulerHelper extends e2e_1.TestHelper {
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
    getRulerElement(id, isVertical) {
        return isVertical ? this.selector('#' + id + '_vRuler') : this.selector('#' + id + '_hRuler');
    }
    getMarkerElement(id, isVertical) {
        return isVertical ? this.selector('#' + id + '_vRuler_marker') : this.selector('#' + id + '_hRuler_marker');
    }
}
exports.RulerHelper = RulerHelper;
