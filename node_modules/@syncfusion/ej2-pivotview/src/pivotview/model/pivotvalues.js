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
// eslint-disable
/**
 * Configures the properties in pivotvalues fields.
 */
/** @hidden */
// eslint-enable
var AxisSet = /** @class */ (function (_super) {
    __extends(AxisSet, _super);
    function AxisSet() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    __decorate([
        Property()
    ], AxisSet.prototype, "formattedText", void 0);
    __decorate([
        Property()
    ], AxisSet.prototype, "type", void 0);
    __decorate([
        Property()
    ], AxisSet.prototype, "isDrilled", void 0);
    __decorate([
        Property()
    ], AxisSet.prototype, "hasChild", void 0);
    __decorate([
        Property()
    ], AxisSet.prototype, "members", void 0);
    __decorate([
        Property()
    ], AxisSet.prototype, "index", void 0);
    __decorate([
        Property()
    ], AxisSet.prototype, "indexObject", void 0);
    __decorate([
        Property()
    ], AxisSet.prototype, "ordinal", void 0);
    __decorate([
        Property()
    ], AxisSet.prototype, "level", void 0);
    __decorate([
        Property()
    ], AxisSet.prototype, "axis", void 0);
    __decorate([
        Property()
    ], AxisSet.prototype, "value", void 0);
    __decorate([
        Property()
    ], AxisSet.prototype, "colSpan", void 0);
    __decorate([
        Property()
    ], AxisSet.prototype, "rowSpan", void 0);
    __decorate([
        Property()
    ], AxisSet.prototype, "valueSort", void 0);
    __decorate([
        Property()
    ], AxisSet.prototype, "isSum", void 0);
    __decorate([
        Property()
    ], AxisSet.prototype, "columnHeaders", void 0);
    __decorate([
        Property()
    ], AxisSet.prototype, "rowHeaders", void 0);
    return AxisSet;
}(ChildProperty));
export { AxisSet };
