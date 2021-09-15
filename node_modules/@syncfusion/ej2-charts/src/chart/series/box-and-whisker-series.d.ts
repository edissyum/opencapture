import { ChartLocation } from '../../common/utils/helper';
import { Series, Points } from './chart-series';
import { ColumnBase } from './column-base';
import { IPointRenderEventArgs } from '../../chart/model/chart-interface';
import { BoxPlotMode } from '../utils/enum';
import { Axis } from '../../chart/axis/axis';
/**
 * `BoxAndWhiskerSeries` module is used to render the box and whisker series.
 */
export declare class BoxAndWhiskerSeries extends ColumnBase {
    /**
     * Render BoxAndWhisker series.
     *
     * @returns {void}
     * @private
     */
    render(series: Series, xAxis: Axis, yAxis: Axis, isInverted: boolean): void;
    /**
     * update the tip region fo box plot
     *
     * @param {Series} series series
     * @param {Points} point point
     * @param {DoubleRange} sideBySideInfo sideBySideInfo
     * @returns {void}
     */
    private updateTipRegion;
    /**
     * Update tip size to tip regions
     *
     * @param {Series} series Series
     * @param {Points} point Points
     * @param {Rect} region rect region
     * @param {boolean} isInverted isInverted
     * @returns {void}
     */
    private updateTipSize;
    /**
     * Calculation for path direction performed here
     *
     * @param {Points} point point
     * @param {Series} series series
     * @param {ChartLocation} median median
     * @param {ChartLocation} average average
     * @returns {string} direction
     */
    getPathString(point: Points, series: Series, median: ChartLocation, average: ChartLocation): string;
    /**
     * Rendering for box and whisker append here.
     *
     * @param {Series} series series
     * @param {Points} point point
     * @param {IPointRenderEventArgs} argsData argsData
     * @param {string} direction path direction
     * @param {number} median median
     * @returns {void}
     */
    renderBoxAndWhisker(series: Series, point: Points, argsData: IPointRenderEventArgs, direction: string, median: number): void;
    /**
     * To find the box plot values
     *
     * @param {number[]} yValues yValues
     * @param {Points} point point
     * @param {BoxPlotMode} mode mode
     * @returns {void}
     */
    findBoxPlotValues(yValues: number[], point: Points, mode: BoxPlotMode): void;
    /**
     * to find the exclusive quartile values
     *
     * @param {number[]} yValues yValues
     * @param {number} count count
     * @param {number} percentile percentile
     * @returns {number} exclusive quartile value
     */
    private getExclusiveQuartileValue;
    /**
     * to find the inclusive quartile values
     *
     * @param {number[]} yValues yValues
     * @param {number} count count
     * @param {number} percentile percentile
     * @returns {number} inclusive quartile value
     */
    private getInclusiveQuartileValue;
    /**
     * To find the quartile values
     *
     * @param {number[]} yValues yValues
     * @param {number} count count
     * @param {IBoxPlotQuartile} quartile quartile
     * @returns {void}
     */
    private getQuartileValues;
    /**
     * To find the min, max and outlier values
     *
     * @param {number[]} yValues yValues
     * @param {number} count count
     * @param {IBoxPlotQuartile} quartile quartile
     * @returns {void}
     */
    private getMinMaxOutlier;
    /**
     * Animates the series.
     *
     * @param  {Series} series - Defines the series to animate.
     * @returns {void}
     */
    doAnimation(series: Series): void;
    /**
     * Get module name.
     *
     * @returns {string} module name
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
