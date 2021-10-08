"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const e2e_1 = require("@syncfusion/ej2-base/helpers/e2e");
/**
 * E2E test helpers for Colorpicker to easily interact and the test the component
 */
class ColorpickerHelper extends e2e_1.TestHelper {
    /**
     * Initialize the Colorpicker E2E helpers
     * @param id Element id of the Colorpicker element
     * @param wrapperFn Pass the wrapper function
     */
    constructor(id, wrapperFn) {
        super();
        this.id = id;
        if (wrapperFn !== undefined) {
            this.wrapperFn = wrapperFn;
        }
        return this;
    }
    /**
     * Used to get root element of the Colorpicker component
     */
    getElement() {
        return this.selector('#' + this.id);
    }
    getSplitButtonElement() {
        return this.selector('#' + this.id + '_dropdownbtn');
    }
    getSplitButtonPopupElement() {
        return this.selector('#' + this.id + '_dropdownbtn_popup');
    }
    setModel(property, value) {
        let cy;
        return cy.get('#' + this.id).then((ele) => {
            return ele[0].ej2_instances[0][property] = value;
        });
    }
    getModel(property) {
        let cy;
        return cy.get('#' + this.id).then((ele) => {
            return ele[0].ej2_instances[0][property];
        });
    }
    invoke(fName, args = []) {
        let cy;
        return cy.get('#' + this.id).then((ele) => {
            var inst = ele[0].ej2_instances[0];
            return inst[fName].apply(inst, args);
        });
    }
}
exports.ColorpickerHelper = ColorpickerHelper;
