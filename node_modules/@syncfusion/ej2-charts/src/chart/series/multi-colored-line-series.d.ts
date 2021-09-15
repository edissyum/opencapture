import { Series } from './chart-series';
import { Axis } from '../../chart/axis/axis';
import { MultiColoredSeries } from './multi-colored-base';
/**
 * `MultiColoredLineSeries` used to render the line series with multi color.
 */
export declare class MultiColoredLineSeries extends MultiColoredSeries {
    /**
     * Render Line Series.
     *
     * @returns {void}
     * @private
     */
    render(series: Series, xAxis: Axis, yAxis: Axis, isInverted: boolean): void;
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
