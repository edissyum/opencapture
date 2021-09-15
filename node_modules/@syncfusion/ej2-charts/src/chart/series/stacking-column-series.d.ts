import { Series } from './chart-series';
import { ColumnBase } from './column-base';
/**
 * `StackingColumnSeries` module used to render the stacking column series.
 */
export declare class StackingColumnSeries extends ColumnBase {
    /**
     * Render the Stacking column series.
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
     * To destroy the stacking column.
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
