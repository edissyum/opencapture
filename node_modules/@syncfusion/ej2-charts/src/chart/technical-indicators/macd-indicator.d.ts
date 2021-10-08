import { Chart } from '../chart';
import { TechnicalIndicator } from './technical-indicator';
import { TechnicalAnalysis } from './indicator-base';
/**
 * `MacdIndicator` module is used to render MACD indicator.
 */
export declare class MacdIndicator extends TechnicalAnalysis {
    /**
     * Defines the collection of series to represent the MACD indicator
     *
     * @private
     */
    initSeriesCollection(indicator: TechnicalIndicator, chart: Chart): void;
    /**
     * Defines the predictions using MACD approach
     *
     * @private
     */
    initDataSource(indicator: TechnicalIndicator, chart: Chart): void;
    /**
     * Calculates the EMA values for the given period
     */
    private calculateEMAValues;
    /**
     * Defines the MACD Points
     */
    private getMACDPoints;
    /**
     * Calculates the signal points
     */
    private getSignalPoints;
    /**
     * Calculates the MACD values
     */
    private getMACDVales;
    /**
     * Calculates the Histogram Points
     */
    private getHistogramPoints;
    /**
     * To destroy the MACD Indicator.
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
