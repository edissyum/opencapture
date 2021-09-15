import { Series } from './chart-series';
import { ColumnBase } from './column-base';
/**
 * `BarSeries` module is used to render the bar series.
 */
export declare class BarSeries extends ColumnBase {
    /**
     * Render Bar series.
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
     * To destroy the bar series.
     *
     * @returns {void}
     * @private
     */
    protected destroy(): void;
    /**
     * Get module name
     */
    protected getModuleName(): string;
}
