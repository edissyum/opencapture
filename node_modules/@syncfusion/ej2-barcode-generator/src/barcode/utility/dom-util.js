/**
 * DOM util
 */
import { createElement, Browser } from '@syncfusion/ej2-base';
import { Size } from '../primitives/size';
/**
 *will create the hrml element for the barcode .\
 *
 * @returns {HTMLElement} Will download the barode as image .
 * @param {string} elementType - Provide the element type as string .
 * @param {HTMLCanvasElement} attribute - Provide the object .
 * @private
 */
// eslint-disable-next-line
export function createHtmlElement(elementType, attribute) {
    var element = createElement(elementType);
    if (attribute) {
        setAttribute(element, attribute);
    }
    return element;
}
/**
 *will get the child nodes .\
 *
 * @returns {HTMLElement} will provide the svg element  .
 * @param {string} node - Provide the element type as string .
 * @private
 */
export function getChildNode(node) {
    var child;
    var collection = [];
    if (Browser.info.name === 'msie' || Browser.info.name === 'edge') {
        for (var i = 0; i < node.childNodes.length; i++) {
            child = node.childNodes[i];
            if (child.nodeType === 1) {
                collection.push(child);
            }
        }
    }
    else {
        collection = node.children;
    }
    return collection;
}
/**
 *will return the size of the text .\
 *
 * @returns {Size} will provide the svg element  .
 * @param {BaseAttributes} textContent - Provide the base attribtues of the text .
 * @private
 */
export function measureText(textContent) {
    var measureElement = 'barcodeMeasureElement';
    window[measureElement].style.visibility = 'visible';
    var svg = window[measureElement].children[1];
    var text = getChildNode(svg)[0];
    text.textContent = textContent.string;
    text.setAttribute('style', 'font-size:' + textContent.stringSize + 'px; font-family:'
        + textContent.fontStyle + ';font-weight:');
    var bBox = new Size(0, 0);
    bBox.width = text.getBBox().width;
    bBox.height = text.getBBox().height;
    window[measureElement].style.visibility = 'hidden';
    return bBox;
}
/**
 *Will assign the attributes .\
 *
 * @returns {void} Will assign the attrbutes  .
 * @param {HTMLElement} element - Provide the element .
 * @param {Object} attributes - Provide the  attribtues  .
 * @private
 */
// eslint-disable-next-line
export function setAttribute(element, attributes) {
    var keys = Object.keys(attributes);
    for (var i = 0; i < keys.length; i++) {
        element.setAttribute(keys[i], attributes[keys[i]]);
    }
}
/**
 *Will create the required SVG element .\
 *
 * @returns {HTMLElement | SVGElement} Will create the required SVG element  .
 * @param {string} elementType - Provide the element type.
 * @param {Object} attribute - Provide the  attribtues  .
 * @private
 */
// eslint-disable-next-line
export function createSvgElement(elementType, attribute) {
    var element = document.createElementNS('http://www.w3.org/2000/svg', elementType);
    setAttribute(element, attribute);
    return element;
}
/**
 *Will create measure element .\
 *
 * @returns {void} Will create measure element  .
 * @private
 */
export function createMeasureElements() {
    var measureElement = 'barcodeMeasureElement';
    if (!window[measureElement]) {
        var divElement = createHtmlElement('div', {
            id: 'barcodeMeasureElement', class: 'barcodeMeasureElement',
            style: 'visibility:hidden ; height: 0px ; width: 0px; overflow: hidden;'
        });
        var text = createHtmlElement('span', { 'style': 'display:inline-block ; line-height: normal' });
        divElement.appendChild(text);
        var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('xlink', 'http://www.w3.org/1999/xlink');
        divElement.appendChild(svg);
        var tSpan = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        tSpan.setAttributeNS('http://www.w3.org/XML/1998/namespace', 'xml:space', 'preserve');
        svg.appendChild(tSpan);
        window[measureElement] = divElement;
        window[measureElement].usageCount = 1;
        document.body.appendChild(divElement);
    }
    else {
        window[measureElement].usageCount += 1;
    }
}
