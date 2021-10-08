/**
 * Specifies Circular-Gauge Common Helper methods
 */
import { FontModel } from '../model/base-model';
/**
 * @param {number} maxWidth - Specifies the maximum width.
 * @param {string} text - Specifies the text.
 * @param {FontModel} font - Specifies the font.
 * @returns {string} - Returns the label.
 * @private */
export declare function textTrim(maxWidth: number, text: string, font: FontModel): string;
/**
 * @param {string} text - Specifies the text.
 * @param {number} x - Specifies the x value.
 * @param {number} y - Specifies the y value.
 * @param {number} areaWidth - Specifies the area width.
 * @param {string} id - Specifies the id.
 * @param {Element} element - Specifies the element.
 * @returns {void}
 * @private */
export declare function showTooltip(text: string, x: number, y: number, areaWidth: number, id: string, element: Element): void;
