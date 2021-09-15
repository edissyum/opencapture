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
/* eslint-disable @typescript-eslint/ban-types */
/* eslint-disable jsdoc/require-returns */
/* eslint-disable @typescript-eslint/no-inferrable-types */
/* eslint-disable valid-jsdoc */
/* eslint-disable jsdoc/require-param */
import { Series } from '../series/chart-series';
import { TechnicalAnalysis } from './indicator-base';
/**
 * `StochasticIndicator` module is used to render stochastic indicator.
 */
var StochasticIndicator = /** @class */ (function (_super) {
    __extends(StochasticIndicator, _super);
    function StochasticIndicator() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    /**
     * Defines the collection of series that represents the stochastic indicator
     *
     * @private
     */
    StochasticIndicator.prototype.initSeriesCollection = function (indicator, chart) {
        _super.prototype.initSeriesCollection.call(this, indicator, chart);
        var periodLine = new Series(indicator, 'targetSeries', {}, true);
        this.setSeriesProperties(periodLine, indicator, 'PeriodLine', indicator.periodLine.color, indicator.periodLine.width, chart);
        if (indicator.showZones) {
            var upperSeries = new Series(indicator, 'targetSeries', {}, true);
            this.setSeriesProperties(upperSeries, indicator, 'UpperLine', indicator.upperLine.color, indicator.upperLine.width, chart);
            var lowerSeries = new Series(indicator, 'targetSeries', {}, true);
            this.setSeriesProperties(lowerSeries, indicator, 'LowerLine', indicator.lowerLine.color, indicator.lowerLine.width, chart);
        }
    };
    /**
     * Defines the predictions based on stochastic approach
     *
     * @private
     */
    StochasticIndicator.prototype.initDataSource = function (indicator, chart) {
        var signalCollection = [];
        var upperCollection = [];
        var lowerCollection = [];
        var periodCollection = [];
        var source = [];
        //prepare data
        var validData = indicator.points;
        if (validData.length && validData.length >= indicator.period) {
            if (indicator.showZones) {
                for (var i = 0; i < validData.length; i++) {
                    upperCollection.push(this.getDataPoint(validData[i].x, indicator.overBought, validData[i], indicator.targetSeries[2], upperCollection.length));
                    lowerCollection.push(this.getDataPoint(validData[i].x, indicator.overSold, validData[i], indicator.targetSeries[3], lowerCollection.length));
                }
            }
            source = this.calculatePeriod(indicator.period, indicator.kPeriod, validData, indicator.targetSeries[1]);
            periodCollection = this.smaCalculation(indicator.period, indicator.kPeriod, source, indicator.targetSeries[1]);
            signalCollection = this.smaCalculation(indicator.period + indicator.kPeriod - 1, indicator.dPeriod, source, indicator.targetSeries[0]);
        }
        this.setSeriesRange(signalCollection, indicator, indicator.targetSeries[0]);
        this.setSeriesRange(periodCollection, indicator, indicator.targetSeries[1]);
        if (indicator.showZones) {
            this.setSeriesRange(upperCollection, indicator, indicator.targetSeries[2]);
            this.setSeriesRange(lowerCollection, indicator, indicator.targetSeries[3]);
        }
    };
    /**
     * Calculates the SMA Values
     *
     * @private
     */
    StochasticIndicator.prototype.smaCalculation = function (period, kPeriod, data, sourceSeries) {
        var pointCollection = [];
        if (data.length >= period + kPeriod) {
            var count = period + (kPeriod - 1);
            var temp = [];
            var values = [];
            for (var i = 0; i < data.length; i++) {
                var value = Number(data[i].y);
                temp.push(value);
            }
            var length_1 = temp.length;
            while (length_1 >= count) {
                var sum = 0;
                for (var i = period - 1; i < (period + kPeriod - 1); i++) {
                    sum = sum + temp[i];
                }
                sum = sum / kPeriod;
                values.push(sum.toFixed(2));
                temp.splice(0, 1);
                length_1 = temp.length;
            }
            var len = count - 1;
            for (var i = 0; i < data.length; i++) {
                if (!(i < len)) {
                    pointCollection.push(this.getDataPoint(data[i].x, Number(values[i - len]), data[i], sourceSeries, pointCollection.length));
                    data[i].y = Number((values[i - len]));
                }
            }
        }
        return pointCollection;
    };
    /**
     * Calculates the period line values.
     *
     * @private
     */
    StochasticIndicator.prototype.calculatePeriod = function (period, kPeriod, data, series) {
        var lowValues = [];
        var highValues = [];
        var closeValues = [];
        var modifiedSource = [];
        for (var j = 0; j < data.length; j++) {
            lowValues[j] = data[j].low;
            highValues[j] = data[j].high;
            closeValues[j] = data[j].close;
        }
        if (data.length > period) {
            var mins = [];
            var maxs = [];
            for (var i = 0; i < period - 1; ++i) {
                maxs.push(0);
                mins.push(0);
                modifiedSource.push(this.getDataPoint(data[i].x, data[i].close, data[i], series, modifiedSource.length));
            }
            for (var i = period - 1; i < data.length; ++i) {
                var min = Number.MAX_VALUE;
                var max = Number.MIN_VALUE;
                for (var j = 0; j < period; ++j) {
                    min = Math.min(min, lowValues[i - j]);
                    max = Math.max(max, highValues[i - j]);
                }
                maxs.push(max);
                mins.push(min);
            }
            for (var i = period - 1; i < data.length; ++i) {
                var top_1 = 0;
                var bottom = 0;
                top_1 += closeValues[i] - mins[i];
                bottom += maxs[i] - mins[i];
                modifiedSource.push(this.getDataPoint(data[i].x, (top_1 / bottom) * 100, data[i], series, modifiedSource.length));
            }
        }
        return modifiedSource;
    };
    /**
     * To destroy the Stocastic Indicator.
     *
     * @returns {void}
     * @private
     */
    StochasticIndicator.prototype.destroy = function () {
        /**
         * Destroys the stochastic indicator
         */
    };
    /**
     * Get module name.
     */
    StochasticIndicator.prototype.getModuleName = function () {
        /**
         * Returns the module name of the indicator.
         */
        return 'StochasticIndicator';
    };
    return StochasticIndicator;
}(TechnicalAnalysis));
export { StochasticIndicator };
