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
/**
 * Sparkline base API Class declarations.
 */
import { Property, ChildProperty, Complex } from '@syncfusion/ej2-base';
/**
 * Configures the borders in the Sparkline.
 */
var SparklineBorder = /** @class */ (function (_super) {
    __extends(SparklineBorder, _super);
    function SparklineBorder() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    __decorate([
        Property('')
    ], SparklineBorder.prototype, "color", void 0);
    __decorate([
        Property(0)
    ], SparklineBorder.prototype, "width", void 0);
    return SparklineBorder;
}(ChildProperty));
export { SparklineBorder };
/**
 * Configures the fonts in sparklines.
 */
var SparklineFont = /** @class */ (function (_super) {
    __extends(SparklineFont, _super);
    function SparklineFont() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    __decorate([
        Property(null)
    ], SparklineFont.prototype, "size", void 0);
    __decorate([
        Property(null)
    ], SparklineFont.prototype, "color", void 0);
    __decorate([
        Property('Roboto, Segoe UI, Noto, Sans-serif')
    ], SparklineFont.prototype, "fontFamily", void 0);
    __decorate([
        Property(null)
    ], SparklineFont.prototype, "fontWeight", void 0);
    __decorate([
        Property(null)
    ], SparklineFont.prototype, "fontStyle", void 0);
    __decorate([
        Property(1)
    ], SparklineFont.prototype, "opacity", void 0);
    return SparklineFont;
}(ChildProperty));
export { SparklineFont };
/**
 * To configure the tracker line settings.
 */
var TrackLineSettings = /** @class */ (function (_super) {
    __extends(TrackLineSettings, _super);
    function TrackLineSettings() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    __decorate([
        Property(false)
    ], TrackLineSettings.prototype, "visible", void 0);
    __decorate([
        Property(null)
    ], TrackLineSettings.prototype, "color", void 0);
    __decorate([
        Property(1)
    ], TrackLineSettings.prototype, "width", void 0);
    return TrackLineSettings;
}(ChildProperty));
export { TrackLineSettings };
/**
 * To configure the tooltip settings for sparkline.
 */
var SparklineTooltipSettings = /** @class */ (function (_super) {
    __extends(SparklineTooltipSettings, _super);
    function SparklineTooltipSettings() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    __decorate([
        Property(false)
    ], SparklineTooltipSettings.prototype, "visible", void 0);
    __decorate([
        Property('')
    ], SparklineTooltipSettings.prototype, "fill", void 0);
    __decorate([
        Property('')
    ], SparklineTooltipSettings.prototype, "template", void 0);
    __decorate([
        Property('')
    ], SparklineTooltipSettings.prototype, "format", void 0);
    __decorate([
        Complex({ color: '#cccccc', width: 0.5 }, SparklineBorder)
    ], SparklineTooltipSettings.prototype, "border", void 0);
    __decorate([
        Complex({ size: '13px', fontWeight: 'Normal', fontStyle: 'Normal', fontFamily: 'Roboto, Segoe UI, Noto, Sans-serif' }, SparklineFont)
    ], SparklineTooltipSettings.prototype, "textStyle", void 0);
    __decorate([
        Complex({}, TrackLineSettings)
    ], SparklineTooltipSettings.prototype, "trackLineSettings", void 0);
    return SparklineTooltipSettings;
}(ChildProperty));
export { SparklineTooltipSettings };
/**
 * To configure the sparkline container area customization
 */
var ContainerArea = /** @class */ (function (_super) {
    __extends(ContainerArea, _super);
    function ContainerArea() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    __decorate([
        Property('transparent')
    ], ContainerArea.prototype, "background", void 0);
    __decorate([
        Complex({}, SparklineBorder)
    ], ContainerArea.prototype, "border", void 0);
    return ContainerArea;
}(ChildProperty));
export { ContainerArea };
/**
 * To configure axis line settings
 */
var LineSettings = /** @class */ (function (_super) {
    __extends(LineSettings, _super);
    function LineSettings() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    __decorate([
        Property(false)
    ], LineSettings.prototype, "visible", void 0);
    __decorate([
        Property(null)
    ], LineSettings.prototype, "color", void 0);
    __decorate([
        Property('')
    ], LineSettings.prototype, "dashArray", void 0);
    __decorate([
        Property(1)
    ], LineSettings.prototype, "width", void 0);
    __decorate([
        Property(1)
    ], LineSettings.prototype, "opacity", void 0);
    return LineSettings;
}(ChildProperty));
export { LineSettings };
/**
 * To configure the sparkline rangeband
 */
var RangeBandSettings = /** @class */ (function (_super) {
    __extends(RangeBandSettings, _super);
    function RangeBandSettings() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    __decorate([
        Property(null)
    ], RangeBandSettings.prototype, "startRange", void 0);
    __decorate([
        Property(null)
    ], RangeBandSettings.prototype, "endRange", void 0);
    __decorate([
        Property(null)
    ], RangeBandSettings.prototype, "color", void 0);
    __decorate([
        Property(1)
    ], RangeBandSettings.prototype, "opacity", void 0);
    return RangeBandSettings;
}(ChildProperty));
export { RangeBandSettings };
/**
 * To configure the sparkline axis
 */
var AxisSettings = /** @class */ (function (_super) {
    __extends(AxisSettings, _super);
    function AxisSettings() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    __decorate([
        Property(null)
    ], AxisSettings.prototype, "minX", void 0);
    __decorate([
        Property(null)
    ], AxisSettings.prototype, "maxX", void 0);
    __decorate([
        Property(null)
    ], AxisSettings.prototype, "minY", void 0);
    __decorate([
        Property(null)
    ], AxisSettings.prototype, "maxY", void 0);
    __decorate([
        Property(0)
    ], AxisSettings.prototype, "value", void 0);
    __decorate([
        Complex({}, LineSettings)
    ], AxisSettings.prototype, "lineSettings", void 0);
    return AxisSettings;
}(ChildProperty));
export { AxisSettings };
/**
 * To configure the sparkline padding.
 */
var Padding = /** @class */ (function (_super) {
    __extends(Padding, _super);
    function Padding() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    __decorate([
        Property(5)
    ], Padding.prototype, "left", void 0);
    __decorate([
        Property(5)
    ], Padding.prototype, "right", void 0);
    __decorate([
        Property(5)
    ], Padding.prototype, "bottom", void 0);
    __decorate([
        Property(5)
    ], Padding.prototype, "top", void 0);
    return Padding;
}(ChildProperty));
export { Padding };
/**
 * To configure the sparkline marker options.
 */
var SparklineMarkerSettings = /** @class */ (function (_super) {
    __extends(SparklineMarkerSettings, _super);
    function SparklineMarkerSettings() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    __decorate([
        Property([])
    ], SparklineMarkerSettings.prototype, "visible", void 0);
    __decorate([
        Property(1)
    ], SparklineMarkerSettings.prototype, "opacity", void 0);
    __decorate([
        Property(5)
    ], SparklineMarkerSettings.prototype, "size", void 0);
    __decorate([
        Property('#00bdae')
    ], SparklineMarkerSettings.prototype, "fill", void 0);
    __decorate([
        Complex({ width: 1 }, SparklineBorder)
    ], SparklineMarkerSettings.prototype, "border", void 0);
    return SparklineMarkerSettings;
}(ChildProperty));
export { SparklineMarkerSettings };
/**
 * To configure the datalabel offset
 */
var LabelOffset = /** @class */ (function (_super) {
    __extends(LabelOffset, _super);
    function LabelOffset() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    __decorate([
        Property(0)
    ], LabelOffset.prototype, "x", void 0);
    __decorate([
        Property(0)
    ], LabelOffset.prototype, "y", void 0);
    return LabelOffset;
}(ChildProperty));
export { LabelOffset };
/**
 * To configure the sparkline dataLabel options.
 */
var SparklineDataLabelSettings = /** @class */ (function (_super) {
    __extends(SparklineDataLabelSettings, _super);
    function SparklineDataLabelSettings() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    __decorate([
        Property([])
    ], SparklineDataLabelSettings.prototype, "visible", void 0);
    __decorate([
        Property(1)
    ], SparklineDataLabelSettings.prototype, "opacity", void 0);
    __decorate([
        Property('transparent')
    ], SparklineDataLabelSettings.prototype, "fill", void 0);
    __decorate([
        Property('')
    ], SparklineDataLabelSettings.prototype, "format", void 0);
    __decorate([
        Complex({ color: 'transparent', width: 0 }, SparklineBorder)
    ], SparklineDataLabelSettings.prototype, "border", void 0);
    __decorate([
        Complex({ size: '14px', fontWeight: 'Medium', fontStyle: 'Medium', fontFamily: 'Roboto, Segoe UI, Noto, Sans-serif' }, SparklineFont)
    ], SparklineDataLabelSettings.prototype, "textStyle", void 0);
    __decorate([
        Complex({}, LabelOffset)
    ], SparklineDataLabelSettings.prototype, "offset", void 0);
    __decorate([
        Property('None')
    ], SparklineDataLabelSettings.prototype, "edgeLabelMode", void 0);
    return SparklineDataLabelSettings;
}(ChildProperty));
export { SparklineDataLabelSettings };
