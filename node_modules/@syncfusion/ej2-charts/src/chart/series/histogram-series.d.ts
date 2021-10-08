import { Series } from './chart-series';
import { ColumnSeries } from './column-series';
/**
 * `HistogramSeries` Module used to render the histogram series.
 */
export declare class HistogramSeries extends ColumnSeries {
    /**
     * Render Histogram series.
     *
     * @returns {void}
     * @private
     */
    render(series: Series): void;
    /**
     * To calculate bin interval for Histogram series.
     *
     * @returns {void}
     * @private
     */
    private calculateBinInterval;
    /**
     * Add data points for Histogram series.
     *
     * @returns {object[]} data
     * @private
     */
    processInternalData(data: Object[], series: Series): Object[];
    /**
     * Calculates bin values.
     *
     * @returns null
     * @private
     */
    calculateBinValues(series: Series): void;
    /**
     * Render Normal Distribution for Histogram series.
     *
     * @returns {void}
     * @private
     */
    private renderNormalDistribution;
    /**
     * Animates the series.
     *
     * @param  {Series} series - Defines the series to animate.
     * @returns {void}
     */
    doAnimation(series: Series): void;
    /**
     * Get module name.
     */
    protected getModuleName(): string;
    /**
     * To destroy the histogram series.
     *
     * @returns {void}
     * @private
     */
    destroy(): void;
}
