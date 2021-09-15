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
import { Series } from '../series/chart-series';
import { TechnicalAnalysis } from './indicator-base';
/**
 * `BollingerBands` module is used to render bollinger band indicator.
 */
var BollingerBands = /** @class */ (function (_super) {
    __extends(BollingerBands, _super);
    function BollingerBands() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    /**
     * Initializes the series collection to represent bollinger band
     */
    BollingerBands.prototype.initSeriesCollection = function (indicator, chart) {
        indicator.targetSeries = [];
        var rangeArea = new Series(indicator, 'targetSeries', {}, true);
        rangeArea.type = 'RangeArea';
        if (indicator.bandColor !== 'transparent' && indicator.bandColor !== 'none') {
            this.setSeriesProperties(rangeArea, indicator, 'BollingerBand', indicator.bandColor, 0, chart);
        }
        var signalLine = new Series(indicator, 'targetSeries', {}, true);
        this.setSeriesProperties(signalLine, indicator, 'BollingerBand', indicator.fill, indicator.width, chart);
        var upperLine = new Series(indicator, 'targetSeries', {}, true);
        this.setSeriesProperties(upperLine, indicator, 'UpperLine', indicator.upperLine.color, indicator.upperLine.width, chart);
        var lowerLine = new Series(indicator, 'targetSeries', {}, true);
        this.setSeriesProperties(lowerLine, indicator, 'LowerLine', indicator.lowerLine.color, indicator.lowerLine.width, chart);
    };
    /**
     * Defines the predictions using Bollinger Band Approach
     *
     * @private
     */
    BollingerBands.prototype.initDataSource = function (indicator, chart) {
        var enableBand = indicator.bandColor !== 'transparent' && indicator.bandColor !== 'none';
        var start = enableBand ? 1 : 0;
        var signalCollection = [];
        var upperCollection = [];
        var lowerCollection = [];
        var bandCollection = [];
        var upperSeries = indicator.targetSeries[start + 1];
        var lowerSeries = indicator.targetSeries[start + 2];
        var signalSeries = indicator.targetSeries[start];
        var rangeAreaSeries = enableBand ? indicator.targetSeries[0] : null;
        //prepare data
        var validData = indicator.points;
        if (validData.length && validData.length >= indicator.period) {
            var sum = 0;
            var deviationSum = 0;
            var multiplier = indicator.standardDeviation;
            var limit = validData.length;
            var length_1 = Math.round(indicator.period);
            var smaPoints = [];
            var deviations = [];
            var bollingerPoints = [];
            for (var i_1 = 0; i_1 < length_1; i_1++) {
                sum += Number(validData[i_1].close);
            }
            var sma = sum / indicator.period;
            for (var i_2 = 0; i_2 < limit; i_2++) {
                var y = Number(validData[i_2].close);
                if (i_2 >= length_1 - 1 && i_2 < limit) {
                    if (i_2 - indicator.period >= 0) {
                        var diff = y - Number(validData[i_2 - length_1].close);
                        sum = sum + diff;
                        sma = sum / (indicator.period);
                        smaPoints[i_2] = sma;
                        deviations[i_2] = Math.pow(y - sma, 2);
                        deviationSum += deviations[i_2] - deviations[i_2 - length_1];
                    }
                    else {
                        smaPoints[i_2] = sma;
                        deviations[i_2] = Math.pow(y - sma, 2);
                        deviationSum += deviations[i_2];
                    }
                    var range = Math.sqrt(deviationSum / (indicator.period));
                    var lowerBand = smaPoints[i_2] - (multiplier * range);
                    var upperBand = smaPoints[i_2] + (multiplier * range);
                    if (i_2 + 1 === length_1) {
                        for (var j_1 = 0; j_1 < length_1 - 1; j_1++) {
                            bollingerPoints[j_1] = {
                                'X': validData[j_1].x, 'mb': smaPoints[i_2],
                                'lb': lowerBand, 'ub': upperBand, visible: true
                            };
                        }
                    }
                    bollingerPoints[i_2] = {
                        'X': validData[i_2].x, 'mb': smaPoints[i_2],
                        'lb': lowerBand, 'ub': upperBand, visible: true
                    };
                }
                else {
                    if (i_2 < indicator.period - 1) {
                        smaPoints[i_2] = sma;
                        deviations[i_2] = Math.pow(y - sma, 2);
                        deviationSum += deviations[i_2];
                    }
                }
            }
            var i = -1;
            var j = -1;
            for (var k = 0; k < limit; k++) {
                if (k >= (length_1 - 1)) {
                    var ub = 'ub';
                    var lb = 'lb';
                    var mb = 'mb';
                    upperCollection.push(this.getDataPoint(validData[k].x, bollingerPoints[k][ub], validData[k], upperSeries, upperCollection.length));
                    lowerCollection.push(this.getDataPoint(validData[k].x, bollingerPoints[k][lb], validData[k], lowerSeries, lowerCollection.length));
                    signalCollection.push(this.getDataPoint(validData[k].x, bollingerPoints[k][mb], validData[k], signalSeries, signalCollection.length));
                    if (enableBand) {
                        bandCollection.push(this.getRangePoint(validData[k].x, upperCollection[++i].y, lowerCollection[++j].y, validData[k], rangeAreaSeries, bandCollection.length));
                    }
                }
            }
        }
        if (enableBand) {
            this.setSeriesRange(bandCollection, indicator, indicator.targetSeries[0]);
        }
        this.setSeriesRange(signalCollection, indicator, indicator.targetSeries[start]);
        this.setSeriesRange(upperCollection, indicator, indicator.targetSeries[start + 1]);
        this.setSeriesRange(lowerCollection, indicator, indicator.targetSeries[start + 2]);
    };
    /**
     * To destroy the Bollinger Band.
     *
     * @returns {void}
     * @private
     */
    BollingerBands.prototype.destroy = function () {
        /**
         * Destroys the bollinger band
         */
    };
    /**
     * Get module name.
     */
    BollingerBands.prototype.getModuleName = function () {
        /**
         * Returns the module name of the series
         */
        return 'BollingerBandsIndicator';
    };
    return BollingerBands;
}(TechnicalAnalysis));
export { BollingerBands };
