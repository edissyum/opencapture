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
import { Property, Complex, ChildProperty } from '@syncfusion/ej2-base';
import { Margin } from '../core/appearance';
import { Point } from '../primitives/point';
/**
 * Defines the behavior of default IconShapes
 */
var IconShape = /** @class */ (function (_super) {
    __extends(IconShape, _super);
    function IconShape() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    __decorate([
        Property('None')
    ], IconShape.prototype, "shape", void 0);
    __decorate([
        Property('white')
    ], IconShape.prototype, "fill", void 0);
    __decorate([
        Property('Auto')
    ], IconShape.prototype, "horizontalAlignment", void 0);
    __decorate([
        Property('Auto')
    ], IconShape.prototype, "verticalAlignment", void 0);
    __decorate([
        Property(10)
    ], IconShape.prototype, "width", void 0);
    __decorate([
        Property(10)
    ], IconShape.prototype, "height", void 0);
    __decorate([
        Complex({ x: 0.5, y: 1 }, Point)
    ], IconShape.prototype, "offset", void 0);
    __decorate([
        Property('#1a1a1a')
    ], IconShape.prototype, "borderColor", void 0);
    __decorate([
        Property(1)
    ], IconShape.prototype, "borderWidth", void 0);
    __decorate([
        Complex({}, Margin)
    ], IconShape.prototype, "margin", void 0);
    __decorate([
        Property('')
    ], IconShape.prototype, "pathData", void 0);
    __decorate([
        Property('')
    ], IconShape.prototype, "content", void 0);
    __decorate([
        Property(0)
    ], IconShape.prototype, "cornerRadius", void 0);
    __decorate([
        Complex({ left: 2, right: 2, top: 2, bottom: 2 }, Margin)
    ], IconShape.prototype, "padding", void 0);
    return IconShape;
}(ChildProperty));
export { IconShape };
