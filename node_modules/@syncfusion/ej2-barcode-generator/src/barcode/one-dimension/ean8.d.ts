import { OneDimension } from '../one-dimension';
/**
 * EAN8 class is  used to calculate the barcode of type EAN8 barcode
 */
export declare class Ean8 extends OneDimension {
    /**
     * Validate the given input.
     *
     * @returns {string} Validate the given input.
     * @param {string} value - provide the input values .
     * @private
     */
    validateInput(value: string): string;
    private getCodeValueRight;
    private checkSumData;
    /**
     * Draw the barcode SVG.\
     *
     * @returns {void} Draw the barcode SVG .
     * @param {HTMLElement} canvas - Provide the canvas element .
     * @private
     */
    draw(canvas: HTMLElement): void;
    private leftValue;
}
