"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const e2e_1 = require("@syncfusion/ej2-base/helpers/e2e");
class DiagramHelper extends e2e_1.TestHelper {
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
    getBackgroundLayerElement() {
        return this.selector('#' + this.id + '_backgroundLayer_svg');
    }
    getGridLineLayerElement() {
        return this.selector('#' + this.id + '_gridline_svg');
    }
    getDiagramLayerElement() {
        return this.selector('#' + this.id + '_diagramLayer_div');
    }
    getNativeLayerElement() {
        return this.selector('#' + this.id + '_nativeLayer_svg');
    }
    getHTMLLayerElement() {
        return this.selector('#' + this.id + '_htmlLayer');
    }
    getAdornerLayerElement() {
        return this.selector('#' + this.id + '_diagramAdornerLayer');
    }
    getSelectorElment() {
        return this.selector('#' + this.id + '_SelectorElement');
    }
    getNodeElement(id) {
        return this.selector('#' + id + '_groupElement');
    }
    getPortElement(parentId, portId) {
        return this.selector('#' + parentId + '_' + portId);
    }
    getIconElement(parentId) {
        return this.selector('#' + parentId + '_icon_content_groupElement');
    }
    getConnecorElement(id) {
        return this.selector('#' + id + '_groupElement');
    }
    getDecoratorElement(connectorId, isTargetDecorator) {
        return isTargetDecorator ?
            this.selector('#' + connectorId + '_tarDec_groupElement') : this.selector('#' + connectorId + '_srcDec_groupElement');
    }
    getAnnotationElement(parentId, annotationId) {
        return this.selector('#' + parentId + annotationId + '_groupElement');
    }
}
exports.DiagramHelper = DiagramHelper;
