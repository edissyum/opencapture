import { BulletChart } from '../bullet-chart';
/**
 * Class for Bullet chart axis
 */
export declare class BulletChartAxis {
    bulletChart: BulletChart;
    private labelOffset;
    private labelSize;
    private isHorizontal;
    private isVertical;
    private isLabelBelow;
    private isLabelsInside;
    private majorTickSize;
    private length;
    private isLeft;
    private isRight;
    private isTop;
    private location;
    private rangeCollection;
    /** @private */
    format: Function;
    constructor(bullet: BulletChart);
    renderMajorTickLines(intervalValue: number, scale: Element): void;
    renderMinorTickLines(intervalValue: number, scale: Element): void;
    renderAxisLabels(intervalValue: number, scale: Element): void;
    /**
     * To render grid lines of bullet chart axis
     */
    renderXMajorTickLines(intervalValue: number, scale: Element): void;
    /**
     * To render grid lines of bullet chart axis
     */
    renderYMajorTickLines(intervalValue: number, scale: Element): void;
    private majorTicks;
    private bindingRangeStrokes;
    /**
     * To render minor tick lines of bullet chart
     */
    renderXMinorTickLines(intervalValue: number, scaleGroup: Element): void;
    /**
     * To render minor tick lines of bullet chart
     */
    renderYMinorTickLines(intervalValue: number, scaleGroup: Element): void;
    private minorXTicks;
    private forwardStrokeBinding;
    private backwardStrokeBinding;
    /**
     * To render axis labels of bullet chart
     */
    renderXAxisLabels(intervalValue: number, scaleGroup: Element): void;
    private labelXOptions;
    /**
     * To render axis labels of bullet chart
     */
    renderYAxisLabels(intervalValue: number, scaleGroup: Element): void;
    /**
     * Format of the axis label.
     *
     * @private
     */
    getFormat(axis: BulletChart): string;
    /**
     * Formatted the axis label.
     *
     * @private
     */
    formatValue(axis: BulletChartAxis, isCustom: boolean, format: string, tempInterval: number): string;
}
