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
var Layer = /** @class */ (function (_super) {
    __extends(Layer, _super);
    // tslint:disable-next-line:no-any
    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    function Layer(parent, propName, defaultValue, isArray) {
        var _this = _super.call(this, parent, propName, defaultValue, isArray) || this;
        /**  @private   */
        _this.objectZIndex = -1;
        /**   @private  */
        _this.zIndexTable = {};
        _this.objects = [];
        return _this;
    }
    __decorate([
        Property('')
    ], Layer.prototype, "id", void 0);
    __decorate([
        Property(true)
    ], Layer.prototype, "visible", void 0);
    __decorate([
        Property(false)
    ], Layer.prototype, "lock", void 0);
    __decorate([
        Property()
    ], Layer.prototype, "objects", void 0);
    __decorate([
        Property()
    ], Layer.prototype, "addInfo", void 0);
    __decorate([
        Property(-1)
    ], Layer.prototype, "zIndex", void 0);
    return Layer;
}(ChildProperty));
export { Layer };
