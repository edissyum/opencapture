/**
 * Specifies Circular-Gauge pointer-render Helper methods
 */
import { GaugeLocation } from './helper-common';
/**
 * Function to calculate the value for linear animation effect
 *
 * @param {number} currentTime - Specifies the currentTime.
 * @param {number} startValue - Specifies the startValue.
 * @param {number} endValue - Specifies the endValue.
 * @param {number} duration - Specifies the duration.
 * @returns {number} - Returns the number.
 * @private
 */
export declare function linear(currentTime: number, startValue: number, endValue: number, duration: number): number;
/**
 * Function to calculate the complete path arc of the circular gauge.
 *
 * @param {GaugeLocation} center - Specifies the center value.
 * @param {number} start - Specifies the start value.
 * @param {number} end - Specifies the end value.
 * @param {number} radius - Specifies the radius value.
 * @param {number} innerRadius - Specifies the innerRadius value.
 * @param {boolean} checkMinValue - Specifies the checkMinValue value.
 * @returns {string} - Returns the path value.
 * @private
 */
export declare function getCompleteArc(center: GaugeLocation, start: number, end: number, radius: number, innerRadius: number, checkMinValue?: boolean): string;
/**
 * Function to get the complete path direction of the circular gauge.
 *
 * @param {GaugeLocation} center - Specifies the center value.
 * @param {GaugeLocation} start - Specifies the start value.
 * @param {GaugeLocation} end - Specifies the end value.
 * @param {number} radius - Specifies the radius value.
 * @param {GaugeLocation} innerStart - Specifies the innerStart value.
 * @param {GaugeLocation} innerEnd - Specifies the innerEnd value.
 * @param {number} innerRadius - Specifies the innerRadius value.
 * @param {number} clockWise - Specifies the clockWise.
 * @returns {string} - Returns the path.
 * @private
 */
export declare function getCompletePath(center: GaugeLocation, start: GaugeLocation, end: GaugeLocation, radius: number, innerStart: GaugeLocation, innerEnd: GaugeLocation, innerRadius: number, clockWise: number): string;
