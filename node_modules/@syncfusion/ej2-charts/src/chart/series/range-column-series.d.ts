import { Series } from './chart-series';
import { ColumnBase } from './column-base';
/**
 * `RangeColumnSeries` module is used to render the range column series.
 */
export declare class RangeColumnSeries extends ColumnBase {
    /**
     * Render Range Column series.
     *
     * @returns {void}
     * @private
     */
    render(series: Series): void;
    /**
     * Get module name.
     */
    protected getModuleName(): string;
    /**
     * Animates the series.
     *
     * @param  {Series} series - Defines the series to animate.
     * @returns {void}
     */
    doAnimation(series: Series): void;
    /**
     * To destroy the range column series.
     *
     * @returns {void}
     * @private
     */
    destroy(): void;
}
