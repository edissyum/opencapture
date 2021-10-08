/**
 * Specifies Circular-Gauge axis-render Helper methods
 */
import { Range } from '../axes/axis';
/**
 * Function to get range color from value for circular gauge.
 *
 * @param {number} value - Specifies the value.
 * @param {Range[]} ranges - Specifies the ranges.
 * @param {string} color - Specifies the color.
 * @returns {string} - Returns the color.
 * @private
 */
export declare function getRangeColor(value: number, ranges: Range[], color: string): string;
