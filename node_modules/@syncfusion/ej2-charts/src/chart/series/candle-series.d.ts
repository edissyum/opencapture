import { Rect } from '@syncfusion/ej2-svg-base';
import { Series, Points } from './chart-series';
import { ColumnBase } from './column-base';
import { IPointRenderEventArgs } from '../../chart/model/chart-interface';
/**
 * `CandleSeries` module is used to render the candle series.
 */
export declare class CandleSeries extends ColumnBase {
    /**
     * Render Candle series.
     *
     * @returns {void}
     * @private
     */
    render(series: Series): void;
    /**
     * Trigger point rendering event
     */
    protected triggerPointRenderEvent(series: Series, point: Points): IPointRenderEventArgs;
    /**
     * Find the color of the candle
     *
     * @param {Points} point point
     * @param {Series} series series
     * @returns {string} color of the candle
     * @private
     */
    private getCandleColor;
    /**
     * Finds the path of the candle shape
     *
     * @private
     */
    getPathString(topRect: Rect, midRect: Rect, series: Series): string;
    /**
     * Draws the candle shape
     *
     * @param {Series} series series
     * @param {Points} point point
     * @param {Rect} rect point region
     * @param {IPointRenderEventArgs} argsData argsData
     * @param {string} direction path direction
     * @returns {void}
     * @private
     */
    drawCandle(series: Series, point: Points, rect: Rect, argsData: IPointRenderEventArgs, direction: string): void;
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
     * To destroy the candle series.
     *
     * @returns {void}
     * @private
     */
    destroy(): void;
}
