import { Series, Points } from './chart-series';
import { LineBase } from './line-base';
import { Axis } from '../axis/axis';
/**
 * `RangeAreaSeries` module is used to render the range area series.
 */
export declare class RangeAreaSeries extends LineBase {
    /**
     * Render RangeArea Series.
     *
     * @returns {void}
     * @private
     */
    render(series: Series, xAxis: Axis, yAxis: Axis, inverted: boolean): void;
    /**
     * path for rendering the low points
     *
     * @returns {void}.
     * @private
     */
    protected closeRangeAreaPath(visiblePoints: Points[], point: Points, series: Series, direction: string, i: number): string;
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
     * To destroy the line series.
     *
     * @returns {void}
     * @private
     */
    destroy(): void;
}
