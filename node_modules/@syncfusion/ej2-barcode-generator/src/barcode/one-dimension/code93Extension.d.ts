import { Code93 } from './code93';
/**
 * code39 used to calculate the barcode of type 39
 */
export declare class Code93Extension extends Code93 {
    /**
     * Validate the given input.
     *
     * @returns {string} Validate the given input.
     * @param {string} text - Provide the canvas element .
     * @private
     */
    validateInput(text: string): string;
    private getValue;
    private barcodeSymbols;
    private getBars;
    private GetExtendedText;
    /**
     * Draw the barcode SVG.\
     *
     * @returns {void} Draw the barcode SVG .
     *  @param {HTMLElement} canvas - Provide the canvas element .
     * @private
     */
    drawCode93(canvas: HTMLElement): void;
    private extendedText;
    private GetCheckSumSymbols;
    private CalculateCheckDigit;
    private getArrayValue;
    private encoding;
}
