import { TechnicalIndicator } from './technical-indicator';
import { TechnicalAnalysis } from './indicator-base';
import { Chart } from '../chart';
/**
 * `StochasticIndicator` module is used to render stochastic indicator.
 */
export declare class StochasticIndicator extends TechnicalAnalysis {
    /**
     * Defines the collection of series that represents the stochastic indicator
     *
     * @private
     */
    initSeriesCollection(indicator: TechnicalIndicator, chart: Chart): void;
    /**
     * Defines the predictions based on stochastic approach
     *
     * @private
     */
    initDataSource(indicator: TechnicalIndicator, chart: Chart): void;
    /**
     * Calculates the SMA Values
     *
     * @private
     */
    private smaCalculation;
    /**
     * Calculates the period line values.
     *
     * @private
     */
    private calculatePeriod;
    /**
     * To destroy the Stocastic Indicator.
     *
     * @returns {void}
     * @private
     */
    destroy(): void;
    /**
     * Get module name.
     */
    protected getModuleName(): string;
}
