import { DoubleRange } from '../utils/double-range';
import { Rect } from '@syncfusion/ej2-svg-base';
import { Series, Points } from './chart-series';
import { BorderModel } from '../../common/model/base-model';
import { IPointRenderEventArgs } from '../../chart/model/chart-interface';
/**
 * Column Series Base
 */
export declare class ColumnBase {
    /**
     * To get the position of the column series.
     *
     * @returns {DoubleRange} doubleRange
     * @private
     */
    protected getSideBySideInfo(series: Series): DoubleRange;
    /**
     * To get the rect values.
     *
     * @returns {Rect} rect region values
     * @private
     */
    protected getRectangle(x1: number, y1: number, x2: number, y2: number, series: Series): Rect;
    /**
     * To get the position of each series.
     *
     * @returns {void}
     * @private
     */
    private getSideBySidePositions;
    private findRectPosition;
    /**
     * Updates the symbollocation for points
     *
     * @returns {void}
     * @private
     */
    protected updateSymbolLocation(point: Points, rect: Rect, series: Series): void;
    /**
     * Update the region for the point.
     *
     * @returns {void}
     * @private
     */
    protected updateXRegion(point: Points, rect: Rect, series: Series): void;
    /**
     * Update the region for the point in bar series.
     *
     * @returns {void}
     * @private
     */
    protected updateYRegion(point: Points, rect: Rect, series: Series): void;
    /**
     * To render the marker for the series.
     *
     * @returns {void}
     * @private
     */
    renderMarker(series: Series): void;
    /**
     * To get the marker region when Y value is 0
     *
     * @param {Points} point point
     * @param {rect} rect rect
     * @param {Series} series series
     */
    private getRegion;
    /**
     * To trigger the point rendering event.
     *
     * @returns {void}
     * @private
     */
    protected triggerEvent(series: Series, point: Points, fill: string, border: BorderModel): IPointRenderEventArgs;
    /**
     * To draw the rectangle for points.
     *
     * @returns {void}
     * @private
     */
    protected drawRectangle(series: Series, point: Points, rect: Rect, argsData: IPointRenderEventArgs): void;
    /**
     * To animate the series.
     *
     * @returns {void}
     * @private
     */
    animate(series: Series): void;
    /**
     * To animate the series.
     *
     * @returns {void}
     * @private
     */
    private animateRect;
    /**
     * To get rounded rect path direction
     */
    private calculateRoundedRectPath;
}
export interface RectPosition {
    position: number;
    rectCount: number;
}
