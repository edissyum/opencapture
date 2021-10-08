/**
 * Specifies Circular-Gauge Tooltip Helper methods
 */
import { GaugeLocation, Size } from './helper-common';
import { CircularGauge } from '../circular-gauge';
/**
 * Function to get the mouse position
 *
 * @param {number} pageX - Specifies the pageX value.
 * @param {number} pageY - Specifies the pageY value.
 * @param {Element} element - Specifies the element.
 * @returns {GaugeLocation} - Returns the location.
 */
export declare function getMousePosition(pageX: number, pageY: number, element: Element): GaugeLocation;
export declare function getElementSize(template: string, gauge: CircularGauge, parent: HTMLElement): Size;
