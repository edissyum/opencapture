/**
 * Defines the common behavior of funnel and pyramid series
 */
import { AccPoints, AccumulationSeries } from '../model/acc-base';
import { ChartLocation } from '../../common/utils/helper';
import { AccumulationChart } from '../accumulation';
import { AccumulationLabelPosition } from '../model/enum';
import { AccumulationBase } from './accumulation-base';
/**
 * TriangularBase is used to calculate base functions for funnel/pyramid series.
 */
export declare class TriangularBase extends AccumulationBase {
    /**
     * Initializes the properties of funnel/pyramid series
     *
     * @private
     */
    initProperties(chart: AccumulationChart, series: AccumulationSeries): void;
    /**
     * Initializes the size of the pyramid/funnel segments
     *
     * @private
     */
    protected initializeSizeRatio(points: AccPoints[], series: AccumulationSeries, reverse?: boolean): void;
    /**
     * Marks the label location from the set of points that forms a pyramid/funnel segment
     *
     * @private
     */
    protected setLabelLocation(series: AccumulationSeries, point: AccPoints, points: ChartLocation[]): void;
    /**
     * Finds the path to connect the list of points
     *
     * @private
     */
    protected findPath(locations: ChartLocation[]): string;
    /**
     * To calculate data-label bounds
     *
     * @private
     */
    defaultLabelBound(series: AccumulationSeries, visible: boolean, position: AccumulationLabelPosition, chart: AccumulationChart): void;
}
