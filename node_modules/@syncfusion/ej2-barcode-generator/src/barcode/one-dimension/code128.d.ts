import { OneDimension } from '../one-dimension';
/**
 * code128 used to calculate the barcode of type 128
 */
export declare class Code128 extends OneDimension {
    /**
     * Validate the given input.
     *
     * @returns {string} Validate the given input.
     *  @param {string} char - provide the input values .
     * @private
     */
    validateInput(char: string): string;
    private getCodeValue;
    private getBytes;
    private appendStartStopCharacters;
    private check128C;
    private check128A;
    private check128B;
    private clipAB;
    private code128Clip;
    private clipC;
    /**
     * Draw the barcode SVG.\
     *
     * @returns {void} Draw the barcode SVG .
     *  @param {HTMLElement} canvas - Provide the canvas element .
     * @private
     */
    draw(canvas: HTMLElement): void;
    /**
     * Draw the barcode SVG.\
     *
     * @returns {void} Draw the barcode SVG .
     *  @param {HTMLElement} canvas - Provide the canvas element .
     * @private
     */
    code128(canvas: HTMLElement): void;
    private encodeData;
    private swap;
    private encode;
    private correctIndex;
    private getCodes;
}
