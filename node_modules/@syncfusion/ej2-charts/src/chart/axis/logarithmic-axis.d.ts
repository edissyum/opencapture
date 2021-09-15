import { Axis } from '../axis/axis';
import { Double } from '../axis/double-axis';
import { Size } from '@syncfusion/ej2-svg-base';
import { Chart } from '../chart';
import { RangeNavigator } from '../../range-navigator';
/**
 * `Logarithmic` module is used to render log axis.
 */
export declare class Logarithmic extends Double {
    /**
     * Constructor for the logerithmic module.
     *
     * @private
     */
    constructor(chart: Chart);
    /**
     * The method to calculate the range and labels for the axis.
     *
     * @returns {void}
     */
    calculateRangeAndInterval(size: Size, axis: Axis): void;
    /**
     * Calculates actual range for the axis.
     *
     * @private
     */
    getActualRange(axis: Axis, size: Size): void;
    /**
     * Calculates visible range for the axis.
     *
     * @private
     */
    protected calculateVisibleRange(size: Size, axis: Axis): void;
    /**
     * Calculates log iInteval for the axis.
     *
     * @private
     */
    protected calculateLogNiceInterval(delta: number, size: Size, axis: Axis): number;
    /**
     * Calculates labels for the axis.
     *
     * @private
     */
    calculateVisibleLabels(axis: Axis, chart: Chart | RangeNavigator): void;
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
