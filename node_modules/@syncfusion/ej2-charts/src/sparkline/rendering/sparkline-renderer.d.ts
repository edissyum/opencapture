import { Sparkline } from '../index';
import { SparkValues } from '../utils/helper';
/**
 * Sparkline rendering calculation file
 */
export declare class SparklineRenderer {
    /**
     * To process sparkline instance internally.
     */
    private sparkline;
    private min;
    private maxLength;
    private unitX;
    private unitY;
    private axisColor;
    private axisWidth;
    private axisValue;
    private clipId;
    /**
     * To get visible points options internally.
     *
     * @private
     */
    visiblePoints: SparkValues[];
    private axisHeight;
    /**
     * To process highpoint index color for tooltip customization
     *
     * @private
     */
    highPointIndex: number;
    /**
     * To process low point index color for tooltip customization
     *
     * @private
     */
    lowPointIndex: number;
    /**
     * To process start point index color for tooltip customization
     *
     * @private
     */
    startPointIndex: number;
    /**
     * To process end point index color for tooltip customization
     *
     * @private
     */
    endPointIndex: number;
    /**
     * To process negative point index color for tooltip customization
     *
     * @private
     */
    negativePointIndexes: number[];
    /**
     * Sparkline data calculations
     */
    constructor(sparkline: Sparkline);
    /**
     * To process the sparkline data
     */
    processData(): void;
    processDataManager(): void;
    /**
     * To process sparkline category data.
     */
    private processCategory;
    /**
     * To process sparkline DateTime data.
     */
    private processDateTime;
    /**
     * To render sparkline series.
     *
     * @private
     */
    renderSeries(): void;
    /**
     * To render a range band
     */
    private rangeBand;
    /**
     * To render line series
     */
    private renderLine;
    /**
     * To render pie series
     */
    private renderPie;
    /**
     * To get special point color and option for Pie series.
     */
    private getPieSpecialPoint;
    /**
     * To render area series
     */
    private renderArea;
    /**
     * To render column series
     */
    private renderColumn;
    /**
     * To render WinLoss series
     */
    private renderWinLoss;
    private renderMarker;
    /**
     * To get special point color and option.
     */
    private getSpecialPoint;
    /**
     * To render data label for sparkline.
     */
    private renderLabel;
    private arrangeLabelPosition;
    /**
     * To get special point color and option.
     */
    private getLabelVisible;
    /**
     * To format text
     */
    private formatter;
    /**
     * To calculate min max for x and y axis
     */
    private axisCalculation;
    /**
     * To find x axis interval.
     */
    private getInterval;
    /**
     * To find x axis interval.
     */
    private getPaddingInterval;
    /**
     * To calculate axis ranges internally.
     */
    private findRanges;
    /**
     * To render the sparkline axis
     */
    private drawAxis;
    /**
     * To trigger point render event
     */
    private triggerPointRender;
}
