import { IBarcodeRenderer } from './IRenderer';
import { BaseAttributes } from './canvas-interface';
/**
 * canvas renderer
 */
/** @private */
export declare class BarcodeCanvasRenderer implements IBarcodeRenderer {
    /**
     * Get the context value for the canvas.\
     *
     * @returns {CanvasRenderingContext2D} Get the context value for the canvas .
     * @param {HTMLCanvasElement} canvas - Provide the canvas element .
     * @private
     */
    static getContext(canvas: HTMLCanvasElement): CanvasRenderingContext2D;
    /**
     * Draw the root element for the barcode.\
     *
     * @returns {HTMLElement} Draw the barcode SVG .
     * @param {Object} attribute - Provide the canvas element .
     * @param {string} backGroundColor - Provide the canvas element .
     * @param {number} width - Provide the canvas element .
     * @param {number} height - Provide the canvas element .
     * @private
     */
    renderRootElement(attribute: Object, backGroundColor: string, width: number, height: number): HTMLElement;
    /**
     * Draw the rect for the barcode.\
     *
     * @returns {HTMLElement} Draw the barcode SVG .
     *  @param {Object} canvas - Provide the canvas element .
     *  @param {Object} attribute - Provide the canvas element .
     * @private
     */
    renderRect(canvas: HTMLCanvasElement, attribute: BaseAttributes): HTMLElement;
    /**
     * Draw the text for the barcode.\
     *
     * @returns {HTMLElement} Draw the barcode SVG .
     *  @param {Object} canvas - Provide the canvas element .
     *  @param {Object} attribute - Provide the canvas element .
     * @private
     */
    renderText(canvas: HTMLCanvasElement, attribute: BaseAttributes): HTMLElement;
}
