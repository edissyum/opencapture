import { ControlPoints } from '../../common/utils/helper';
import { Chart } from '../chart';
import { Series, Points } from './chart-series';
import { LineBase } from './line-base';
/**
 * render Line series
 */
export declare class SplineBase extends LineBase {
    private splinePoints;
    private lowSplinePoints;
    /** @private */
    constructor(chartModule?: Chart);
    /**
     * To find the control points for spline.
     *
     * @returns {void}
     * @private
     */
    findSplinePoint(series: Series): void;
    protected getPreviousIndex(points: Points[], i: number, series: Series): number;
    getNextIndex(points: Points[], i: number, series: Series): number;
    filterEmptyPoints(series: Series, seriesPoints?: Points[]): Points[];
    /**
     * To find points in the range
     *
     * @private
     */
    isPointInRange(points: Points[]): boolean;
    /**
     * To find the natural spline.
     *
     * @returns {void}
     * @private
     */
    findSplineCoefficients(points: Points[], series: Series, isLow?: boolean): number[];
    /**
     *  To find Monotonic Spline Coefficients
     */
    private monotonicSplineCoefficients;
    /**
     * To find Cardinal Spline Coefficients
     */
    private cardinalSplineCofficients;
    /**
     * To find Clamped Spline Coefficients
     */
    private clampedSplineCofficients;
    /**
     * To find Natural Spline Coefficients
     */
    private naturalSplineCoefficients;
    /**
     * To find the control points for spline.
     *
     * @returns {void}
     * @private
     */
    getControlPoints(point1: Points, point2: Points, ySpline1: number, ySpline2: number, series: Series): ControlPoints;
    /**
     * calculate datetime interval in hours
     */
    protected dateTimeInterval(series: Series): number;
    /**
     * Animates the series.
     *
     * @param  {Series} series - Defines the series to animate.
     * @returns {void}
     */
    doAnimation(series: Series): void;
}
