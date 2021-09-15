import { OneDimension } from '../one-dimension';
/**
 * This class is  used to calculate the barcode of type Universal Product Code barcode
 */
export declare class UpcA extends OneDimension {
    /**
     * Validate the given input.
     *
     * @returns {string} Validate the given input.
     * @param {string} value - provide the input values .
     * @private
     */
    validateInput(value: string): string;
    private checkSumData;
    private getBinaries;
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
