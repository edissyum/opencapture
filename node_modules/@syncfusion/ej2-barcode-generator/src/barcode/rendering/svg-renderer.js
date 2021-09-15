import { createSvgElement } from '../utility/dom-util';
/**
 * svg renderer
 */
/** @private */
var BarcodeSVGRenderering = /** @class */ (function () {
    function BarcodeSVGRenderering() {
    }
    /**
     * Draw the root element for the barcode.\
     *
     * @returns {HTMLElement} Draw the barcode SVG .
     * @param {Object} attribute - Provide the canvas element .
     * @param {string} backGroundColor - Provide the canvas element .
     * @private
     */
    // eslint-disable-next-line
    BarcodeSVGRenderering.prototype.renderRootElement = function (attribute, backGroundColor) {
        var canvasObj = createSvgElement('svg', attribute);
        canvasObj.setAttribute('style', 'background:' + backGroundColor);
        return canvasObj;
    };
    /**
     * Draw the rect for the barcode.\
     *
     * @returns {HTMLElement} Draw the barcode SVG .
     *  @param {Object} svg - Provide the canvas element .
     *  @param {Object} attribute - Provide the canvas element .
     * @private
     */
    BarcodeSVGRenderering.prototype.renderRect = function (svg, attribute) {
        var rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        rect.setAttribute('x', attribute.x.toString());
        rect.setAttribute('y', attribute.y.toString());
        rect.setAttribute('width', attribute.width.toString());
        rect.setAttribute('height', attribute.height.toString());
        rect.setAttribute('fill', attribute.color);
        rect.setAttribute('style', 'shape-rendering: crispEdges');
        svg.appendChild(rect);
        return svg;
    };
    /**
     * Draw the text for the barcode.\
     *
     * @returns {HTMLElement} Draw the barcode SVG .
     *  @param {Object} svg - Provide the canvas element .
     *  @param {Object} attribute - Provide the canvas element .
     * @private
     */
    BarcodeSVGRenderering.prototype.renderText = function (svg, attribute) {
        var text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        text.setAttribute('x', attribute.x.toString());
        text.setAttribute('y', attribute.y.toString());
        text.setAttribute('fill', attribute.color);
        text.style.fontSize = attribute.stringSize.toString() + 'px';
        text.style.fontFamily = attribute.fontStyle;
        text.textContent = attribute.string;
        svg.appendChild(text);
        return svg;
    };
    return BarcodeSVGRenderering;
}());
export { BarcodeSVGRenderering };
