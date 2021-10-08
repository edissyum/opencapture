import { Chart } from '../chart';
import { TechnicalIndicator } from './technical-indicator';
import { TechnicalAnalysis } from './indicator-base';
/**
 * `AtrIndicator` module is used to render ATR indicator.
 */
export declare class AtrIndicator extends TechnicalAnalysis {
    /**
     * Defines the predictions using Average True Range approach
     *
     * @private
     */
    initDataSource(indicator: TechnicalIndicator, chart: Chart): void;
    /**
     *  To calculate Average True Range indicator points
     *
     * @private
     */
    private calculateATRPoints;
    /**
     * To destroy the Average true range indicator.
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
