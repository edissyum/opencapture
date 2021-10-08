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
/* eslint-disable @typescript-eslint/ban-types */
import { ChildProperty, Property, Complex, Collection } from '@syncfusion/ej2-base';
import { MarkerSettings, Trendline } from '../../chart/series/chart-series';
import { MajorGridLines, MajorTickLines, MinorTickLines, MinorGridLines, CrosshairTooltip, AxisLine } from '../../chart/axis/axis';
import { CornerRadius } from '../../common/model/base';
import { Theme } from '../../common/model/theme';
var StockChartFont = /** @class */ (function (_super) {
    __extends(StockChartFont, _super);
    function StockChartFont() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    __decorate([
        Property('')
    ], StockChartFont.prototype, "color", void 0);
    __decorate([
        Property('16px')
    ], StockChartFont.prototype, "size", void 0);
    __decorate([
        Property('Segoe UI')
    ], StockChartFont.prototype, "fontFamily", void 0);
    __decorate([
        Property('Normal')
    ], StockChartFont.prototype, "fontStyle", void 0);
    __decorate([
        Property('Normal')
    ], StockChartFont.prototype, "fontWeight", void 0);
    __decorate([
        Property(1)
    ], StockChartFont.prototype, "opacity", void 0);
    __decorate([
        Property('Trim')
    ], StockChartFont.prototype, "textOverflow", void 0);
    __decorate([
        Property('Center')
    ], StockChartFont.prototype, "textAlignment", void 0);
    return StockChartFont;
}(ChildProperty));
export { StockChartFont };
/**
 * Border
 */
var StockChartBorder = /** @class */ (function (_super) {
    __extends(StockChartBorder, _super);
    function StockChartBorder() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    __decorate([
        Property('')
    ], StockChartBorder.prototype, "color", void 0);
    __decorate([
        Property(1)
    ], StockChartBorder.prototype, "width", void 0);
    return StockChartBorder;
}(ChildProperty));
export { StockChartBorder };
/**
 * Configures the chart area.
 */
var StockChartArea = /** @class */ (function (_super) {
    __extends(StockChartArea, _super);
    function StockChartArea() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    __decorate([
        Complex({}, StockChartBorder)
    ], StockChartArea.prototype, "border", void 0);
    __decorate([
        Property('transparent')
    ], StockChartArea.prototype, "background", void 0);
    __decorate([
        Property(1)
    ], StockChartArea.prototype, "opacity", void 0);
    return StockChartArea;
}(ChildProperty));
export { StockChartArea };
/**
 * Configures the chart margins.
 */
var StockMargin = /** @class */ (function (_super) {
    __extends(StockMargin, _super);
    function StockMargin() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    __decorate([
        Property(10)
    ], StockMargin.prototype, "left", void 0);
    __decorate([
        Property(10)
    ], StockMargin.prototype, "right", void 0);
    __decorate([
        Property(10)
    ], StockMargin.prototype, "top", void 0);
    __decorate([
        Property(10)
    ], StockMargin.prototype, "bottom", void 0);
    return StockMargin;
}(ChildProperty));
export { StockMargin };
/**
 * StockChart strip line settings
 */
var StockChartStripLineSettings = /** @class */ (function (_super) {
    __extends(StockChartStripLineSettings, _super);
    function StockChartStripLineSettings() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    __decorate([
        Property(false)
    ], StockChartStripLineSettings.prototype, "startFromAxis", void 0);
    __decorate([
        Property(true)
    ], StockChartStripLineSettings.prototype, "visible", void 0);
    __decorate([
        Property(null)
    ], StockChartStripLineSettings.prototype, "start", void 0);
    __decorate([
        Property('#808080')
    ], StockChartStripLineSettings.prototype, "color", void 0);
    __decorate([
        Property(null)
    ], StockChartStripLineSettings.prototype, "end", void 0);
    __decorate([
        Property(null)
    ], StockChartStripLineSettings.prototype, "size", void 0);
    __decorate([
        Property('Auto')
    ], StockChartStripLineSettings.prototype, "sizeType", void 0);
    __decorate([
        Property(null)
    ], StockChartStripLineSettings.prototype, "dashArray", void 0);
    __decorate([
        Property(false)
    ], StockChartStripLineSettings.prototype, "isRepeat", void 0);
    __decorate([
        Property(null)
    ], StockChartStripLineSettings.prototype, "repeatEvery", void 0);
    __decorate([
        Property(false)
    ], StockChartStripLineSettings.prototype, "isSegmented", void 0);
    __decorate([
        Property(null)
    ], StockChartStripLineSettings.prototype, "repeatUntil", void 0);
    __decorate([
        Property(null)
    ], StockChartStripLineSettings.prototype, "segmentStart", void 0);
    __decorate([
        Property(null)
    ], StockChartStripLineSettings.prototype, "segmentAxisName", void 0);
    __decorate([
        Property(null)
    ], StockChartStripLineSettings.prototype, "segmentEnd", void 0);
    __decorate([
        Property(1)
    ], StockChartStripLineSettings.prototype, "opacity", void 0);
    __decorate([
        Property('')
    ], StockChartStripLineSettings.prototype, "text", void 0);
    __decorate([
        Complex({ color: 'transparent', width: 1 }, StockChartBorder)
    ], StockChartStripLineSettings.prototype, "border", void 0);
    __decorate([
        Property(null)
    ], StockChartStripLineSettings.prototype, "rotation", void 0);
    __decorate([
        Property('Behind')
    ], StockChartStripLineSettings.prototype, "zIndex", void 0);
    __decorate([
        Property('Middle')
    ], StockChartStripLineSettings.prototype, "horizontalAlignment", void 0);
    __decorate([
        Property('Middle')
    ], StockChartStripLineSettings.prototype, "verticalAlignment", void 0);
    __decorate([
        Complex(Theme.stripLineLabelFont, StockChartFont)
    ], StockChartStripLineSettings.prototype, "textStyle", void 0);
    return StockChartStripLineSettings;
}(ChildProperty));
export { StockChartStripLineSettings };
var Animation = /** @class */ (function (_super) {
    __extends(Animation, _super);
    function Animation() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    __decorate([
        Property(0)
    ], Animation.prototype, "delay", void 0);
    __decorate([
        Property(false)
    ], Animation.prototype, "enable", void 0);
    __decorate([
        Property(1000)
    ], Animation.prototype, "duration", void 0);
    return Animation;
}(ChildProperty));
var StockEmptyPointSettings = /** @class */ (function (_super) {
    __extends(StockEmptyPointSettings, _super);
    function StockEmptyPointSettings() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    __decorate([
        Property(null)
    ], StockEmptyPointSettings.prototype, "fill", void 0);
    __decorate([
        Property('Gap')
    ], StockEmptyPointSettings.prototype, "mode", void 0);
    __decorate([
        Complex({ color: 'transparent', width: 0 }, StockChartBorder)
    ], StockEmptyPointSettings.prototype, "border", void 0);
    return StockEmptyPointSettings;
}(ChildProperty));
export { StockEmptyPointSettings };
var StockChartConnector = /** @class */ (function (_super) {
    __extends(StockChartConnector, _super);
    function StockChartConnector() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    __decorate([
        Property('Line')
    ], StockChartConnector.prototype, "type", void 0);
    __decorate([
        Property(null)
    ], StockChartConnector.prototype, "length", void 0);
    __decorate([
        Property(null)
    ], StockChartConnector.prototype, "color", void 0);
    __decorate([
        Property('')
    ], StockChartConnector.prototype, "dashArray", void 0);
    __decorate([
        Property(1)
    ], StockChartConnector.prototype, "width", void 0);
    return StockChartConnector;
}(ChildProperty));
export { StockChartConnector };
/**
 * Configures the Annotation for chart.
 */
var StockSeries = /** @class */ (function (_super) {
    __extends(StockSeries, _super);
    function StockSeries() {
        /**
         * The DataSource field that contains the x value.
         * It is applicable for series and technical indicators
         *
         * @default ''
         */
        var _this = _super !== null && _super.apply(this, arguments) || this;
        /** @private */
        _this.localData = undefined;
        return _this;
    }
    __decorate([
        Property('date')
    ], StockSeries.prototype, "xName", void 0);
    __decorate([
        Property('close')
    ], StockSeries.prototype, "yName", void 0);
    __decorate([
        Property('open')
    ], StockSeries.prototype, "open", void 0);
    __decorate([
        Property('close')
    ], StockSeries.prototype, "close", void 0);
    __decorate([
        Property('high')
    ], StockSeries.prototype, "high", void 0);
    __decorate([
        Property('low')
    ], StockSeries.prototype, "low", void 0);
    __decorate([
        Property('volume')
    ], StockSeries.prototype, "volume", void 0);
    __decorate([
        Property('')
    ], StockSeries.prototype, "pointColorMapping", void 0);
    __decorate([
        Property('SeriesType')
    ], StockSeries.prototype, "legendShape", void 0);
    __decorate([
        Property('')
    ], StockSeries.prototype, "legendImageUrl", void 0);
    __decorate([
        Complex(null, Animation)
    ], StockSeries.prototype, "animation", void 0);
    __decorate([
        Property(null)
    ], StockSeries.prototype, "xAxisName", void 0);
    __decorate([
        Property(null)
    ], StockSeries.prototype, "yAxisName", void 0);
    __decorate([
        Property(null)
    ], StockSeries.prototype, "fill", void 0);
    __decorate([
        Property('0')
    ], StockSeries.prototype, "dashArray", void 0);
    __decorate([
        Property(1)
    ], StockSeries.prototype, "width", void 0);
    __decorate([
        Property('')
    ], StockSeries.prototype, "name", void 0);
    __decorate([
        Property('')
    ], StockSeries.prototype, "dataSource", void 0);
    __decorate([
        Property()
    ], StockSeries.prototype, "query", void 0);
    __decorate([
        Property('#e74c3d')
    ], StockSeries.prototype, "bullFillColor", void 0);
    __decorate([
        Property('#2ecd71')
    ], StockSeries.prototype, "bearFillColor", void 0);
    __decorate([
        Property(false)
    ], StockSeries.prototype, "enableSolidCandles", void 0);
    __decorate([
        Property(true)
    ], StockSeries.prototype, "visible", void 0);
    __decorate([
        Complex({ color: 'transparent', width: 0 }, StockChartBorder)
    ], StockSeries.prototype, "border", void 0);
    __decorate([
        Property(1)
    ], StockSeries.prototype, "opacity", void 0);
    __decorate([
        Property('Candle')
    ], StockSeries.prototype, "type", void 0);
    __decorate([
        Complex(null, MarkerSettings)
    ], StockSeries.prototype, "marker", void 0);
    __decorate([
        Collection([], Trendline)
    ], StockSeries.prototype, "trendlines", void 0);
    __decorate([
        Property(true)
    ], StockSeries.prototype, "enableTooltip", void 0);
    __decorate([
        Property('')
    ], StockSeries.prototype, "tooltipMappingName", void 0);
    __decorate([
        Property(null)
    ], StockSeries.prototype, "selectionStyle", void 0);
    __decorate([
        Property(0.5)
    ], StockSeries.prototype, "cardinalSplineTension", void 0);
    __decorate([
        Complex(null, CornerRadius)
    ], StockSeries.prototype, "cornerRadius", void 0);
    __decorate([
        Complex(null, StockEmptyPointSettings)
    ], StockSeries.prototype, "emptyPointSettings", void 0);
    __decorate([
        Property(null)
    ], StockSeries.prototype, "columnWidth", void 0);
    __decorate([
        Property(0)
    ], StockSeries.prototype, "columnSpacing", void 0);
    return StockSeries;
}(ChildProperty));
export { StockSeries };
var StockChartIndicator = /** @class */ (function (_super) {
    __extends(StockChartIndicator, _super);
    function StockChartIndicator() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    __decorate([
        Property('Sma')
    ], StockChartIndicator.prototype, "type", void 0);
    __decorate([
        Property(14)
    ], StockChartIndicator.prototype, "period", void 0);
    __decorate([
        Property(3)
    ], StockChartIndicator.prototype, "dPeriod", void 0);
    __decorate([
        Property(14)
    ], StockChartIndicator.prototype, "kPeriod", void 0);
    __decorate([
        Property(80)
    ], StockChartIndicator.prototype, "overBought", void 0);
    __decorate([
        Property(20)
    ], StockChartIndicator.prototype, "overSold", void 0);
    __decorate([
        Property('Close')
    ], StockChartIndicator.prototype, "field", void 0);
    __decorate([
        Property(2)
    ], StockChartIndicator.prototype, "standardDeviation", void 0);
    __decorate([
        Property(12)
    ], StockChartIndicator.prototype, "slowPeriod", void 0);
    __decorate([
        Property(true)
    ], StockChartIndicator.prototype, "showZones", void 0);
    __decorate([
        Property(26)
    ], StockChartIndicator.prototype, "fastPeriod", void 0);
    __decorate([
        Complex({ color: '#ff9933', width: 2 }, StockChartConnector)
    ], StockChartIndicator.prototype, "macdLine", void 0);
    __decorate([
        Property('Both')
    ], StockChartIndicator.prototype, "macdType", void 0);
    __decorate([
        Property('#e74c3d')
    ], StockChartIndicator.prototype, "macdNegativeColor", void 0);
    __decorate([
        Property('#2ecd71')
    ], StockChartIndicator.prototype, "macdPositiveColor", void 0);
    __decorate([
        Property('rgba(211,211,211,0.25)')
    ], StockChartIndicator.prototype, "bandColor", void 0);
    __decorate([
        Complex({ color: '#ffb735', width: 1 }, StockChartConnector)
    ], StockChartIndicator.prototype, "upperLine", void 0);
    __decorate([
        Property('')
    ], StockChartIndicator.prototype, "seriesName", void 0);
    __decorate([
        Complex({ color: '#f2ec2f', width: 1 }, StockChartConnector)
    ], StockChartIndicator.prototype, "periodLine", void 0);
    __decorate([
        Complex({ color: '#f2ec2f', width: 1 }, StockChartConnector)
    ], StockChartIndicator.prototype, "lowerLine", void 0);
    __decorate([
        Property('')
    ], StockChartIndicator.prototype, "high", void 0);
    __decorate([
        Property('')
    ], StockChartIndicator.prototype, "open", void 0);
    __decorate([
        Property('')
    ], StockChartIndicator.prototype, "low", void 0);
    __decorate([
        Property('')
    ], StockChartIndicator.prototype, "xName", void 0);
    __decorate([
        Property('')
    ], StockChartIndicator.prototype, "close", void 0);
    __decorate([
        Property('')
    ], StockChartIndicator.prototype, "pointColorMapping", void 0);
    __decorate([
        Property('')
    ], StockChartIndicator.prototype, "volume", void 0);
    __decorate([
        Property(null)
    ], StockChartIndicator.prototype, "xAxisName", void 0);
    __decorate([
        Property(null)
    ], StockChartIndicator.prototype, "yAxisName", void 0);
    __decorate([
        Complex(null, Animation)
    ], StockChartIndicator.prototype, "animation", void 0);
    __decorate([
        Property(null)
    ], StockChartIndicator.prototype, "fill", void 0);
    __decorate([
        Property('0')
    ], StockChartIndicator.prototype, "dashArray", void 0);
    __decorate([
        Property(1)
    ], StockChartIndicator.prototype, "width", void 0);
    __decorate([
        Property()
    ], StockChartIndicator.prototype, "query", void 0);
    __decorate([
        Property('')
    ], StockChartIndicator.prototype, "dataSource", void 0);
    return StockChartIndicator;
}(ChildProperty));
export { StockChartIndicator };
var StockChartAxis = /** @class */ (function (_super) {
    __extends(StockChartAxis, _super);
    function StockChartAxis() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    __decorate([
        Complex({}, CrosshairTooltip)
    ], StockChartAxis.prototype, "crosshairTooltip", void 0);
    __decorate([
        Complex(Theme.axisLabelFont, StockChartFont)
    ], StockChartAxis.prototype, "labelStyle", void 0);
    __decorate([
        Property('')
    ], StockChartAxis.prototype, "title", void 0);
    __decorate([
        Complex(Theme.axisTitleFont, StockChartFont)
    ], StockChartAxis.prototype, "titleStyle", void 0);
    __decorate([
        Property('')
    ], StockChartAxis.prototype, "labelFormat", void 0);
    __decorate([
        Property('DateTime')
    ], StockChartAxis.prototype, "skeletonType", void 0);
    __decorate([
        Property('')
    ], StockChartAxis.prototype, "skeleton", void 0);
    __decorate([
        Property(0)
    ], StockChartAxis.prototype, "plotOffset", void 0);
    __decorate([
        Property(10)
    ], StockChartAxis.prototype, "logBase", void 0);
    __decorate([
        Property(0)
    ], StockChartAxis.prototype, "rowIndex", void 0);
    __decorate([
        Property(1)
    ], StockChartAxis.prototype, "span", void 0);
    __decorate([
        Property(3)
    ], StockChartAxis.prototype, "maximumLabels", void 0);
    __decorate([
        Property(null)
    ], StockChartAxis.prototype, "desiredIntervals", void 0);
    __decorate([
        Property(1)
    ], StockChartAxis.prototype, "zoomFactor", void 0);
    __decorate([
        Property(0)
    ], StockChartAxis.prototype, "zoomPosition", void 0);
    __decorate([
        Property(false)
    ], StockChartAxis.prototype, "opposedPosition", void 0);
    __decorate([
        Property(true)
    ], StockChartAxis.prototype, "enableAutoIntervalOnZooming", void 0);
    __decorate([
        Property('Double')
    ], StockChartAxis.prototype, "valueType", void 0);
    __decorate([
        Property('Auto')
    ], StockChartAxis.prototype, "rangePadding", void 0);
    __decorate([
        Property('None')
    ], StockChartAxis.prototype, "edgeLabelPlacement", void 0);
    __decorate([
        Property('BetweenTicks')
    ], StockChartAxis.prototype, "labelPlacement", void 0);
    __decorate([
        Property('Auto')
    ], StockChartAxis.prototype, "intervalType", void 0);
    __decorate([
        Property('Outside')
    ], StockChartAxis.prototype, "tickPosition", void 0);
    __decorate([
        Property('')
    ], StockChartAxis.prototype, "name", void 0);
    __decorate([
        Property('Outside')
    ], StockChartAxis.prototype, "labelPosition", void 0);
    __decorate([
        Property(true)
    ], StockChartAxis.prototype, "visible", void 0);
    __decorate([
        Property(0)
    ], StockChartAxis.prototype, "labelRotation", void 0);
    __decorate([
        Property(0)
    ], StockChartAxis.prototype, "minorTicksPerInterval", void 0);
    __decorate([
        Property(null)
    ], StockChartAxis.prototype, "crossesAt", void 0);
    __decorate([
        Property(null)
    ], StockChartAxis.prototype, "crossesInAxis", void 0);
    __decorate([
        Property(true)
    ], StockChartAxis.prototype, "placeNextToAxisLine", void 0);
    __decorate([
        Property(null)
    ], StockChartAxis.prototype, "minimum", void 0);
    __decorate([
        Property(null)
    ], StockChartAxis.prototype, "interval", void 0);
    __decorate([
        Property(null)
    ], StockChartAxis.prototype, "maximum", void 0);
    __decorate([
        Property(34)
    ], StockChartAxis.prototype, "maximumLabelWidth", void 0);
    __decorate([
        Complex({}, MajorTickLines)
    ], StockChartAxis.prototype, "majorTickLines", void 0);
    __decorate([
        Property(false)
    ], StockChartAxis.prototype, "enableTrim", void 0);
    __decorate([
        Complex({}, MinorTickLines)
    ], StockChartAxis.prototype, "minorTickLines", void 0);
    __decorate([
        Complex({}, MinorGridLines)
    ], StockChartAxis.prototype, "minorGridLines", void 0);
    __decorate([
        Complex({}, MajorGridLines)
    ], StockChartAxis.prototype, "majorGridLines", void 0);
    __decorate([
        Complex({}, AxisLine)
    ], StockChartAxis.prototype, "lineStyle", void 0);
    __decorate([
        Property(false)
    ], StockChartAxis.prototype, "isInversed", void 0);
    __decorate([
        Property('Trim')
    ], StockChartAxis.prototype, "labelIntersectAction", void 0);
    __decorate([
        Property(100)
    ], StockChartAxis.prototype, "coefficient", void 0);
    __decorate([
        Property(0)
    ], StockChartAxis.prototype, "startAngle", void 0);
    __decorate([
        Property(2)
    ], StockChartAxis.prototype, "tabIndex", void 0);
    __decorate([
        Collection([], StockChartStripLineSettings)
    ], StockChartAxis.prototype, "stripLines", void 0);
    __decorate([
        Property(null)
    ], StockChartAxis.prototype, "description", void 0);
    return StockChartAxis;
}(ChildProperty));
export { StockChartAxis };
/**
 * StockChart row
 */
var StockChartRow = /** @class */ (function (_super) {
    __extends(StockChartRow, _super);
    function StockChartRow() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    __decorate([
        Property('100%')
    ], StockChartRow.prototype, "height", void 0);
    __decorate([
        Complex({}, StockChartBorder)
    ], StockChartRow.prototype, "border", void 0);
    return StockChartRow;
}(ChildProperty));
export { StockChartRow };
var StockChartTrendline = /** @class */ (function (_super) {
    __extends(StockChartTrendline, _super);
    function StockChartTrendline() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    __decorate([
        Property(2)
    ], StockChartTrendline.prototype, "period", void 0);
    __decorate([
        Property('')
    ], StockChartTrendline.prototype, "name", void 0);
    __decorate([
        Property('Linear')
    ], StockChartTrendline.prototype, "type", void 0);
    __decorate([
        Property(2)
    ], StockChartTrendline.prototype, "polynomialOrder", void 0);
    __decorate([
        Property(0)
    ], StockChartTrendline.prototype, "forwardForecast", void 0);
    __decorate([
        Property(0)
    ], StockChartTrendline.prototype, "backwardForecast", void 0);
    __decorate([
        Complex({}, Animation)
    ], StockChartTrendline.prototype, "animation", void 0);
    __decorate([
        Property(true)
    ], StockChartTrendline.prototype, "enableTooltip", void 0);
    __decorate([
        Complex({}, MarkerSettings)
    ], StockChartTrendline.prototype, "marker", void 0);
    __decorate([
        Property(null)
    ], StockChartTrendline.prototype, "intercept", void 0);
    __decorate([
        Property('')
    ], StockChartTrendline.prototype, "fill", void 0);
    __decorate([
        Property('SeriesType')
    ], StockChartTrendline.prototype, "legendShape", void 0);
    __decorate([
        Property(1)
    ], StockChartTrendline.prototype, "width", void 0);
    return StockChartTrendline;
}(ChildProperty));
export { StockChartTrendline };
var StockChartAnnotationSettings = /** @class */ (function (_super) {
    __extends(StockChartAnnotationSettings, _super);
    function StockChartAnnotationSettings() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    __decorate([
        Property('0')
    ], StockChartAnnotationSettings.prototype, "y", void 0);
    __decorate([
        Property('0')
    ], StockChartAnnotationSettings.prototype, "x", void 0);
    __decorate([
        Property(null)
    ], StockChartAnnotationSettings.prototype, "content", void 0);
    __decorate([
        Property('Chart')
    ], StockChartAnnotationSettings.prototype, "region", void 0);
    __decorate([
        Property('Center')
    ], StockChartAnnotationSettings.prototype, "horizontalAlignment", void 0);
    __decorate([
        Property('Pixel')
    ], StockChartAnnotationSettings.prototype, "coordinateUnits", void 0);
    __decorate([
        Property('Middle')
    ], StockChartAnnotationSettings.prototype, "verticalAlignment", void 0);
    __decorate([
        Property(null)
    ], StockChartAnnotationSettings.prototype, "yAxisName", void 0);
    __decorate([
        Property(null)
    ], StockChartAnnotationSettings.prototype, "description", void 0);
    __decorate([
        Property(null)
    ], StockChartAnnotationSettings.prototype, "xAxisName", void 0);
    return StockChartAnnotationSettings;
}(ChildProperty));
export { StockChartAnnotationSettings };
var StockChartIndexes = /** @class */ (function (_super) {
    __extends(StockChartIndexes, _super);
    function StockChartIndexes() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    __decorate([
        Property(0)
    ], StockChartIndexes.prototype, "point", void 0);
    __decorate([
        Property(0)
    ], StockChartIndexes.prototype, "series", void 0);
    return StockChartIndexes;
}(ChildProperty));
export { StockChartIndexes };
/**
 * Configures the Stock events for stock chart.
 */
var StockEventsSettings = /** @class */ (function (_super) {
    __extends(StockEventsSettings, _super);
    function StockEventsSettings() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    __decorate([
        Property('Circle')
    ], StockEventsSettings.prototype, "type", void 0);
    __decorate([
        Property('')
    ], StockEventsSettings.prototype, "text", void 0);
    __decorate([
        Property('')
    ], StockEventsSettings.prototype, "description", void 0);
    __decorate([
        Property()
    ], StockEventsSettings.prototype, "date", void 0);
    __decorate([
        Complex({ color: 'black', width: 1 }, StockChartBorder)
    ], StockEventsSettings.prototype, "border", void 0);
    __decorate([
        Property('transparent')
    ], StockEventsSettings.prototype, "background", void 0);
    __decorate([
        Property(true)
    ], StockEventsSettings.prototype, "showOnSeries", void 0);
    __decorate([
        Property('close')
    ], StockEventsSettings.prototype, "placeAt", void 0);
    __decorate([
        Complex(Theme.stockEventFont, StockChartFont)
    ], StockEventsSettings.prototype, "textStyle", void 0);
    __decorate([
        Property([])
    ], StockEventsSettings.prototype, "seriesIndexes", void 0);
    return StockEventsSettings;
}(ChildProperty));
export { StockEventsSettings };
