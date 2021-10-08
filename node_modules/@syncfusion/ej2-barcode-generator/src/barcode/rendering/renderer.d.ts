import { IBarcodeRenderer } from './IRenderer';
/**
 * Renderer
 */
/**
 * Renderer module is used to render basic barcode elements
 */
/** @private */
export declare class BarcodeRenderer {
    /**   @private  */
    renderer: IBarcodeRenderer;
    isSvgMode: boolean;
    constructor(name: string, isSvgMode: boolean);
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
    renderRectElement(canvas: HTMLCanvasElement, attribute: Object): HTMLElement;
    /**
     * Draw the text for the barcode.\
     *
     * @returns {HTMLElement} Draw the barcode SVG .
     *  @param {Object} canvas - Provide the canvas element .
     *  @param {Object} attribute - Provide the canvas element .
     * @private
     */
    renderTextElement(canvas: HTMLCanvasElement, attribute: Object): HTMLElement;
}
