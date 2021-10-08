import { Series } from './chart-series';
import { SplineBase } from './spline-base';
import { Axis } from '../../chart/axis/axis';
/**
 * `SplineAreaSeries` module used to render the spline area series.
 */
export declare class SplineAreaSeries extends SplineBase {
    /**
     * Render the splineArea series.
     *
     * @returns {void}
     * @private
     */
    render(series: Series, xAxis: Axis, yAxis: Axis, isInverted: boolean): void;
    /**
     * Get module name.
     */
    protected getModuleName(): string;
    /**
     * To destroy the spline.
     *
     * @returns {void}
     * @private
     */
    destroy(): void;
}
