import { Axis } from '../../chart/axis/axis';
import { NiceInterval } from '../../chart/axis/axis-helper';
import { RangeNavigator } from '../range-navigator';
/**
 * To render Chart series
 */
export declare class RangeSeries extends NiceInterval {
    private dataSource;
    private xName;
    private yName;
    private query;
    xMin: number;
    xMax: number;
    yMin: number;
    yMax: number;
    private yAxis;
    xAxis: Axis;
    private seriesLength;
    private chartGroup;
    constructor(range: RangeNavigator);
    /**
     * To render light weight and data manager process
     *
     * @param {RangeNavigator} control RangeNavigator instance
     */
    renderChart(control: RangeNavigator): void;
    private processDataSource;
    /**
     * data manager process calculated here
     */
    private dataManagerSuccess;
    /**
     * Process JSON data from data source
     */
    private processJsonData;
    /**
     * Process x axis for range navigator.
     *
     * @private
     */
    processXAxis(control: RangeNavigator): void;
    /**
     * Process yAxis for range navigator
     *
     * @param {RangeNavigator} control RangeNavigator instance
     * @private
     */
    processYAxis(control: RangeNavigator): void;
    /**
     * Process Light weight control
     *
     * @param {RangeNavigator} control RangeNavigator instance
     * @private
     */
    renderSeries(control: RangeNavigator): void;
    /**
     * Append series elements in element
     */
    appendSeriesElements(control: RangeNavigator): void;
    private createSeriesElement;
    /**
     * Calculate grouping bounds for x axis.
     *
     * @private
     */
    calculateGroupingBounds(control: RangeNavigator): void;
    private drawSeriesBorder;
}
