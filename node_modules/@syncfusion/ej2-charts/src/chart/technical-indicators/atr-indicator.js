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
import { TechnicalAnalysis } from './indicator-base';
/**
 * `AtrIndicator` module is used to render ATR indicator.
 */
var AtrIndicator = /** @class */ (function (_super) {
    __extends(AtrIndicator, _super);
    function AtrIndicator() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    /**
     * Defines the predictions using Average True Range approach
     *
     * @private
     */
    AtrIndicator.prototype.initDataSource = function (indicator, chart) {
        var validData = indicator.points;
        if (validData.length > 0 && validData.length > indicator.period) {
            this.calculateATRPoints(indicator, validData);
        }
    };
    /**
     *  To calculate Average True Range indicator points
     *
     * @private
     */
    AtrIndicator.prototype.calculateATRPoints = function (indicator, validData) {
        var average = 0;
        var highLow = 0;
        var highClose = 0;
        var lowClose = 0;
        var trueRange = 0;
        var points = [];
        var temp = [];
        var period = indicator.period;
        var sum = 0;
        var y = 'y';
        var signalSeries = indicator.targetSeries[0];
        for (var i = 0; i < validData.length; i++) {
            /**
             * Current High less the current Low
             * Current High less the previous Close (absolute value)
             * Current Low less the previous Close (absolute value)
             */
            highLow = Number(validData[i].high) - Number(validData[i].low);
            if (i > 0) {
                //
                highClose = Math.abs(Number(validData[i].high) - Number(validData[i - 1].close));
                lowClose = Math.abs(Number(validData[i].low) - Number(validData[i - 1].close));
            }
            /**
             * To find the maximum of highLow, highClose, lowClose
             */
            trueRange = Math.max(highLow, highClose, lowClose);
            sum = sum + trueRange;
            /**
             * Push the x and y values for the Average true range indicator
             */
            if (i >= period) {
                average = (Number(temp[i - 1][y]) * (period - 1) + trueRange) / period;
                points.push(this.getDataPoint(validData[i].x, average, validData[i], signalSeries, points.length));
            }
            else {
                average = sum / period;
                if (i === period - 1) {
                    points.push(this.getDataPoint(validData[i].x, average, validData[i], signalSeries, points.length));
                }
            }
            temp[i] = { x: validData[i].x, y: average };
        }
        this.setSeriesRange(points, indicator);
    };
    /**
     * To destroy the Average true range indicator.
     *
     * @returns {void}
     * @private
     */
    AtrIndicator.prototype.destroy = function () {
        /**
         * Destroy the Average true range indicator
         */
    };
    /**
     * Get module name.
     */
    AtrIndicator.prototype.getModuleName = function () {
        /**
         * Returns the module name of the Indicator
         */
        return 'AtrIndicator';
    };
    return AtrIndicator;
}(TechnicalAnalysis));
export { AtrIndicator };
