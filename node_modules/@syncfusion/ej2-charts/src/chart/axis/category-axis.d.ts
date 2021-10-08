import { Axis } from '../axis/axis';
import { Size } from '@syncfusion/ej2-svg-base';
import { Chart } from '../chart';
import { NiceInterval } from '../axis/axis-helper';
/**
 * `Category` module is used to render category axis.
 */
export declare class Category extends NiceInterval {
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
     */
    calculateRangeAndInterval(size: Size, axis: Axis): void;
    /**
     * Actual Range for the axis.
     *
     * @private
     */
    getActualRange(axis: Axis, size: Size): void;
    /**
     * Padding for the axis.
     *
     * @private
     */
    applyRangePadding(axis: Axis, size: Size): void;
    /**
     * Calculate label for the axis.
     *
     * @private
     */
    calculateVisibleLabels(axis: Axis): void;
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
