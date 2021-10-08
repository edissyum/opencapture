var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Property, ChildProperty, Collection, Complex, isNullOrUndefined } from '@syncfusion/ej2-base';
import { Container } from '@syncfusion/ej2-drawings';
import { Point } from '@syncfusion/ej2-drawings';
import { PdfAnnotationBase, PdfFormFieldBase } from './pdf-annotation';
/**
 * Defines the size and position of selected items and defines the appearance of selector
 *
 * @hidden
 */
var Selector = /** @class */ (function (_super) {
    __extends(Selector, _super);
    function Selector() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    /**
     * Initializes the UI of the container
     *
     * @param  {any} diagram - diagram element.
     * @returns {Container} - Returns the container element.
     */
    // eslint-disable-next-line
    Selector.prototype.init = function (diagram) {
        var container = new Container();
        container.measureChildren = false;
        container.children = [];
        if (this.formFields && this.formFields.length > 0) {
            for (var i = 0; i < this.formFields.length; i++) {
                var node = diagram.pdfViewer.nameTable[this.formFields[i].id];
                var wrapper = node.wrapper;
                container.children.push(wrapper);
            }
        }
        else if (this.annotations) {
            for (var i = 0; i < this.annotations.length; i++) {
                if (!isNullOrUndefined(this.annotations[i])) {
                    var node = diagram.pdfViewer.nameTable[this.annotations[i].id];
                    var wrapper = node.wrapper;
                    container.children.push(wrapper);
                }
            }
        }
        this.wrapper = container;
        return container;
    };
    __decorate([
        Property(null)
    ], Selector.prototype, "wrapper", void 0);
    __decorate([
        Collection([], PdfAnnotationBase)
    ], Selector.prototype, "annotations", void 0);
    __decorate([
        Collection([], PdfFormFieldBase)
    ], Selector.prototype, "formFields", void 0);
    __decorate([
        Property()
    ], Selector.prototype, "width", void 0);
    __decorate([
        Property()
    ], Selector.prototype, "height", void 0);
    __decorate([
        Property(0)
    ], Selector.prototype, "rotateAngle", void 0);
    __decorate([
        Property(0)
    ], Selector.prototype, "offsetX", void 0);
    __decorate([
        Property(0)
    ], Selector.prototype, "offsetY", void 0);
    __decorate([
        Complex({ x: 0.5, y: 0.5 }, Point)
    ], Selector.prototype, "pivot", void 0);
    return Selector;
}(ChildProperty));
export { Selector };
