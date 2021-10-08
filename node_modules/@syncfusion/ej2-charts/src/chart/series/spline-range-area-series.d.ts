import { Series, Points } from './chart-series';
import { SplineBase } from './spline-base';
import { Axis } from '../axis/axis';
/**
 * `SplineRangeAreaSeries` module is used to render the range area series.
 */
export declare class SplineRangeAreaSeries extends SplineBase {
    /**
     * Render SplineRangeArea Series.
     *
     * @returns {void}
     * @private
     */
    render(series: Series, xAxis: Axis, yAxis: Axis, inverted: boolean): void;
    /**
     * path for rendering the low points in SplineRangeArea
     *
     * @returns {void}.
     * @private
     */
    protected closeSplineRangeAreaPath(visiblePoint: Points[], point: Points, series: Series, direction: string, i: number, xAxis: Axis, yAxis: Axis, inverted: boolean): string;
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
