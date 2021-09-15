/**
 * svg renderer
 */
import { createHtmlElement } from '../utility/dom-util';
/** @private */
var BarcodeSVGRenderer = /** @class */ (function () {
    function BarcodeSVGRenderer() {
    }
    /**
     * Draw the root element for the barcode.\
     *
     * @returns {HTMLElement} Draw the barcode SVG .
     * @param {Object} attribute - Provide the canvas element .
     * @private
     */
    // eslint-disable-next-line
    BarcodeSVGRenderer.prototype.renderRootElement = function (attribute) {
        var canvasObj = createHtmlElement('canvase', attribute);
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
    BarcodeSVGRenderer.prototype.renderRect = function (canvas, attribute) {
        var canvasObj = createHtmlElement('canvase', attribute);
        return canvasObj;
    };
    /**
     * Draw the horizontal line for the barcode.\
     *
     * @returns {HTMLElement} Draw the barcode SVG .
     *  @param {Object} canvas - Provide the canvas element .
     *  @param {Object} attribute - Provide the canvas element .
     * @private
     */
    // eslint-disable-next-line
    BarcodeSVGRenderer.prototype.renderLine = function (canvas, attribute) {
        var canvasObj = createHtmlElement('canvase', attribute);
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
    BarcodeSVGRenderer.prototype.renderText = function (canvas, attribute) {
        var canvasObj = createHtmlElement('canvase', attribute);
        return canvasObj;
    };
    return BarcodeSVGRenderer;
}());
export { BarcodeSVGRenderer };
