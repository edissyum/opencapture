import { Series } from './chart-series';
import { Axis } from '../../chart/axis/axis';
import { MultiColoredSeries } from './multi-colored-base';
/**
 * `MultiColoredAreaSeries` module used to render the area series with multi color.
 */
export declare class MultiColoredAreaSeries extends MultiColoredSeries {
    /**
     * Render Area series.
     *
     * @returns {void}
     * @private
     */
    render(series: Series, xAxis: Axis, yAxis: Axis, isInverted: boolean): void;
    /**
     * To Store the path directions of the area
     */
    private generatePathOption;
    /**
     * To destroy the area series.
     *
     * @returns {void}
     * @private
     */
    destroy(): void;
    /**
     * Get module name
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
