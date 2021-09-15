"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const e2e_1 = require("@syncfusion/ej2-base/helpers/e2e");
class SymbolpaletteHelper extends e2e_1.TestHelper {
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
    getSearchElement() {
        return this.selector('#' + this.id + '_search');
    }
    getHeadderElement() {
        return this.selector('#' + this.id);
    }
    getPaletteElement(paletteId) {
        return this.selector('#' + paletteId);
    }
    getSymbolElement(symbolId) {
        return this.selector('#' + symbolId);
    }
}
exports.SymbolpaletteHelper = SymbolpaletteHelper;
