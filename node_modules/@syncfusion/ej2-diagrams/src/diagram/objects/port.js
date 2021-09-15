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
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Property, Complex, ChildProperty } from '@syncfusion/ej2-base';
import { ShapeStyle, Margin } from '../core/appearance';
import { Point } from '../primitives/point';
import { PortConstraints, PortVisibility } from '../enum/enum';
/**
 * Defines the behavior of connection ports
 */
var Port = /** @class */ (function (_super) {
    __extends(Port, _super);
    // tslint:disable-next-line:no-any
    function Port(parent, propName, defaultValue, isArray) {
        var _this = _super.call(this, parent, propName, defaultValue, isArray) || this;
        _this.inEdges = [];
        _this.outEdges = [];
        return _this;
    }
    __decorate([
        Property('')
    ], Port.prototype, "id", void 0);
    __decorate([
        Property('Center')
    ], Port.prototype, "horizontalAlignment", void 0);
    __decorate([
        Property('Center')
    ], Port.prototype, "verticalAlignment", void 0);
    __decorate([
        Complex({}, Margin)
    ], Port.prototype, "margin", void 0);
    __decorate([
        Property(12)
    ], Port.prototype, "width", void 0);
    __decorate([
        Property(12)
    ], Port.prototype, "height", void 0);
    __decorate([
        Complex({}, ShapeStyle)
    ], Port.prototype, "style", void 0);
    __decorate([
        Property('Square')
    ], Port.prototype, "shape", void 0);
    __decorate([
        Property(PortVisibility.Connect)
    ], Port.prototype, "visibility", void 0);
    __decorate([
        Property('')
    ], Port.prototype, "pathData", void 0);
    __decorate([
        Property(PortConstraints.Default)
    ], Port.prototype, "constraints", void 0);
    __decorate([
        Property()
    ], Port.prototype, "addInfo", void 0);
    __decorate([
        Property()
    ], Port.prototype, "outEdges", void 0);
    __decorate([
        Property()
    ], Port.prototype, "inEdges", void 0);
    return Port;
}(ChildProperty));
export { Port };
/**
 * Defines the behavior of a port, that sticks to a point
 */
var PointPort = /** @class */ (function (_super) {
    __extends(PointPort, _super);
    function PointPort(parent, propName, defaultValue, isArray) {
        return _super.call(this, parent, propName, defaultValue, isArray) || this;
    }
    /**
     * getClassName method \
     *
     * @returns { string } toBounds method .\
     *
     * @private
     */
    PointPort.prototype.getClassName = function () {
        return 'PointPort';
    };
    __decorate([
        Complex({ x: 0.5, y: 0.5 }, Point)
    ], PointPort.prototype, "offset", void 0);
    return PointPort;
}(Port));
export { PointPort };
