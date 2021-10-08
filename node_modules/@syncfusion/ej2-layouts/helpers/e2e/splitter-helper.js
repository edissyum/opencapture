"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const e2e_1 = require("@syncfusion/ej2-base/helpers/e2e");
class SplitterHelper extends e2e_1.TestHelper {
    constructor(id, wrapperFn) {
        super();
        this.id = id;
        if (wrapperFn !== undefined) {
            this.wrapperFn = wrapperFn;
        }
        return this;
    }
    /**
     * The method which returns Splitter's root element.
     */
    getElement() {
        return this.selector('#' + this.id + ".e-splitter");
    }
    /**
     * The method which returns Splitter's all pane elements.
     */
    getPaneElement() {
        let element = this.selector('#' + this.id + ".e-splitter");
        let pane = [];
        return pane.filter.call(element.children, (ele) => pane.includes.call(ele.classList, 'e-pane'));
    }
    /**
     * The method which returns Splitter's separator (split-bar) elements.
     */
    getSplitBar() {
        let element = this.selector('#' + this.id + ".e-splitter");
        let split = [];
        return split.filter.call(element.children, (ele) => split.includes.call(ele.classList, 'e-split-bar'));
    }
    /**
     * The getModel method is used to return value of the property.
     * @param property - Specifies name of the property. It must be string type.
     */
    getModel(property) {
        this.getModel(property);
    }
    /**
     * The setModel method is used to set value for the property. It will accepts two arguments.
     * @param property - Specifices name of the property which value is to be updated.
     * @param value - Specifies corresponding value of the property.
     */
    setModel(property, value) {
        this.setModel(property, value);
    }
    /**
     * The invoke method is used to set value for the property. It will accepts two arguments.
     * @param property - Specifices name of the property which value is to be updated.
     * @param value - Specifies corresponding value of the property.
     */
    invoke(fName, args) {
        this.invoke(fName, args);
    }
}
exports.SplitterHelper = SplitterHelper;
