import { Double } from '../axis/double-axis';
import { Axis } from '../../chart/index';
import { Size } from '@syncfusion/ej2-svg-base';
/**
 * Common axis classes
 *
 * @private
 */
export declare class NiceInterval extends Double {
    /**
     * Method to calculate numeric datetime interval
     */
    calculateDateTimeNiceInterval(axis: Axis, size: Size, start: number, end: number, isChart?: boolean): number;
    /**
     * To get the skeleton for the DateTime axis.
     *
     * @returns {string} skeleton format
     * @private
     */
    getSkeleton(axis: Axis, currentValue: number, previousValue: number, isBlazor?: boolean): string;
    /**
     * Get intervalType month format
     *
     * @param {Axis} axis axis
     * @param {number} currentValue currentValue
     * @param {number} previousValue previousValue
     */
    private getMonthFormat;
    /**
     * Get intervalType day label format for the axis
     *
     * @param {Axis} axis axis
     * @param {number} currentValue currentValue
     * @param {number} previousValue previousValue
     */
    private getDayFormat;
    /**
     * Find label format for axis
     *
     * @param {Axis} axis axis
     * @param {number} currentValue currentValue
     * @param {number} previousValue previousValue
     * @private
     */
    findCustomFormats(axis: Axis, currentValue: number, previousValue: number): string;
}
