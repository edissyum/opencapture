import { Axis } from '../axis/axis';
import { Size } from '@syncfusion/ej2-svg-base';
import { Chart } from '../chart';
import { NiceInterval } from '../axis/axis-helper';
import { RangeNavigator } from '../../range-navigator/index';
/**
 * `DateTime` module is used to render datetime axis.
 */
export declare class DateTime extends NiceInterval {
    min: number;
    max: number;
    /**
     * Constructor for the dateTime module.
     *
     * @private
     */
    constructor(chart?: Chart);
    /**
     * The function to calculate the range and labels for the axis.
     *
     * @returns {void}
     */
    calculateRangeAndInterval(size: Size, axis: Axis): void;
    /**
     * Actual Range for the axis.
     *
     * @private
     */
    getActualRange(axis: Axis, size: Size): void;
    /**
     * Apply padding for the range.
     *
     * @private
     */
    applyRangePadding(axis: Axis, size: Size): void;
    private getYear;
    private getMonth;
    private getDay;
    private getHour;
    /**
     * Calculate visible range for axis.
     *
     * @private
     */
    protected calculateVisibleRange(size: Size, axis: Axis): void;
    /**
     * Calculate visible labels for the axis.
     *
     * @param {Axis} axis axis
     * @param {Chart | RangeNavigator} chart chart
     * @returns {void}
     * @private
     */
    calculateVisibleLabels(axis: Axis, chart: Chart | RangeNavigator): void;
    /** @private */
    private blazorCustomFormat;
    /** @private */
    increaseDateTimeInterval(axis: Axis, value: number, interval: number): Date;
    private alignRangeStart;
    private getDecimalInterval;
    /**
     * Get module name
     */
    protected getModuleName(): string;
    /**
     * To destroy the category axis.
     *
     * @returns {void}
     * @private
     */
    destroy(): void;
}
