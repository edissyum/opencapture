import { Axis } from '../axis/axis';
import { Category } from '../axis/category-axis';
import { Size } from '@syncfusion/ej2-svg-base';
import { Chart } from '../chart';
/**
 * Category module is used to render category axis.
 */
export declare class DateTimeCategory extends Category {
    private axisSize;
    /**
     * Constructor for the category module.
     *
     * @private
     */
    constructor(chart: Chart);
    /**
     * The function to calculate the range and labels for the axis.
     *
     * @returns {void}
     * @private
     */
    calculateRangeAndInterval(size: Size, axis: Axis): void;
    /**
     * Calculate label for the axis.
     *
     * @private
     */
    calculateVisibleLabels(axis: Axis): void;
    /** @private */
    private blazorCustomFormat;
    /**
     * To get the Indexed axis label text with axis format for DateTimeCategory axis
     *
     * @param {string} value value
     * @param {Function} format format
     * @returns {string} Indexed axis label text
     */
    getIndexedAxisLabel(value: string, format: Function): string;
    /**
     * get same interval
     */
    private sameInterval;
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
