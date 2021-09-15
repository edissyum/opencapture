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
import { Series } from '../series/chart-series';
import { ColumnBase } from './column-base';
import { Axis } from '../axis/axis';
/**
 * `Pareto series` module used to render the Pareto series.
 */
var ParetoSeries = /** @class */ (function (_super) {
    __extends(ParetoSeries, _super);
    function ParetoSeries() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.paretoAxes = [];
        return _this;
    }
    /**
     * Defines the Line initialization
     */
    ParetoSeries.prototype.initSeries = function (targetSeries, chart) {
        var series = new Series(chart, 'series', targetSeries.properties, true);
        series.name = 'Pareto';
        series.yAxisName = targetSeries.yAxisName + '_CumulativeAxis';
        series.category = 'Pareto';
        targetSeries.category = 'Pareto';
        series.type = 'Line';
        series.interior = chart.themeStyle.errorBar;
        chart.visibleSeries.push(series);
        this.initAxis(targetSeries, series, chart);
    };
    /**
     * Defines the Axis initialization for Line
     */
    ParetoSeries.prototype.initAxis = function (paretoSeries, targetSeries, chart) {
        var isExist = this.paretoAxes.some(function (currentAxis) {
            return currentAxis.name === targetSeries.yAxisName;
        });
        if (!isExist) {
            var secondaryAxis = (paretoSeries.yAxisName ? chart.axes.filter(function (axis) {
                return axis.name === paretoSeries.yAxisName;
            })[0] : chart.primaryYAxis);
            var newAxis = new Axis(chart, 'axis', {
                name: targetSeries.yAxisName,
                majorGridLines: {
                    width: 0
                },
                majorTickLines: secondaryAxis.majorTickLines,
                lineStyle: secondaryAxis.lineStyle,
                minimum: 0,
                maximum: 100,
                rowIndex: secondaryAxis.rowIndex,
                opposedPosition: true,
                labelFormat: '{value}%'
            });
            this.paretoAxes.push(newAxis);
        }
    };
    /**
     * Render Pareto series.
     *
     * @returns {void}
     * @private
     */
    ParetoSeries.prototype.render = function (series) {
        series.chart.columnSeriesModule.render(series);
    };
    /**
     * To perform the cumulative calculation for pareto series.
     */
    ParetoSeries.prototype.performCumulativeCalculation = function (json, series) {
        var data = json;
        var sum = 0;
        var count = 0;
        var length = data.length;
        for (var i = 0; i < length; i++) {
            sum += data[i][series.yName];
        }
        for (var i = 0; i < length; i++) {
            count = count + data[i][series.yName];
            data[i][series.yName] = Math.round((count / sum) * 100);
        }
        return data;
    };
    /**
     * Animates the series.
     *
     * @param  {Series} series - Defines the series to animate.
     * @returns {void}
     */
    ParetoSeries.prototype.doAnimation = function (series) {
        this.animate(series);
    };
    /**
     * Get module name.
     */
    ParetoSeries.prototype.getModuleName = function () {
        return 'ParetoSeries';
        /**
         * return the module name
         */
    };
    /**
     * To destroy the pareto series.
     *
     * @returns {void}
     * @private
     */
    ParetoSeries.prototype.destroy = function () {
        /**
         * Destroy method performed here
         */
    };
    return ParetoSeries;
}(ColumnBase));
export { ParetoSeries };
