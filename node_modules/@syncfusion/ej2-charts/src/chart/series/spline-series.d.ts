import { Series } from './chart-series';
import { SplineBase } from './spline-base';
import { Axis } from '../../chart/axis/axis';
/**
 * `SplineSeries` module is used to render the spline series.
 */
export declare class SplineSeries extends SplineBase {
    /**
     * Render the spline series.
     *
     * @returns {void}
     * @private
     */
    render(series: Series, xAxis: Axis, yAxis: Axis, isInverted: boolean): void;
    /**
     * To find the direct of spline using points.
     *
     * @param {ControlPoints} data data
     * @param {Points} firstPoint firstPoint
     * @param {Points} point point
     * @param {Axis} xAxis xAxis
     * @param {Axis} yAxis yAxis
     * @param {boolean} isInverted isInverted
     * @param {Series} series series
     * @param {string} startPoint startPoint
     * @param {Function} getCoordinate getCoordinate
     * @param {string} direction direction
     */
    private getSplineDirection;
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
