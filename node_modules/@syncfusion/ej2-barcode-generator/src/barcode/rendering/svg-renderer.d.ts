import { IBarcodeRenderer } from './IRenderer';
import { BaseAttributes } from './canvas-interface';
/**
 * svg renderer
 */
/** @private */
export declare class BarcodeSVGRenderering implements IBarcodeRenderer {
    /**
     * Draw the root element for the barcode.\
     *
     * @returns {HTMLElement} Draw the barcode SVG .
     * @param {Object} attribute - Provide the canvas element .
     * @param {string} backGroundColor - Provide the canvas element .
     * @private
     */
    renderRootElement(attribute: Object, backGroundColor: string): HTMLElement;
    /**
     * Draw the rect for the barcode.\
     *
     * @returns {HTMLElement} Draw the barcode SVG .
     *  @param {Object} svg - Provide the canvas element .
     *  @param {Object} attribute - Provide the canvas element .
     * @private
     */
    renderRect(svg: HTMLElement, attribute: BaseAttributes): HTMLElement;
    /**
     * Draw the text for the barcode.\
     *
     * @returns {HTMLElement} Draw the barcode SVG .
     *  @param {Object} svg - Provide the canvas element .
     *  @param {Object} attribute - Provide the canvas element .
     * @private
     */
    renderText(svg: HTMLElement, attribute: BaseAttributes): HTMLElement;
}
