import { Series } from './chart-series';
import { ColumnBase } from './column-base';
/**
 * `WaterfallSeries` module is used to render the waterfall series.
 */
export declare class WaterfallSeries extends ColumnBase {
    /**
     * Render waterfall series.
     *
     * @returns {void}
     * @private
     */
    render(series: Series): void;
    /**
     * To check intermediateSumIndex in waterfall series.
     *
     * @returns {boolean} check intermediateSumIndex
     * @private
     */
    private isIntermediateSum;
    /**
     * To check sumIndex in waterfall series.
     *
     * @returns {boolean} check sumIndex
     * @private
     */
    private isSumIndex;
    /**
     * To trigger the point rendering event for waterfall series.
     *
     * @returns {IPointRenderEventArgs} point rendering event values
     * @private
     */
    private triggerPointRenderEvent;
    /**
     * Add sumIndex and intermediateSumIndex data.
     *
     * @returns {object[]} data
     * @private
     */
    processInternalData(json: Object[], series: Series): Object[];
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
     * To destroy the waterfall series.
     *
     * @returns {void}
     * @private
     */
    destroy(): void;
}
