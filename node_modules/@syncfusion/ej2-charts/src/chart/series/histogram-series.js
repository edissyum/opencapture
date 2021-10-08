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
/* eslint-disable jsdoc/require-returns */
/* eslint-disable @typescript-eslint/ban-types */
/* eslint-disable @typescript-eslint/no-inferrable-types */
/* eslint-disable valid-jsdoc */
/* eslint-disable jsdoc/require-param */
import { sum, getPoint, templateAnimate } from '../../common/utils/helper';
import { PathOption } from '@syncfusion/ej2-svg-base';
import { ColumnSeries } from './column-series';
/**
 * `HistogramSeries` Module used to render the histogram series.
 */
var HistogramSeries = /** @class */ (function (_super) {
    __extends(HistogramSeries, _super);
    function HistogramSeries() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    /**
     * Render Histogram series.
     *
     * @returns {void}
     * @private
     */
    HistogramSeries.prototype.render = function (series) {
        _super.prototype.render.call(this, series);
        if (series.showNormalDistribution) {
            this.renderNormalDistribution(series);
        }
    };
    /**
     * To calculate bin interval for Histogram series.
     *
     * @returns {void}
     * @private
     */
    HistogramSeries.prototype.calculateBinInterval = function (yValues, series) {
        var mean = sum(yValues) / yValues.length;
        var sumValue = 0;
        for (var _i = 0, yValues_1 = yValues; _i < yValues_1.length; _i++) {
            var value = yValues_1[_i];
            sumValue += (value - mean) * (value - mean);
        }
        series.histogramValues.mean = mean;
        series.histogramValues.sDValue = Math.round(Math.sqrt(Math.abs(sumValue / yValues.length - 1)));
        series.histogramValues.binWidth = series.binInterval ||
            Math.round((3.5 * series.histogramValues.sDValue) / Math.pow(yValues.length, 1 / 3)) || 1;
    };
    /**
     * Add data points for Histogram series.
     *
     * @returns {object[]} data
     * @private
     */
    HistogramSeries.prototype.processInternalData = function (data, series) {
        var _a;
        var updatedData = [];
        var yValues = [];
        var keys = Object.keys(data);
        for (var i = 0; i < keys.length; i++) {
            var key = keys[i];
            yValues.push(data[key][series.yName]);
        }
        series.histogramValues = {
            yValues: yValues
        };
        var min = Math.min.apply(Math, series.histogramValues.yValues);
        var max = Math.max.apply(Math, series.histogramValues.yValues);
        this.calculateBinInterval(series.histogramValues.yValues, series);
        var binWidth = series.histogramValues.binWidth;
        var yCount;
        for (var j = 0; j < data.length;) {
            yCount = yValues.filter(function (y) { return y >= min && y < (min + (binWidth)); }).length;
            if ((min + binWidth) === max) {
                yCount += yValues.filter(function (y) { return y >= max; }).length;
            }
            updatedData.push((_a = {
                    'x': min + binWidth / 2
                },
                _a[series.yName] = yCount,
                _a));
            min = min + binWidth;
            j += yCount;
        }
        return updatedData;
    };
    /**
     * Calculates bin values.
     *
     * @returns null
     * @private
     */
    HistogramSeries.prototype.calculateBinValues = function (series) {
        var yValuesCount = series.histogramValues.yValues.length;
        var binWidth = series.histogramValues.binWidth;
        var mean = series.histogramValues.mean;
        var sDValue = series.histogramValues.sDValue;
        var pointsCount = 500;
        var min = series.xAxis.minimum ? parseInt(series.xAxis.minimum.toString()) : series.xMin;
        var max = series.xAxis.maximum ? parseInt(series.xAxis.maximum.toString()) : series.xMax;
        var points = series.points.length;
        var xValue;
        var yValue;
        var del = (max - min) / (pointsCount - 1);
        if (points) {
            for (var i = 0; i < pointsCount; i++) {
                xValue = min + i * del;
                yValue = (Math.exp(-(xValue - mean) * (xValue - mean) / (2 * sDValue * sDValue)) /
                    (sDValue * Math.sqrt(2 * Math.PI))) * binWidth * yValuesCount;
                series.yMin = series.yMin > yValue ? yValue : series.yMin;
                series.yMax = series.yMax < yValue ? yValue : series.yMax;
            }
        }
    };
    /**
     * Render Normal Distribution for Histogram series.
     *
     * @returns {void}
     * @private
     */
    HistogramSeries.prototype.renderNormalDistribution = function (series) {
        var min = series.xAxis.actualRange.min;
        var max = series.xAxis.actualRange.max;
        var xValue;
        var pointLocation;
        var yValue;
        var direction = '';
        var startPoint = 'M';
        var yValuesCount = series.histogramValues.yValues.length;
        var binWidth = series.histogramValues.binWidth;
        var mean = series.histogramValues.mean;
        var sDValue = series.histogramValues.sDValue;
        var pointsCount = 500;
        var del = (max - min) / (pointsCount - 1);
        var points = series.points.length;
        if (points) {
            for (var i = 0; i < pointsCount; i++) {
                xValue = min + i * del;
                yValue = Math.exp(-(xValue - mean) * (xValue - mean) / (2 * sDValue * sDValue)) /
                    (sDValue * Math.sqrt(2 * Math.PI));
                pointLocation = getPoint(xValue, yValue * binWidth * yValuesCount, series.xAxis, series.yAxis, series.chart.requireInvertedAxis);
                direction += startPoint + ' ' + (pointLocation.x) + ' ' + (pointLocation.y) + ' ';
                startPoint = 'L';
            }
        }
        var distributionLine = series.chart.renderer.drawPath(new PathOption(series.chart.element.id + '_Series_' + series.index + '_NDLine', 'transparent', 2, series.chart.themeStyle.errorBar, series.opacity, series.dashArray, direction), new Int32Array([series.clipRect.x, series.clipRect.y]));
        distributionLine.style.visibility = (!series.chart.enableCanvas) ? ((series.animation.enable &&
            series.chart.animateSeries) ? 'hidden' : 'visible') : null;
        if (!series.chart.enableCanvas) {
            series.seriesElement.appendChild(distributionLine);
        }
    };
    /**
     * Animates the series.
     *
     * @param  {Series} series - Defines the series to animate.
     * @returns {void}
     */
    HistogramSeries.prototype.doAnimation = function (series) {
        _super.prototype.doAnimation.call(this, series);
        if (series.showNormalDistribution) {
            templateAnimate(series.seriesElement.lastElementChild, series.animation.duration, 500, 'FadeIn');
        }
    };
    /**
     * Get module name.
     */
    HistogramSeries.prototype.getModuleName = function () {
        return 'HistogramSeries';
        /**
         * return the module name
         */
    };
    /**
     * To destroy the histogram series.
     *
     * @returns {void}
     * @private
     */
    HistogramSeries.prototype.destroy = function () {
        /**
         * Destroy method performed here
         */
    };
    return HistogramSeries;
}(ColumnSeries));
export { HistogramSeries };
