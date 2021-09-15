import { ChartLocation } from '../../common/utils/helper';
import { PathOption } from '@syncfusion/ej2-svg-base';
import { Chart } from '../chart';
import { Series, Points } from './chart-series';
import { Axis } from '../../chart/axis/axis';
import { LineBase } from './line-base';
import { ChartSegmentModel } from './chart-series-model';
/**
 * Base class for multi colored series
 */
export declare class MultiColoredSeries extends LineBase {
    /**
     * To Generate the area path direction
     *
     * @param {number} xValue xValue
     * @param {number} yValue yValue
     * @param {Series} series series
     * @param {boolean} isInverted isInverted
     * @param {Function} getPointLocation getPointLocation
     * @param {ChartLocation} startPoint startPoint
     * @param {string} startPath startPath
     */
    getAreaPathDirection(xValue: number, yValue: number, series: Series, isInverted: boolean, getPointLocation: Function, startPoint: ChartLocation, startPath: string): string;
    /**
     * To Generate the empty point direction
     *
     * @param {ChartLocation} firstPoint firstPoint
     * @param {ChartLocation} secondPoint secondPoint
     * @param {Series} series series
     * @param {boolean} isInverted isInverted
     * @param {Function} getPointLocation getPointLocation
     */
    getAreaEmptyDirection(firstPoint: ChartLocation, secondPoint: ChartLocation, series: Series, isInverted: boolean, getPointLocation: Function): string;
    /**
     * To set point color
     */
    setPointColor(currentPoint: Points, previous: Points, series: Series, isXSegment: boolean, segments: ChartSegmentModel[]): boolean;
    sortSegments(series: Series, chartSegments: ChartSegmentModel[]): ChartSegmentModel[];
    /**
     * Segment calculation performed here
     *
     * @param {Series} series series
     * @param {PathOption[]} options options
     * @param {ChartSegmentModel[]} segments chartSegments
     */
    applySegmentAxis(series: Series, options: PathOption[], segments: ChartSegmentModel[]): void;
    private includeSegment;
    /**
     * To create clip rect for segment axis
     *
     * @param {number} startValue startValue
     * @param {number} endValue endValue
     * @param {Series} series series
     * @param {number} index index
     * @param {boolean} isX isX
     */
    createClipRect(startValue: number, endValue: number, series: Series, index: number, isX: boolean): string;
    /**
     * To get exact value from segment value
     *
     * @param {Object} segmentValue segmentValue
     * @param {Axis} axis axis
     * @param {Chart} chart chart
     */
    getAxisValue(segmentValue: Object, axis: Axis, chart: Chart): number;
}
