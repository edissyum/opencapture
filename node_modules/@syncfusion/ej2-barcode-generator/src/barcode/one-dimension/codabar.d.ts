import { OneDimension } from '../one-dimension';
/**
 * codabar used to calculate the barcode of type codabar
 */
export declare class CodaBar extends OneDimension {
    /**
     * Validate the given input.
     *
     * @returns {string} Validate the given input.
     *  @param {string} char - provide the input values .
     * @private
     */
    validateInput(char: string): string;
    private getCodeValue;
    private appendStartStopCharacters;
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
