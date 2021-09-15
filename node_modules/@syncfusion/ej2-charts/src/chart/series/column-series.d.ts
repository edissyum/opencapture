import { Series } from './chart-series';
import { ColumnBase } from './column-base';
/**
 * `ColumnSeries` Module used to render the column series.
 */
export declare class ColumnSeries extends ColumnBase {
    /**
     * Render Column series.
     *
     * @returns {void}
     * @private
     */
    render(series: Series): void;
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
     * To destroy the column series.
     *
     * @returns {void}
     * @private
     */
    destroy(): void;
}
