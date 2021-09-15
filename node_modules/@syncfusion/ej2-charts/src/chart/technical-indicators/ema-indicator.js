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
import { firstToLowerCase } from '../../common/utils/helper';
import { TechnicalAnalysis } from './indicator-base';
/**
 * `EmaIndicator` module is used to render EMA indicator.
 */
var EmaIndicator = /** @class */ (function (_super) {
    __extends(EmaIndicator, _super);
    function EmaIndicator() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    /**
     * Defines the predictions based on EMA approach
     *
     * @private
     */
    EmaIndicator.prototype.initDataSource = function (indicator, chart) {
        var field = firstToLowerCase(indicator.field);
        var xField = 'x';
        var emaPoints = [];
        var signalSeries = indicator.targetSeries[0];
        //prepare data
        var validData = indicator.points;
        if (validData && validData.length && validData.length >= indicator.period) {
            //find initial average
            var sum = 0;
            var average = 0;
            //smoothing factor
            var k = (2 / (indicator.period + 1));
            for (var i = 0; i < indicator.period; i++) {
                sum += validData[i][field];
            }
            average = sum / indicator.period;
            emaPoints.push(this.getDataPoint(validData[indicator.period - 1][xField], average, validData[indicator.period - 1], signalSeries, emaPoints.length));
            var index = indicator.period;
            while (index < validData.length) {
                //previous average
                var prevAverage = emaPoints[index - indicator.period][signalSeries.yName];
                var yValue = (validData[index][field] - prevAverage) * k + prevAverage;
                emaPoints.push(this.getDataPoint(validData[index][xField], yValue, validData[index], signalSeries, emaPoints.length));
                index++;
            }
        }
        this.setSeriesRange(emaPoints, indicator);
    };
    /**
     * To destroy the EMA Indicator
     *
     * @returns {void}
     * @private
     */
    EmaIndicator.prototype.destroy = function () {
        /**
         * Destroys the EMA Indicator
         */
    };
    /**
     * Get module name.
     */
    EmaIndicator.prototype.getModuleName = function () {
        /**
         * Returns the module name of the series
         */
        return 'EmaIndicator';
    };
    return EmaIndicator;
}(TechnicalAnalysis));
export { EmaIndicator };
