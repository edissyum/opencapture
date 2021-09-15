import { Series } from './chart-series';
import { LineBase } from './line-base';
import { Axis } from '../../chart/axis/axis';
/**
 * `StackingStepAreaSeries` module used to render the Stacking Step Area series.
 */
export declare class StackingStepAreaSeries extends LineBase {
    /**
     * Render the Stacking step area series.
     *
     * @returns {void}
     * @private
     */
    render(stackSeries: Series, xAxis: Axis, yAxis: Axis, isInverted: boolean): void;
    /**
     * Animates the series.
     *
     * @param  {Series} series - Defines the series to animate.
     * @returns {void}
     */
    doAnimation(series: Series): void;
    /**
     * To destroy the stacking step area.
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
     * To get the nearest visible point
     *
     * @param {Points[]} points points
     * @param {number} j index
     */
    private getNextVisiblePointIndex;
}
