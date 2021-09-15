import { TechnicalIndicator } from './technical-indicator';
import { TechnicalAnalysis } from './indicator-base';
import { Chart } from '../chart';
/**
 * `RsiIndicator` module is used to render RSI indicator.
 */
export declare class RsiIndicator extends TechnicalAnalysis {
    /**
     * Initializes the series collection to represent the RSI Indicator
     *
     * @private
     */
    initSeriesCollection(indicator: TechnicalIndicator, chart: Chart): void;
    /**
     * Defines the predictions using RSI approach
     *
     * @private
     */
    initDataSource(indicator: TechnicalIndicator, chart: Chart): void;
    /**
     * To destroy the RSI Indicator.
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
