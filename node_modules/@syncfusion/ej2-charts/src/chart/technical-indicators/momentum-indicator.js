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
 * `MomentumIndicator` module is used to render Momentum indicator.
 */
var MomentumIndicator = /** @class */ (function (_super) {
    __extends(MomentumIndicator, _super);
    function MomentumIndicator() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    /**
     * Defines the collection of series to represent a momentum indicator
     *
     * @private
     */
    MomentumIndicator.prototype.initSeriesCollection = function (indicator, chart) {
        _super.prototype.initSeriesCollection.call(this, indicator, chart);
        var upperLine = new Series(indicator, 'targetSeries', {}, true);
        _super.prototype.setSeriesProperties.call(this, upperLine, indicator, 'UpperLine', indicator.upperLine.color, indicator.upperLine.width, chart);
    };
    /**
     * Defines the predictions using momentum approach
     *
     * @private
     */
    MomentumIndicator.prototype.initDataSource = function (indicator, chart) {
        var upperCollection = [];
        var signalCollection = [];
        var validData = indicator.points;
        if (validData && validData.length) {
            var upperSeries = indicator.targetSeries[1];
            var signalSeries = indicator.targetSeries[0];
            var length_1 = indicator.period;
            if (validData.length >= indicator.period) {
                for (var i = 0; i < validData.length; i++) {
                    upperCollection.push(this.getDataPoint(validData[i].x, 100, validData[i], upperSeries, upperCollection.length));
                    if (!(i < length_1)) {
                        signalCollection.push(this.getDataPoint(validData[i].x, (Number(validData[i].close) / Number(validData[i - length_1].close) * 100), validData[i], signalSeries, signalCollection.length));
                    }
                }
            }
            this.setSeriesRange(signalCollection, indicator, indicator.targetSeries[0]);
            this.setSeriesRange(upperCollection, indicator, indicator.targetSeries[1]);
        }
    };
    /**
     * To destroy the momentum indicator
     *
     * @returns {void}
     * @private
     */
    MomentumIndicator.prototype.destroy = function () {
        /**
         * Destroys the momentum indicator
         */
    };
    /**
     * Get module name.
     */
    MomentumIndicator.prototype.getModuleName = function () {
        /**
         * Returns the module name of the series
         */
        return 'MomentumIndicator';
    };
    return MomentumIndicator;
}(TechnicalAnalysis));
export { MomentumIndicator };
