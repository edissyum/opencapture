import { Code39 } from './code39';
/**
 * code39 used to calculate the barcode of type 39
 */
export declare class Code39Extension extends Code39 {
    private code39ExtensionValues;
    /**
     * Validate the given input.
     *
     * @returns {string} Validate the given input.
     * @param {string} char - Provide the canvas element .
     * @private
     */
    validateInput(char: string): string;
    private checkText;
    private code39Extension;
    /**
     * Draw the barcode SVG.\
     *
     * @returns {void} Draw the barcode SVG .
     *  @param {HTMLElement} canvas - Provide the canvas element .
     * @private
     */
    drawCode39(canvas: HTMLElement): void;
}
