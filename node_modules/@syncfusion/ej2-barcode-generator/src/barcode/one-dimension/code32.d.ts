import { OneDimension } from '../one-dimension';
/**
 * code39 used to calculate the barcode of type 39
 */
export declare class Code32 extends OneDimension {
    /**
     * Validate the given input.
     *
     * @returns {string} Validate the given input.
     * @param {string} char - Provide the canvas element .
     * @private
     */
    validateInput(char: string): string;
    /**
     * Validate the given input.
     *
     * @returns {object} Validate the given input.
     * @private
     */
    private getCodeValue;
    private getPatternCollection;
    /**
     * Draw the barcode SVG.\
     *
     * @returns {void} Draw the barcode SVG .
     *  @param {HTMLElement} canvas - Provide the canvas element .
     * @private
     */
    draw(canvas: HTMLElement): void;
}
