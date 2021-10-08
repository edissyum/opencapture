/**
 * Defines the behavior of a funnel series
 */
import { AccPoints, AccumulationSeries } from '../model/acc-base';
import { PathOption } from '@syncfusion/ej2-svg-base';
import { AccumulationChart } from '../accumulation';
import { TriangularBase } from './triangular-base';
/**
 * FunnelSeries module used to render `Funnel` Series.
 */
export declare class FunnelSeries extends TriangularBase {
    /**
     * Defines the path of a funnel segment
     *
     * @private
     * @returns {string} Get segment data.
     */
    private getSegmentData;
    /**
     * Renders a funnel segment
     *
     * @private
     * @returns {void} Render point.
     */
    renderPoint(point: AccPoints, series: AccumulationSeries, chart: AccumulationChart, options: PathOption, seriesGroup: Element, redraw: boolean): void;
    /**
     * To get the module name of the funnel series.
     *
     * @returns {string} Get module name.
     */
    protected getModuleName(): string;
    /**
     * To destroy the funnel series.
     *
     * @returns {void} Destroy method.
     * @private
     */
    destroy(): void;
}
