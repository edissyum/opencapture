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
 * `TmaIndicator` module is used to render TMA indicator.
 */
var TmaIndicator = /** @class */ (function (_super) {
    __extends(TmaIndicator, _super);
    function TmaIndicator() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    /**
     * Defines the predictions based on TMA approach
     *
     * @private
     */
    TmaIndicator.prototype.initDataSource = function (indicator, chart) {
        var tmaPoints = [];
        var field = firstToLowerCase(indicator.field);
        var xField = 'x';
        //prepare data
        var validData = indicator.points;
        if (validData && validData.length && validData.length >= indicator.period) {
            var signalSeries = indicator.targetSeries[0];
            //prepare data
            var validData_1 = indicator.points;
            if (validData_1.length && validData_1.length >= indicator.period) {
                var sum = 0;
                var smaValues = [];
                //sma values
                var index = 0;
                var length_1 = validData_1.length;
                var period = indicator.period;
                while (length_1 >= period) {
                    sum = 0;
                    index = validData_1.length - length_1;
                    for (var j = index; j < index + period; j++) {
                        sum = sum + validData_1[j][field];
                    }
                    sum = sum / period;
                    smaValues.push(sum);
                    length_1--;
                }
                //initial values
                for (var k = 0; k < period - 1; k++) {
                    sum = 0;
                    for (var j = 0; j < k + 1; j++) {
                        sum = sum + validData_1[j][field];
                    }
                    sum = sum / (k + 1);
                    smaValues.splice(k, 0, sum);
                }
                index = indicator.period;
                while (index <= smaValues.length) {
                    sum = 0;
                    for (var j = index - indicator.period; j < index; j++) {
                        sum = sum + smaValues[j];
                    }
                    sum = sum / indicator.period;
                    tmaPoints.push(this.getDataPoint(validData_1[index - 1][xField], sum, validData_1[index - 1], signalSeries, tmaPoints.length));
                    index++;
                }
            }
        }
        this.setSeriesRange(tmaPoints, indicator);
    };
    /**
     * To destroy the TMA indicator.
     *
     * @returns {void}
     * @private
     */
    TmaIndicator.prototype.destroy = function () {
        /**
         * Destroys the TMA Indicator
         */
    };
    /**
     * Get module name.
     */
    TmaIndicator.prototype.getModuleName = function () {
        /**
         * Returns the module name of the series
         */
        return 'TmaIndicator';
    };
    return TmaIndicator;
}(TechnicalAnalysis));
export { TmaIndicator };
