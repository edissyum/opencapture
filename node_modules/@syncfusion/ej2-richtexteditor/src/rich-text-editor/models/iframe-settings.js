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
import { Property, ChildProperty, Complex } from '@syncfusion/ej2-base';
/**
 * Objects used for configuring the iframe resources properties.
 */
var Resources = /** @class */ (function (_super) {
    __extends(Resources, _super);
    function Resources() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    __decorate([
        Property([])
    ], Resources.prototype, "styles", void 0);
    __decorate([
        Property([])
    ], Resources.prototype, "scripts", void 0);
    return Resources;
}(ChildProperty));
export { Resources };
/**
 * Configures the iframe settings of the RTE.
 */
var IFrameSettings = /** @class */ (function (_super) {
    __extends(IFrameSettings, _super);
    function IFrameSettings() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    __decorate([
        Property(false)
    ], IFrameSettings.prototype, "enable", void 0);
    __decorate([
        Property(null)
    ], IFrameSettings.prototype, "attributes", void 0);
    __decorate([
        Complex({}, Resources)
    ], IFrameSettings.prototype, "resources", void 0);
    return IFrameSettings;
}(ChildProperty));
export { IFrameSettings };
