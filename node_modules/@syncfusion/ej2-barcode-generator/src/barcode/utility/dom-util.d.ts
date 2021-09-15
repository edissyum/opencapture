/**
 * DOM util
 */
import { Size } from '../primitives/size';
import { BaseAttributes } from '../rendering/canvas-interface';
/**
 *will create the hrml element for the barcode .\
 *
 * @returns {HTMLElement} Will download the barode as image .
 * @param {string} elementType - Provide the element type as string .
 * @param {HTMLCanvasElement} attribute - Provide the object .
 * @private
 */
export declare function createHtmlElement(elementType: string, attribute?: Object): HTMLElement;
/**
 *will get the child nodes .\
 *
 * @returns {HTMLElement} will provide the svg element  .
 * @param {string} node - Provide the element type as string .
 * @private
 */
export declare function getChildNode(node: SVGElement): SVGElement[] | HTMLCollection;
/**
 *will return the size of the text .\
 *
 * @returns {Size} will provide the svg element  .
 * @param {BaseAttributes} textContent - Provide the base attribtues of the text .
 * @private
 */
export declare function measureText(textContent: BaseAttributes): Size;
/**
 *Will assign the attributes .\
 *
 * @returns {void} Will assign the attrbutes  .
 * @param {HTMLElement} element - Provide the element .
 * @param {Object} attributes - Provide the  attribtues  .
 * @private
 */
export declare function setAttribute(element: HTMLElement | SVGElement, attributes: Object): void;
/**
 *Will create the required SVG element .\
 *
 * @returns {HTMLElement | SVGElement} Will create the required SVG element  .
 * @param {string} elementType - Provide the element type.
 * @param {Object} attribute - Provide the  attribtues  .
 * @private
 */
export declare function createSvgElement(elementType: string, attribute: Object): HTMLElement | SVGElement;
/**
 *Will create measure element .\
 *
 * @returns {void} Will create measure element  .
 * @private
 */
export declare function createMeasureElements(): void;
