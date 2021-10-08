import { TechnicalIndicator } from './technical-indicator';
import { TechnicalAnalysis } from './indicator-base';
import { Chart } from '../chart';
/**
 * `MomentumIndicator` module is used to render Momentum indicator.
 */
export declare class MomentumIndicator extends TechnicalAnalysis {
    /**
     * Defines the collection of series to represent a momentum indicator
     *
     * @private
     */
    initSeriesCollection(indicator: TechnicalIndicator, chart: Chart): void;
    /**
     * Defines the predictions using momentum approach
     *
     * @private
     */
    initDataSource(indicator: TechnicalIndicator, chart: Chart): void;
    /**
     * To destroy the momentum indicator
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
