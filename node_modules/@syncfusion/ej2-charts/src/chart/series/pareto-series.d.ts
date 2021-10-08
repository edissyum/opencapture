import { Chart } from '../chart';
import { Series } from '../series/chart-series';
import { ColumnBase } from './column-base';
import { Axis } from '../axis/axis';
/**
 * `Pareto series` module used to render the Pareto series.
 */
export declare class ParetoSeries extends ColumnBase {
    paretoAxes: Axis[];
    /**
     * Defines the Line initialization
     */
    initSeries(targetSeries: Series, chart: Chart): void;
    /**
     * Defines the Axis initialization for Line
     */
    initAxis(paretoSeries: Series, targetSeries: Series, chart: Chart): void;
    /**
     * Render Pareto series.
     *
     * @returns {void}
     * @private
     */
    render(series: Series): void;
    /**
     * To perform the cumulative calculation for pareto series.
     */
    performCumulativeCalculation(json: Object, series: Series): Object[];
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
     * To destroy the pareto series.
     *
     * @returns {void}
     * @private
     */
    destroy(): void;
}
