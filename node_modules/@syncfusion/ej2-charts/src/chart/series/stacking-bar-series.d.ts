import { Series } from './chart-series';
import { ColumnBase } from './column-base';
/**
 * `StackingBarSeries` module is used to render the stacking bar series.
 */
export declare class StackingBarSeries extends ColumnBase {
    /**
     * Render the Stacking bar series.
     *
     * @returns {void}
     * @private
     */
    render(series: Series): void;
    /**
     * To destroy the stacking bar.
     *
     * @returns {void}
     * @private
     */
    destroy(): void;
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
}
