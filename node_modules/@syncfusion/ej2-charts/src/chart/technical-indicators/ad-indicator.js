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
 * `AccumulationDistributionIndicator` module is used to render accumulation distribution indicator.
 */
var AccumulationDistributionIndicator = /** @class */ (function (_super) {
    __extends(AccumulationDistributionIndicator, _super);
    function AccumulationDistributionIndicator() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    /**
     * Defines the predictions using accumulation distribution approach
     *
     * @private
     */
    AccumulationDistributionIndicator.prototype.initDataSource = function (indicator) {
        var adPoints = [];
        var validData = indicator.points;
        if (validData.length > 0 && validData.length > indicator.period) {
            adPoints = this.calculateADPoints(indicator, validData);
        }
        this.setSeriesRange(adPoints, indicator);
    };
    /**
     *  Calculates the Accumulation Distribution values
     *
     * @private
     */
    AccumulationDistributionIndicator.prototype.calculateADPoints = function (indicator, validData) {
        var temp = [];
        var sum = 0;
        var i = 0;
        var value = 0;
        var high = 0;
        var low = 0;
        var close = 0;
        var signalSeries = indicator.targetSeries[0];
        for (i = 0; i < validData.length; i++) {
            high = Number(validData[i].high);
            low = Number(validData[i].low);
            close = Number(validData[i].close);
            /**
             * Money Flow Multiplier = [(Close -  Low) - (High - Close)] /(High - Low)
             * Money Flow Volume = Money Flow Multiplier x Volume for the Period
             * ADL = Previous ADL + Current Period's Money Flow Volume
             */
            value = ((close - low) - (high - close)) / (high - low);
            /**
             * Sum is to calculate the Y values of the Accumulation distribution indicator
             */
            sum = sum + value * Number(validData[i].volume);
            /**
             * To calculate the x and y values for the Accumulation distribution indicator
             */
            temp[i] = this.getDataPoint(validData[i].x, sum, validData[i], signalSeries, temp.length);
        }
        return temp;
    };
    /**
     * To destroy the Accumulation Distribution Technical Indicator.
     *
     * @returns {void}
     * @private
     */
    AccumulationDistributionIndicator.prototype.destroy = function () {
        /**
         * Destroys the Accumulation Distribution Technical indicator
         */
    };
    /**
     * Get module name.
     */
    AccumulationDistributionIndicator.prototype.getModuleName = function () {
        /**
         * Returns the module name of the Indicator
         */
        return 'AccumulationDistributionIndicator';
    };
    return AccumulationDistributionIndicator;
}(TechnicalAnalysis));
export { AccumulationDistributionIndicator };
