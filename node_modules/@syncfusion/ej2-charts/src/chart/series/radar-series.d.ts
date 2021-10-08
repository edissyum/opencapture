import { Series } from './chart-series';
import { PolarSeries } from '../series/polar-series';
import { Axis } from '../axis/axis';
/**
 * `RadarSeries` module is used to render the radar series.
 */
export declare class RadarSeries extends PolarSeries {
    /**
     * Render radar Series.
     *
     * @returns {void}
     * @private
     */
    render(series: Series, xAxis: Axis, yAxis: Axis, inverted: boolean): void;
    getRadarIsInversedPath(xAxis: Axis, endPoint: string): string;
    /**
     * Get module name.
     */
    protected getModuleName(): string;
    /**
     * To destroy the radar series.
     *
     * @returns {void}
     * @private
     */
    destroy(): void;
}
