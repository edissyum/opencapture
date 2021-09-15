import { TechnicalIndicator } from './technical-indicator';
import { TechnicalAnalysis } from './indicator-base';
import { Chart } from '../chart';
/**
 * `SmaIndicator` module is used to render SMA indicator.
 */
export declare class SmaIndicator extends TechnicalAnalysis {
    /**
     * Defines the predictions based on SMA approach
     *
     * @private
     */
    initDataSource(indicator: TechnicalIndicator, chart: Chart): void;
    /**
     * To destroy the SMA indicator
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
