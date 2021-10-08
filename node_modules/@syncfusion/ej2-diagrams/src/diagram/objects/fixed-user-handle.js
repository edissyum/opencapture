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
 * Specifies the behavior of fixedUserHandles
 */
/** @private */
var FixedUserHandle = /** @class */ (function (_super) {
    __extends(FixedUserHandle, _super);
    function FixedUserHandle() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    __decorate([
        Property('')
    ], FixedUserHandle.prototype, "id", void 0);
    __decorate([
        Property('transparent')
    ], FixedUserHandle.prototype, "fill", void 0);
    __decorate([
        Property('black')
    ], FixedUserHandle.prototype, "iconStrokeColor", void 0);
    __decorate([
        Property(0)
    ], FixedUserHandle.prototype, "iconStrokeWidth", void 0);
    __decorate([
        Property(true)
    ], FixedUserHandle.prototype, "visibility", void 0);
    __decorate([
        Property(10)
    ], FixedUserHandle.prototype, "width", void 0);
    __decorate([
        Property(10)
    ], FixedUserHandle.prototype, "height", void 0);
    __decorate([
        Property('transparent')
    ], FixedUserHandle.prototype, "handleStrokeColor", void 0);
    __decorate([
        Property(1)
    ], FixedUserHandle.prototype, "handleStrokeWidth", void 0);
    __decorate([
        Property('')
    ], FixedUserHandle.prototype, "pathData", void 0);
    __decorate([
        Property(0)
    ], FixedUserHandle.prototype, "cornerRadius", void 0);
    __decorate([
        Complex({ left: 0, right: 0, top: 0, bottom: 0 }, Margin)
    ], FixedUserHandle.prototype, "padding", void 0);
    return FixedUserHandle;
}(ChildProperty));
export { FixedUserHandle };
/**
 * Defines the node Fixed User Handle
 */
var NodeFixedUserHandle = /** @class */ (function (_super) {
    __extends(NodeFixedUserHandle, _super);
    function NodeFixedUserHandle() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    __decorate([
        Complex({ x: 0, y: 0 }, Point)
    ], NodeFixedUserHandle.prototype, "offset", void 0);
    __decorate([
        Complex({}, Margin)
    ], NodeFixedUserHandle.prototype, "margin", void 0);
    return NodeFixedUserHandle;
}(FixedUserHandle));
export { NodeFixedUserHandle };
/**
 * Defines the connector Fixed User Handle
 */
var ConnectorFixedUserHandle = /** @class */ (function (_super) {
    __extends(ConnectorFixedUserHandle, _super);
    function ConnectorFixedUserHandle() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    __decorate([
        Property(0.5)
    ], ConnectorFixedUserHandle.prototype, "offset", void 0);
    __decorate([
        Property('Center')
    ], ConnectorFixedUserHandle.prototype, "alignment", void 0);
    __decorate([
        Complex({ x: 0, y: 0 }, Point)
    ], ConnectorFixedUserHandle.prototype, "displacement", void 0);
    return ConnectorFixedUserHandle;
}(FixedUserHandle));
export { ConnectorFixedUserHandle };
