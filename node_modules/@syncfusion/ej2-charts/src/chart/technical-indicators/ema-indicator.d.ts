import { TechnicalIndicator } from './technical-indicator';
import { TechnicalAnalysis } from './indicator-base';
import { Chart } from '../chart';
/**
 * `EmaIndicator` module is used to render EMA indicator.
 */
export declare class EmaIndicator extends TechnicalAnalysis {
    /**
     * Defines the predictions based on EMA approach
     *
     * @private
     */
    initDataSource(indicator: TechnicalIndicator, chart: Chart): void;
    /**
     * To destroy the EMA Indicator
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
