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
/* eslint-disable @typescript-eslint/no-inferrable-types */
/* eslint-disable valid-jsdoc */
/* eslint-disable jsdoc/require-param */
import { Series } from '../series/chart-series';
import { TechnicalAnalysis } from './indicator-base';
/**
 * `RsiIndicator` module is used to render RSI indicator.
 */
var RsiIndicator = /** @class */ (function (_super) {
    __extends(RsiIndicator, _super);
    function RsiIndicator() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    /**
     * Initializes the series collection to represent the RSI Indicator
     *
     * @private
     */
    RsiIndicator.prototype.initSeriesCollection = function (indicator, chart) {
        _super.prototype.initSeriesCollection.call(this, indicator, chart);
        if (indicator.showZones) {
            var lowerLine = new Series(indicator, 'targetSeries', {}, true);
            _super.prototype.setSeriesProperties.call(this, lowerLine, indicator, 'LowerLine', indicator.lowerLine.color, indicator.lowerLine.width, chart);
            var upperLine = new Series(indicator, 'targetSeries', {}, true);
            _super.prototype.setSeriesProperties.call(this, upperLine, indicator, 'UpperLine', indicator.upperLine.color, indicator.upperLine.width, chart);
        }
    };
    /**
     * Defines the predictions using RSI approach
     *
     * @private
     */
    RsiIndicator.prototype.initDataSource = function (indicator, chart) {
        var signalCollection = [];
        var lowerCollection = [];
        var upperCollection = [];
        var signalSeries = indicator.targetSeries[0];
        //prepare data
        var validData = indicator.points;
        if (validData.length && validData.length >= indicator.period) {
            //Find upper band and lower band values
            if (indicator.showZones) {
                for (var i = 0; i < validData.length; i++) {
                    upperCollection.push(this.getDataPoint(validData[i].x, indicator.overBought, validData[i], indicator.targetSeries[1], upperCollection.length));
                    lowerCollection.push(this.getDataPoint(validData[i].x, indicator.overSold, validData[i], indicator.targetSeries[2], lowerCollection.length));
                }
            }
            //Find signal line value
            var prevClose = Number(validData[0].close);
            var gain = 0;
            var loss = 0;
            for (var i = 1; i <= indicator.period; i++) {
                var close_1 = Number(validData[i].close);
                if (close_1 > prevClose) {
                    gain += close_1 - prevClose;
                }
                else {
                    loss += prevClose - close_1;
                }
                prevClose = close_1;
            }
            gain = gain / indicator.period;
            loss = loss / indicator.period;
            signalCollection.push(this.getDataPoint(validData[indicator.period].x, 100 - (100 / (1 + gain / loss)), validData[indicator.period], signalSeries, signalCollection.length));
            for (var j = indicator.period + 1; j < validData.length; j++) {
                var close_2 = Number(validData[j].close);
                if (close_2 > prevClose) {
                    gain = (gain * (indicator.period - 1) + (close_2 - prevClose)) / indicator.period;
                    loss = (loss * (indicator.period - 1)) / indicator.period;
                }
                else if (close_2 < prevClose) {
                    loss = (loss * (indicator.period - 1) + (prevClose - close_2)) / indicator.period;
                    gain = (gain * (indicator.period - 1)) / indicator.period;
                }
                prevClose = close_2;
                signalCollection.push(this.getDataPoint(validData[j].x, 100 - (100 / (1 + gain / loss)), validData[j], signalSeries, signalCollection.length));
            }
        }
        this.setSeriesRange(signalCollection, indicator, indicator.targetSeries[0]);
        if (indicator.showZones) {
            this.setSeriesRange(upperCollection, indicator, indicator.targetSeries[1]);
            this.setSeriesRange(lowerCollection, indicator, indicator.targetSeries[2]);
        }
    };
    /**
     * To destroy the RSI Indicator.
     *
     * @returns {void}
     * @private
     */
    RsiIndicator.prototype.destroy = function () {
        /**
         * Destroys the RSI Indicator
         */
    };
    /**
     * Get module name.
     */
    RsiIndicator.prototype.getModuleName = function () {
        /**
         * Returns the module name of the indicator.
         */
        return 'RsiIndicator';
    };
    return RsiIndicator;
}(TechnicalAnalysis));
export { RsiIndicator };
