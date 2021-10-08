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
import { SmithchartFont } from '../utils/utils';
import { Theme } from '../model/theme';
var Subtitle = /** @class */ (function (_super) {
    __extends(Subtitle, _super);
    function Subtitle() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    __decorate([
        Property(true)
    ], Subtitle.prototype, "visible", void 0);
    __decorate([
        Property('')
    ], Subtitle.prototype, "text", void 0);
    __decorate([
        Property('')
    ], Subtitle.prototype, "description", void 0);
    __decorate([
        Property('Far')
    ], Subtitle.prototype, "textAlignment", void 0);
    __decorate([
        Property(true)
    ], Subtitle.prototype, "enableTrim", void 0);
    __decorate([
        Property(null)
    ], Subtitle.prototype, "maximumWidth", void 0);
    __decorate([
        Complex(Theme.smithchartSubtitleFont, SmithchartFont)
    ], Subtitle.prototype, "textStyle", void 0);
    return Subtitle;
}(ChildProperty));
export { Subtitle };
var Title = /** @class */ (function (_super) {
    __extends(Title, _super);
    function Title() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    __decorate([
        Property(true)
    ], Title.prototype, "visible", void 0);
    __decorate([
        Property('')
    ], Title.prototype, "text", void 0);
    __decorate([
        Property('')
    ], Title.prototype, "description", void 0);
    __decorate([
        Property('Center')
    ], Title.prototype, "textAlignment", void 0);
    __decorate([
        Property(true)
    ], Title.prototype, "enableTrim", void 0);
    __decorate([
        Property(null)
    ], Title.prototype, "maximumWidth", void 0);
    __decorate([
        Complex({}, Subtitle)
    ], Title.prototype, "subtitle", void 0);
    __decorate([
        Complex(Theme.smithchartTitleFont, SmithchartFont)
    ], Title.prototype, "font", void 0);
    __decorate([
        Complex(Theme.smithchartTitleFont, SmithchartFont)
    ], Title.prototype, "textStyle", void 0);
    return Title;
}(ChildProperty));
export { Title };
