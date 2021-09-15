import { Code128 } from './code128';
/**
 * code128A used to calculate the barcode of type 1228A
 */
export declare class Code128A extends Code128 {
    /**
     * Validate the given input.
     *
     * @returns {string} Validate the given input.
     * @param {string} char - provide the input values .
     * @private
     */
    validateInput(char: string): string;
    /**
     * Draw the barcode SVG.\
     *
     * @returns {void} Draw the barcode SVG .
     * @param {HTMLElement} canvas - Provide the canvas element .
     * @private
     */
    draw(canvas: HTMLElement): void;
}
