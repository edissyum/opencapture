import { Smithchart } from '../../smithchart/smithchart';
import { SmithchartFontModel, SmithchartBorderModel } from '../../smithchart/utils/utils-model';
import { Effect } from '@syncfusion/ej2-base';
import { SmithchartSize, SmithchartRect } from '../../smithchart/utils/utils';
/**
 * To create the svg element.
 *
 * @param {Smithchart} smithchart smithchart instance
 * @returns {void}
 */
export declare function createSvg(smithchart: Smithchart): void;
/**
 * To get the html element from DOM.
 *
 * @param {string} id id of the html element
 * @returns {Element} html element.
 */
export declare function getElement(id: string): Element;
/**
 * To trim the text by given width.
 *
 * @param {number} maximumWidth max width of the text
 * @param {string} text text
 * @param {SmithchartFontModel} font text style
 * @returns {string} It returns trimmed text
 */
export declare function textTrim(maximumWidth: number, text: string, font: SmithchartFontModel): string;
/**
 * Function to compile the template function for maps.
 *
 * @param {string} templateString template with string format
 * @returns {Function} return template function
 * @private
 */
export declare function getTemplateFunction(templateString: string): Function;
/**
 * Get element from label
 *
 * @param {Element} element element
 * @param {string} labelId label id
 * @param {object} data chart data
 * @returns {HTMLElement} html element
 */
export declare function convertElementFromLabel(element: Element, labelId: string, data: object): HTMLElement;
/**
 * Get epsilon value
 *
 * @returns {number} return epsilon value
 */
export declare function _getEpsilonValue(): number;
/**
 * Method to calculate the width and height of the smithchart
 *
 * @param {Smithchart} smithchart smithchart instance
 * @returns {void}
 */
export declare function calculateSize(smithchart: Smithchart): void;
/**
 * Method for template animation
 *
 * @param {Smithchart} smithchart smithchart
 * @param {Element} element html element
 * @param {number} delay animation delay
 * @param {number} duration animation duration
 * @param {Effect} name animation name
 * @returns {void}
 */
export declare function templateAnimate(smithchart: Smithchart, element: Element, delay: number, duration: number, name: Effect): void;
/**
 * Convert string to number
 *
 * @param {string} value string type value
 * @param {number} containerSize size of the container
 * @returns {number} returns converted number
 */
export declare function stringToNumber(value: string, containerSize: number): number;
/**
 * Internal use of path options
 *
 * @private
 */
export declare class PathOption {
    id: string;
    opacity: number;
    fill: string;
    stroke: string;
    ['stroke-width']: number;
    ['stroke-dasharray']: string;
    d: string;
    constructor(id: string, fill: string, width: number, color: string, opacity?: number, dashArray?: string, d?: string);
}
/**
 * Internal use of rectangle options
 *
 * @private
 */
export declare class RectOption extends PathOption {
    x: number;
    y: number;
    height: number;
    width: number;
    transform: string;
    constructor(id: string, fill: string, border: SmithchartBorderModel, opacity: number, rect: SmithchartRect);
}
/**
 * Internal use of circle options
 *
 * @private
 */
export declare class CircleOption extends PathOption {
    cy: number;
    cx: number;
    r: number;
    ['stroke-dasharray']: string;
    constructor(id: string, fill: string, border: SmithchartBorderModel, opacity: number, cx: number, cy: number, r: number, dashArray: string);
}
/**
 * Method for calculate width and height of given string.
 *
 * @param {string} text text value
 * @param {SmithchartFontModel} font text font style
 * @returns {SmithchartSize} size of the text
 */
export declare function measureText(text: string, font: SmithchartFontModel): SmithchartSize;
/**
 * Internal use of text options
 *
 * @private
 */
export declare class TextOption {
    id: string;
    anchor: string;
    text: string;
    x: number;
    y: number;
    constructor(id?: string, x?: number, y?: number, anchor?: string, text?: string);
}
/**
 * Remove html element from DOM
 *
 * @param {string} id element id
 * @returns {void}
 */
export declare function removeElement(id: string): void;
/**
 * Animation Effect Calculation Started Here
 *
 * @param {number} currentTime current time
 * @param {number} startValue start value of the animation
 * @param {number} endValue end value of the animation
 * @param {number} duration animation duration
 * @returns {number} number
 * @private
 */
export declare function linear(currentTime: number, startValue: number, endValue: number, duration: number): number;
/**
 * Reverse linear calculation
 *
 * @param {number} currentTime current time
 * @param {number} startValue start value of the animation
 * @param {number} endValue end value of the animation
 * @param {number} duration animation duration
 * @returns {number} number
 */
export declare function reverselinear(currentTime: number, startValue: number, endValue: number, duration: number): number;
/**
 * Get animation function name
 *
 * @param {string} effect animation effect name
 * @returns {Function} animation function
 * @private
 */
export declare function getAnimationFunction(effect: string): Function;
/**
 * Internal rendering of text
 *
 * @param {TextOption} options text element options
 * @param {SmithchartFontModel} font text font style
 * @param {string} color color of the text
 * @param {HTMLElement} parent parent element of the text
 * @returns {Element} text element
 * @private
 */
export declare function renderTextElement(options: TextOption, font: SmithchartFontModel, color: string, parent: HTMLElement | Element): Element;
