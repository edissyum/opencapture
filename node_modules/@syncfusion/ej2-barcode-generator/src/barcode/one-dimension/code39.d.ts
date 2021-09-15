import { OneDimension } from '../one-dimension';
/**
 * code39 used to calculate the barcode of type 39
 */
export declare class Code39 extends OneDimension {
    /**
     * get the code value.
     *
     * @returns {string[]} return the code value.
     * @private
     */
    private getCodeValue;
    /**
     * Provide the string value.
     *
     * @returns {string} Provide the string value.
     * @private
     */
    private getCharacter;
    /**
     *Check sum method for the code 39 bar code
     *
     * @param {string} char - Provide the canvas element .
     * @param {string} characters - Provide the canvas element .
     * @returns {number}Check sum method for the code 39 bar code
     * @private
     */
    private checkSum;
    /**
     * Validate the given input.
     *
     * @returns {string} Validate the given input.
     * @param {string} char - Provide the canvas element .
     * @private
     */
    validateInput(char: string): string;
    private getPatternCollection;
    private appendStartStopCharacters;
    /**
     * Draw the barcode SVG.\
     *
     * @returns {void} Draw the barcode SVG .
     *  @param {HTMLElement} canvas - Provide the canvas element .
     *  @param {HTMLElement} encodedCharacter - Provide the canvas element .
     * @private
     */
    drawCode39Extension(canvas: HTMLElement, encodedCharacter: string): void;
    /**
     * Draw the barcode SVG.\
     *
     * @returns {void} Draw the barcode SVG .
     *  @param {HTMLElement} canvas - Provide the canvas element .
     *  @param {HTMLElement} encodedCharacter - Provide the canvas element .
     * @private
     */
    draw(canvas: HTMLElement, encodedCharacter?: string): void;
}
