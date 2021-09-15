import { ChartLocation } from '../../common/utils/helper';
import { AccumulationChart } from '../accumulation';
/**
 * Accumulation Base used to do some base calculation for accumulation chart.
 */
export declare class AccumulationBase {
    /** @private */
    constructor(accumulation: AccumulationChart);
    private pieCenter;
    /**
     * Gets the center of the pie
     *
     * @private
     */
    /**
    * Sets the center of the pie
    *
    * @private
    */
    center: ChartLocation;
    private pieRadius;
    /**
     * Gets the radius of the pie
     *
     * @private
     */
    /**
    * Sets the radius of the pie
    *
    * @private
    */
    radius: number;
    private pieLabelRadius;
    /**
     * Gets the label radius of the pie
     *
     * @private
     */
    /**
    * Sets the label radius of the pie
    *
    * @private
    */
    labelRadius: number;
    /** @private */
    protected accumulation: AccumulationChart;
    /**
     * Checks whether the series is circular or not
     *
     * @private
     */
    protected isCircular(): boolean;
    /**
     * To check various radius pie
     *
     * @private
     */
    protected isVariousRadius(): boolean;
    /**
     * To process the explode on accumulation chart loading
     *
     * @private
     */
    processExplode(event: Event): void;
    /**
     * To invoke the explode on accumulation chart loading
     *
     * @private
     */
    invokeExplode(): void;
    /**
     * To deExplode all points in the series
     *
     * @private
     */
    deExplodeAll(index: number, animationDuration: number): void;
    /**
     * To explode point by index
     *
     * @private
     */
    explodePoints(index: number, chart: AccumulationChart, explode?: boolean): void;
    private getSum;
    private clubPointExplode;
    /**
     * To Explode points
     *
     * @param {number} index Index of a point.
     * @param {AccPoints} point To get the point of explode.
     * @param {number} duration Duration of the explode point.
     * @param {boolean} explode Either true or false.
     */
    private pointExplode;
    /**
     * To check point is exploded by id
     */
    private isExplode;
    /**
     * To deExplode the point by index
     */
    private deExplodeSlice;
    /**
     * To translate the point elements by index and position
     */
    private setTranslate;
    /**
     * To translate the point element by id and position
     */
    private setElementTransform;
    /**
     * To translate the point elements by index position
     */
    private explodeSlice;
    /**
     * To Perform animation point explode
     *
     * @param {number} index Index of the series.
     * @param {string} sliceId ID of the series.
     * @param {number} startX X value of start.
     * @param {number} startY Y value of start.
     * @param {number} endX X value of end.
     * @param {number} endY Y value of end.
     * @param {number} duration Duration of the animation.
     */
    private performAnimation;
}
