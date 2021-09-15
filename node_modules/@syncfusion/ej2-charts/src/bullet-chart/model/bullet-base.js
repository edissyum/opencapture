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
import { ChildProperty, Property, Complex } from '@syncfusion/ej2-base';
import { Border, Margin } from '../../common/model/base';
import { BulletChartTheme } from '../utils/theme';
import { Location } from '../../common/legend/legend';
/**
 * Configuration of the bullet chart ranges
 */
var Range = /** @class */ (function (_super) {
    __extends(Range, _super);
    function Range() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    __decorate([
        Property(null)
    ], Range.prototype, "end", void 0);
    __decorate([
        Property(1)
    ], Range.prototype, "opacity", void 0);
    __decorate([
        Property(null)
    ], Range.prototype, "color", void 0);
    __decorate([
        Property(null)
    ], Range.prototype, "index", void 0);
    __decorate([
        Property(null)
    ], Range.prototype, "name", void 0);
    __decorate([
        Property('Rectangle')
    ], Range.prototype, "shape", void 0);
    __decorate([
        Property('')
    ], Range.prototype, "legendImageUrl", void 0);
    return Range;
}(ChildProperty));
export { Range };
/**
 * Configures the major tick lines.
 */
var MajorTickLinesSettings = /** @class */ (function (_super) {
    __extends(MajorTickLinesSettings, _super);
    function MajorTickLinesSettings() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    __decorate([
        Property(12)
    ], MajorTickLinesSettings.prototype, "height", void 0);
    __decorate([
        Property(1)
    ], MajorTickLinesSettings.prototype, "width", void 0);
    __decorate([
        Property(null)
    ], MajorTickLinesSettings.prototype, "color", void 0);
    __decorate([
        Property(false)
    ], MajorTickLinesSettings.prototype, "useRangeColor", void 0);
    return MajorTickLinesSettings;
}(ChildProperty));
export { MajorTickLinesSettings };
/**
 * Configures the minor tick lines.
 */
var MinorTickLinesSettings = /** @class */ (function (_super) {
    __extends(MinorTickLinesSettings, _super);
    function MinorTickLinesSettings() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    __decorate([
        Property(8)
    ], MinorTickLinesSettings.prototype, "height", void 0);
    __decorate([
        Property(1)
    ], MinorTickLinesSettings.prototype, "width", void 0);
    __decorate([
        Property(null)
    ], MinorTickLinesSettings.prototype, "color", void 0);
    __decorate([
        Property(false)
    ], MinorTickLinesSettings.prototype, "useRangeColor", void 0);
    return MinorTickLinesSettings;
}(ChildProperty));
export { MinorTickLinesSettings };
/**
 * Configures the fonts in bullet chart.
 */
var BulletLabelStyle = /** @class */ (function (_super) {
    __extends(BulletLabelStyle, _super);
    function BulletLabelStyle() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    __decorate([
        Property('Normal')
    ], BulletLabelStyle.prototype, "fontStyle", void 0);
    __decorate([
        Property('16px')
    ], BulletLabelStyle.prototype, "size", void 0);
    __decorate([
        Property('')
    ], BulletLabelStyle.prototype, "color", void 0);
    __decorate([
        Property('Normal')
    ], BulletLabelStyle.prototype, "fontWeight", void 0);
    __decorate([
        Property('Segoe UI')
    ], BulletLabelStyle.prototype, "fontFamily", void 0);
    __decorate([
        Property('Center')
    ], BulletLabelStyle.prototype, "textAlignment", void 0);
    __decorate([
        Property('None')
    ], BulletLabelStyle.prototype, "textOverflow", void 0);
    __decorate([
        Property(1)
    ], BulletLabelStyle.prototype, "opacity", void 0);
    __decorate([
        Property(true)
    ], BulletLabelStyle.prototype, "enableTrim", void 0);
    __decorate([
        Property(null)
    ], BulletLabelStyle.prototype, "maximumTitleWidth", void 0);
    __decorate([
        Property(false)
    ], BulletLabelStyle.prototype, "useRangeColor", void 0);
    return BulletLabelStyle;
}(ChildProperty));
export { BulletLabelStyle };
/**
 * Configures the ToolTips in the bullet chart.
 */
var BulletTooltipSettings = /** @class */ (function (_super) {
    __extends(BulletTooltipSettings, _super);
    function BulletTooltipSettings() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    __decorate([
        Property(false)
    ], BulletTooltipSettings.prototype, "enable", void 0);
    __decorate([
        Property(null)
    ], BulletTooltipSettings.prototype, "fill", void 0);
    __decorate([
        Complex(BulletChartTheme.tooltipLabelFont, BulletLabelStyle)
    ], BulletTooltipSettings.prototype, "textStyle", void 0);
    __decorate([
        Complex({ color: '#cccccc', width: 0.5 }, Border)
    ], BulletTooltipSettings.prototype, "border", void 0);
    __decorate([
        Property(null)
    ], BulletTooltipSettings.prototype, "template", void 0);
    return BulletTooltipSettings;
}(ChildProperty));
export { BulletTooltipSettings };
/**
 * Configures the DataLabel in the bullet chart.
 */
var BulletDataLabel = /** @class */ (function (_super) {
    __extends(BulletDataLabel, _super);
    function BulletDataLabel() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    __decorate([
        Property(false)
    ], BulletDataLabel.prototype, "enable", void 0);
    __decorate([
        Complex(BulletChartTheme.dataLabelFont, BulletLabelStyle)
    ], BulletDataLabel.prototype, "labelStyle", void 0);
    return BulletDataLabel;
}(ChildProperty));
export { BulletDataLabel };
/**
 * Configures the legends in charts.
 */
var BulletChartLegendSettings = /** @class */ (function (_super) {
    __extends(BulletChartLegendSettings, _super);
    function BulletChartLegendSettings() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    __decorate([
        Property(false)
    ], BulletChartLegendSettings.prototype, "visible", void 0);
    __decorate([
        Complex({ x: 0, y: 0 }, Location)
    ], BulletChartLegendSettings.prototype, "location", void 0);
    __decorate([
        Property(8)
    ], BulletChartLegendSettings.prototype, "padding", void 0);
    __decorate([
        Property('Center')
    ], BulletChartLegendSettings.prototype, "alignment", void 0);
    __decorate([
        Property(10)
    ], BulletChartLegendSettings.prototype, "shapeHeight", void 0);
    __decorate([
        Property(10)
    ], BulletChartLegendSettings.prototype, "shapeWidth", void 0);
    __decorate([
        Complex(BulletChartTheme.legendLabelFont, BulletLabelStyle)
    ], BulletChartLegendSettings.prototype, "textStyle", void 0);
    __decorate([
        Property('Auto')
    ], BulletChartLegendSettings.prototype, "position", void 0);
    __decorate([
        Complex({ left: 0, right: 0, top: 0, bottom: 0 }, Margin)
    ], BulletChartLegendSettings.prototype, "margin", void 0);
    __decorate([
        Complex({}, Border)
    ], BulletChartLegendSettings.prototype, "border", void 0);
    __decorate([
        Property(5)
    ], BulletChartLegendSettings.prototype, "shapePadding", void 0);
    __decorate([
        Property('transparent')
    ], BulletChartLegendSettings.prototype, "background", void 0);
    __decorate([
        Property(1)
    ], BulletChartLegendSettings.prototype, "opacity", void 0);
    __decorate([
        Property(3)
    ], BulletChartLegendSettings.prototype, "tabIndex", void 0);
    return BulletChartLegendSettings;
}(ChildProperty));
export { BulletChartLegendSettings };
