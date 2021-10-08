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
import { ChildProperty, Property } from '@syncfusion/ej2-base';
/**
 * progress bar complex interface
 */
var Margin = /** @class */ (function (_super) {
    __extends(Margin, _super);
    function Margin() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    __decorate([
        Property(10)
    ], Margin.prototype, "top", void 0);
    __decorate([
        Property(10)
    ], Margin.prototype, "bottom", void 0);
    __decorate([
        Property(10)
    ], Margin.prototype, "left", void 0);
    __decorate([
        Property(10)
    ], Margin.prototype, "right", void 0);
    return Margin;
}(ChildProperty));
export { Margin };
/**
 * Configures the fonts in progressbar
 */
var Font = /** @class */ (function (_super) {
    __extends(Font, _super);
    function Font() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    __decorate([
        Property('Normal')
    ], Font.prototype, "fontStyle", void 0);
    __decorate([
        Property('16px')
    ], Font.prototype, "size", void 0);
    __decorate([
        Property('Normal')
    ], Font.prototype, "fontWeight", void 0);
    __decorate([
        Property('')
    ], Font.prototype, "color", void 0);
    __decorate([
        Property('Segoe UI')
    ], Font.prototype, "fontFamily", void 0);
    __decorate([
        Property(1)
    ], Font.prototype, "opacity", void 0);
    __decorate([
        Property('Far')
    ], Font.prototype, "textAlignment", void 0);
    __decorate([
        Property('')
    ], Font.prototype, "text", void 0);
    return Font;
}(ChildProperty));
export { Font };
/**
 * Animation
 */
var Animation = /** @class */ (function (_super) {
    __extends(Animation, _super);
    function Animation() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    __decorate([
        Property(false)
    ], Animation.prototype, "enable", void 0);
    __decorate([
        Property(2000)
    ], Animation.prototype, "duration", void 0);
    __decorate([
        Property(0)
    ], Animation.prototype, "delay", void 0);
    return Animation;
}(ChildProperty));
export { Animation };
/**
 * Annotation
 */
var ProgressAnnotationSettings = /** @class */ (function (_super) {
    __extends(ProgressAnnotationSettings, _super);
    function ProgressAnnotationSettings() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    __decorate([
        Property(null)
    ], ProgressAnnotationSettings.prototype, "content", void 0);
    __decorate([
        Property(0)
    ], ProgressAnnotationSettings.prototype, "annotationAngle", void 0);
    __decorate([
        Property('0%')
    ], ProgressAnnotationSettings.prototype, "annotationRadius", void 0);
    return ProgressAnnotationSettings;
}(ChildProperty));
export { ProgressAnnotationSettings };
/**
 * RangeColor
 */
var RangeColor = /** @class */ (function (_super) {
    __extends(RangeColor, _super);
    function RangeColor() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    __decorate([
        Property('')
    ], RangeColor.prototype, "color", void 0);
    __decorate([
        Property(null)
    ], RangeColor.prototype, "start", void 0);
    __decorate([
        Property(null)
    ], RangeColor.prototype, "end", void 0);
    return RangeColor;
}(ChildProperty));
export { RangeColor };
