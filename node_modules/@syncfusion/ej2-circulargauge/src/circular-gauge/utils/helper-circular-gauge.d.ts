/**
 * Specifies Circular-Gauge Helper methods
 */
import { BorderModel } from '../model/base-model';
import { CircularGauge } from '../circular-gauge';
import { IVisibleRange } from '../model/interface';
/**
 * Function to set style to the element.
 *
 * @param {HTMLElement} element - Specifies the element.
 * @param {string} fill - Specifies the fill of the element.
 * @param {BorderModel} border - Specifies the border of the element.
 * @returns {void}
 * @private
 */
export declare function setStyles(element: HTMLElement, fill: string, border: BorderModel): void;
/**
 * Function to get the value from angle for circular gauge.
 *
 * @param {number} angle - Specifies the angle.
 * @param {number} maximumValue - Specifies the maximumValue.
 * @param {number} minimumValue - Specifies the minimumValue.
 * @param {number} startAngle - Specifies the startAngle.
 * @param {number} endAngle - Specifies the endAngle.
 * @param {boolean} isClockWise - Specifies the isClockWise.
 * @returns {number} - Returs the number.
 * @private
 */
export declare function getValueFromAngle(angle: number, maximumValue: number, minimumValue: number, startAngle: number, endAngle: number, isClockWise: boolean): number;
/**
 * Function to get current point for circular gauge using element id.
 *
 * @param {string} targetId - Specifies the target id.
 * @param {CircularGauge} gauge - Specifies the gauge instance.
 * @returns {IVisibleRange} - Returns the current point.
 * @private
 */
export declare function getRange(targetId: string, gauge: CircularGauge): IVisibleRange;
