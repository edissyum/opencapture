import { Axis } from '../axis/axis';
import { Size } from '@syncfusion/ej2-svg-base';
import { Chart } from '../chart';
import { RangeNavigator } from '../../range-navigator';
/**
 * Numeric module is used to render numeric axis.
 */
export declare class Double {
    /** @private */
    chart: Chart;
    /** @private */
    min: Object;
    /** @private */
    max: Object;
    private isDrag;
    private interval;
    private paddingInterval;
    private isColumn;
    /**
     * Constructor for the dateTime module.
     *
     * @private
     */
    constructor(chart?: Chart);
    /**
     * Numeric Nice Interval for the axis.
     *
     * @private
     */
    protected calculateNumericNiceInterval(axis: Axis, delta: number, size: Size): number;
    /**
     * Actual Range for the axis.
     *
     * @private
     */
    getActualRange(axis: Axis, size: Size): void;
    /**
     * Range for the axis.
     *
     * @private
     */
    initializeDoubleRange(axis: Axis): void;
    /**
     * The function to calculate the range and labels for the axis.
     *
     * @returns {void}
     * @private
     */
    calculateRangeAndInterval(size: Size, axis: Axis): void;
    /**
     * Calculate Range for the axis.
     *
     * @private
     */
    protected calculateRange(axis: Axis): void;
    private yAxisRange;
    private findMinMax;
    /**
     * Apply padding for the range.
     *
     * @private
     */
    applyRangePadding(axis: Axis, size: Size): void;
    updateActualRange(axis: Axis, minimum: number, maximum: number, interval: number): void;
    private findAdditional;
    private findNormal;
    /**
     * Calculate visible range for axis.
     *
     * @private
     */
    protected calculateVisibleRange(size: Size, axis: Axis): void;
    /**
     * Calculate label for the axis.
     *
     * @private
     */
    calculateVisibleLabels(axis: Axis, chart: Chart | RangeNavigator): void;
    /**
     * Format of the axis label.
     *
     * @private
     */
    protected getFormat(axis: Axis): string;
    /**
     * Formatted the axis label.
     *
     * @private
     */
    formatValue(axis: Axis, isCustom: boolean, format: string, tempInterval: number): string;
}
