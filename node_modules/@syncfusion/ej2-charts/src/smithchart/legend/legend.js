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
var LegendTitle = /** @class */ (function (_super) {
    __extends(LegendTitle, _super);
    function LegendTitle() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    __decorate([
        Property(true)
    ], LegendTitle.prototype, "visible", void 0);
    __decorate([
        Property('')
    ], LegendTitle.prototype, "text", void 0);
    __decorate([
        Property('')
    ], LegendTitle.prototype, "description", void 0);
    __decorate([
        Property('Center')
    ], LegendTitle.prototype, "textAlignment", void 0);
    __decorate([
        Complex(Theme.legendLabelFont, SmithchartFont)
    ], LegendTitle.prototype, "textStyle", void 0);
    return LegendTitle;
}(ChildProperty));
export { LegendTitle };
var LegendLocation = /** @class */ (function (_super) {
    __extends(LegendLocation, _super);
    function LegendLocation() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    __decorate([
        Property(0)
    ], LegendLocation.prototype, "x", void 0);
    __decorate([
        Property(0)
    ], LegendLocation.prototype, "y", void 0);
    return LegendLocation;
}(ChildProperty));
export { LegendLocation };
var LegendItemStyleBorder = /** @class */ (function (_super) {
    __extends(LegendItemStyleBorder, _super);
    function LegendItemStyleBorder() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    __decorate([
        Property(1)
    ], LegendItemStyleBorder.prototype, "width", void 0);
    __decorate([
        Property(null)
    ], LegendItemStyleBorder.prototype, "color", void 0);
    return LegendItemStyleBorder;
}(ChildProperty));
export { LegendItemStyleBorder };
var LegendItemStyle = /** @class */ (function (_super) {
    __extends(LegendItemStyle, _super);
    function LegendItemStyle() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    __decorate([
        Property(10)
    ], LegendItemStyle.prototype, "width", void 0);
    __decorate([
        Property(10)
    ], LegendItemStyle.prototype, "height", void 0);
    __decorate([
        Complex({}, LegendItemStyleBorder)
    ], LegendItemStyle.prototype, "border", void 0);
    return LegendItemStyle;
}(ChildProperty));
export { LegendItemStyle };
var LegendBorder = /** @class */ (function (_super) {
    __extends(LegendBorder, _super);
    function LegendBorder() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    __decorate([
        Property(1)
    ], LegendBorder.prototype, "width", void 0);
    __decorate([
        Property(null)
    ], LegendBorder.prototype, "color", void 0);
    return LegendBorder;
}(ChildProperty));
export { LegendBorder };
var SmithchartLegendSettings = /** @class */ (function (_super) {
    __extends(SmithchartLegendSettings, _super);
    function SmithchartLegendSettings() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    __decorate([
        Property(false)
    ], SmithchartLegendSettings.prototype, "visible", void 0);
    __decorate([
        Property('bottom')
    ], SmithchartLegendSettings.prototype, "position", void 0);
    __decorate([
        Property('Center')
    ], SmithchartLegendSettings.prototype, "alignment", void 0);
    __decorate([
        Property(null)
    ], SmithchartLegendSettings.prototype, "width", void 0);
    __decorate([
        Property(null)
    ], SmithchartLegendSettings.prototype, "height", void 0);
    __decorate([
        Property('circle')
    ], SmithchartLegendSettings.prototype, "shape", void 0);
    __decorate([
        Property(null)
    ], SmithchartLegendSettings.prototype, "rowCount", void 0);
    __decorate([
        Property(null)
    ], SmithchartLegendSettings.prototype, "columnCount", void 0);
    __decorate([
        Property(8)
    ], SmithchartLegendSettings.prototype, "itemPadding", void 0);
    __decorate([
        Property(5)
    ], SmithchartLegendSettings.prototype, "shapePadding", void 0);
    __decorate([
        Property('')
    ], SmithchartLegendSettings.prototype, "description", void 0);
    __decorate([
        Property(true)
    ], SmithchartLegendSettings.prototype, "toggleVisibility", void 0);
    __decorate([
        Complex({}, LegendTitle)
    ], SmithchartLegendSettings.prototype, "title", void 0);
    __decorate([
        Complex({}, LegendLocation)
    ], SmithchartLegendSettings.prototype, "location", void 0);
    __decorate([
        Complex({}, LegendItemStyle)
    ], SmithchartLegendSettings.prototype, "itemStyle", void 0);
    __decorate([
        Complex({}, LegendBorder)
    ], SmithchartLegendSettings.prototype, "border", void 0);
    __decorate([
        Complex(Theme.legendLabelFont, SmithchartFont)
    ], SmithchartLegendSettings.prototype, "textStyle", void 0);
    return SmithchartLegendSettings;
}(ChildProperty));
export { SmithchartLegendSettings };
