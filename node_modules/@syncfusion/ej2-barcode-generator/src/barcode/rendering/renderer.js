import { BarcodeCanvasRenderer } from './canvas-renderer';
import { BarcodeSVGRenderering } from './svg-renderer';
/**
 * Renderer
 */
/**
 * Renderer module is used to render basic barcode elements
 */
/** @private */
var BarcodeRenderer = /** @class */ (function () {
    function BarcodeRenderer(name, isSvgMode) {
        /**   @private  */
        this.renderer = null;
        this.isSvgMode = null;
        this.isSvgMode = isSvgMode;
        this.renderer = isSvgMode ? new BarcodeSVGRenderering() : new BarcodeCanvasRenderer();
    }
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
    // eslint-disable-next-line
    BarcodeRenderer.prototype.renderRootElement = function (attribute, backGroundColor, width, height) {
        var canvasObj = this.renderer.renderRootElement(attribute, backGroundColor, width, height);
        return canvasObj;
    };
    /**
     * Draw the rect for the barcode.\
     *
     * @returns {HTMLElement} Draw the barcode SVG .
     *  @param {Object} canvas - Provide the canvas element .
     *  @param {Object} attribute - Provide the canvas element .
     * @private
     */
    // eslint-disable-next-line
    BarcodeRenderer.prototype.renderRectElement = function (canvas, attribute) {
        var canvasObj = this.renderer.renderRect(canvas, attribute);
        return canvasObj;
    };
    /**
     * Draw the text for the barcode.\
     *
     * @returns {HTMLElement} Draw the barcode SVG .
     *  @param {Object} canvas - Provide the canvas element .
     *  @param {Object} attribute - Provide the canvas element .
     * @private
     */
    // eslint-disable-next-line
    BarcodeRenderer.prototype.renderTextElement = function (canvas, attribute) {
        var canvasObj = this.renderer.renderText(canvas, attribute);
        return canvasObj;
    };
    return BarcodeRenderer;
}());
export { BarcodeRenderer };
