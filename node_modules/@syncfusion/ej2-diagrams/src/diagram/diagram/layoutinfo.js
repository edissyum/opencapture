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
import { Property, ChildProperty } from '@syncfusion/ej2-base';
/**
 * A collection of JSON objects where each object represents a layer.
 * Layer is a named category of diagram shapes.
 */
var LayoutInfo = /** @class */ (function (_super) {
    __extends(LayoutInfo, _super);
    function LayoutInfo() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    __decorate([
        Property('Horizontal')
    ], LayoutInfo.prototype, "orientation", void 0);
    __decorate([
        Property('Center')
    ], LayoutInfo.prototype, "type", void 0);
    __decorate([
        Property(undefined)
    ], LayoutInfo.prototype, "offset", void 0);
    __decorate([
        Property(false)
    ], LayoutInfo.prototype, "enableRouting", void 0);
    __decorate([
        Property([])
    ], LayoutInfo.prototype, "children", void 0);
    __decorate([
        Property('')
    ], LayoutInfo.prototype, "assistants", void 0);
    __decorate([
        Property('')
    ], LayoutInfo.prototype, "level", void 0);
    __decorate([
        Property('')
    ], LayoutInfo.prototype, "hasSubTree", void 0);
    __decorate([
        Property('')
    ], LayoutInfo.prototype, "rows", void 0);
    return LayoutInfo;
}(ChildProperty));
export { LayoutInfo };
