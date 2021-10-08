import { Rect } from '../primitives/rect';
import { Size } from '../primitives/size';
import { whiteSpaceToString, wordBreakToString, textAlignToString, bBoxText } from './base-util';
import { identityMatrix, transformPointByMatrix, rotateMatrix } from '../primitives/matrix';
import { createElement, Browser } from '@syncfusion/ej2-base';
/**
 * Defines the functionalities that need to access DOM
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
export function translatePoints(element, points) {
    var translatedPts = [];
    for (var _i = 0, points_1 = points; _i < points_1.length; _i++) {
        var point = points_1[_i];
        var pt1 = {
            x: element.offsetX - element.actualSize.width * element.pivot.x + point.x,
            y: element.offsetY - element.actualSize.height * element.pivot.y + point.y
        };
        var matrix = void 0;
        var angle = element.rotateAngle + element.parentTransform;
        if (angle) {
            matrix = identityMatrix();
            rotateMatrix(matrix, angle, element.offsetX, element.offsetY);
        }
        if (matrix) {
            pt1 = transformPointByMatrix(matrix, pt1);
        }
        translatedPts.push(pt1);
    }
    return translatedPts;
}
/** @private */
export function measurePath(data) {
    var path = 'pathTable';
    if (!window[path]) {
        window[path] = {};
    }
    if (data) {
        var measureElement = 'measureElement';
        window[measureElement].style.visibility = 'visible';
        var svg = window[measureElement].children[2];
        var element = getChildNode(svg)[0];
        element.setAttribute('d', data);
        //let bounds: SVGRect = element.getBBox();
        var bounds = void 0;
        if (window[path][data]) {
            bounds = window[path][data];
        }
        else {
            window[path][data] = bounds = element.getBBox();
            if ((bounds.x === 0 || bounds.y === 0) && (bounds.width === 0 || bounds.height === 0)) {
                window[path][data] = bounds = getBBox(data);
            }
        }
        var svgBounds = new Rect(bounds.x, bounds.y, bounds.width, bounds.height);
        window[measureElement].style.visibility = 'hidden';
        return svgBounds;
    }
    return new Rect(0, 0, 0, 0);
}
// tslint:disable-next-line
function getBBox(path) {
    var xmin = 0;
    var xmax = 0;
    var ymin = 0;
    var ymax = 0;
    // tslint:disable-next-line
    var currentValue;
    // tslint:disable-next-line
    var currentpath = path;
    currentpath = currentpath.replace(/[a-z].*/g, ' ').replace(/[\sA-Z]+/gi, ' ').trim().split(' ');
    for (var i = 0; i < currentpath.length; i++) {
        if (currentpath[i].length > 1) {
            currentValue = currentpath[i].split(',');
            xmin = xmax = currentValue[0];
            ymin = ymax = currentValue[1];
        }
    }
    for (var i = 0; i < currentpath.length; i++) {
        currentValue = currentpath[i].split(',');
        if (!currentValue[1]) {
            currentValue[0] = xmin;
            currentValue[1] = ymin;
        }
        xmin = Math.min(xmin, currentValue[0]);
        xmax = Math.max(xmax, currentValue[0]);
        ymin = Math.min(ymin, currentValue[1]);
        ymax = Math.max(ymax, currentValue[1]);
    }
    return { x: xmin, y: ymin, width: xmax - xmin, height: ymax - ymin };
}
function getTextOptions(element, maxWidth) {
    var options = {
        fill: element.style.fill, stroke: element.style.strokeColor, angle: element.rotateAngle + element.parentTransform,
        pivotX: element.pivot.x, pivotY: element.pivot.y, strokeWidth: element.style.strokeWidth,
        dashArray: element.style.strokeDashArray, opacity: element.style.opacity,
        visible: element.visible, id: element.id,
        width: maxWidth || element.actualSize.width, height: element.actualSize.height,
        x: element.offsetX - element.actualSize.width * element.pivot.x + 0.5,
        y: element.offsetY - element.actualSize.height * element.pivot.y + 0.5
    };
    options.fontSize = element.style.fontSize;
    options.fontFamily = element.style.fontFamily;
    options.textOverflow = element.style.textOverflow;
    options.textDecoration = element.style.textDecoration;
    options.doWrap = element.doWrap;
    options.whiteSpace = whiteSpaceToString(element.style.whiteSpace, element.style.textWrapping);
    options.content = element.content;
    options.textWrapping = element.style.textWrapping;
    options.breakWord = wordBreakToString(element.style.textWrapping);
    options.textAlign = textAlignToString(element.style.textAlign);
    options.color = element.style.color;
    options.italic = element.style.italic;
    options.bold = element.style.bold;
    options.dashArray = '';
    options.strokeWidth = 0;
    options.fill = '';
    return options;
}
function wrapSvgText(text, textValue) {
    var childNodes = [];
    var k = 0;
    var txtValue;
    var bounds1;
    var content = textValue || text.content;
    if (text.whiteSpace !== 'nowrap' && text.whiteSpace !== 'pre') {
        if (text.breakWord === 'breakall') {
            txtValue = '';
            txtValue += content[0];
            for (k = 0; k < content.length; k++) {
                bounds1 = bBoxText(txtValue, text);
                if (bounds1 >= text.width && txtValue.length > 0) {
                    childNodes[childNodes.length] = { text: txtValue, x: 0, dy: 0, width: bounds1 };
                    txtValue = '';
                }
                else {
                    txtValue = txtValue + (content[k + 1] || '');
                    // if (txtValue.indexOf('\n') > -1) {
                    //     txtValue = txtValue.replace('\n', '');
                    // }
                    var width = bBoxText(txtValue, text);
                    if ((Math.ceil(width) + 2 >= text.width && txtValue.length > 0) || (txtValue.indexOf('\n') > -1)) {
                        childNodes[childNodes.length] = { text: txtValue, x: 0, dy: 0, width: width };
                        txtValue = '';
                    }
                    if (k === content.length - 1 && txtValue.length > 0) {
                        childNodes[childNodes.length] = { text: txtValue, x: 0, dy: 0, width: width };
                        txtValue = '';
                    }
                }
            }
        }
        else {
            childNodes = wordWrapping(text, textValue);
        }
    }
    else {
        childNodes[childNodes.length] = { text: content, x: 0, dy: 0, width: bBoxText(content, text) };
    }
    return childNodes;
}
function wordWrapping(text, textValue) {
    var childNodes = [];
    var txtValue = '';
    var j = 0;
    var i = 0;
    var wrap = text.whiteSpace !== 'nowrap' ? true : false;
    var content = textValue || text.content;
    var eachLine = content.split('\n');
    var txt;
    var words;
    var newText;
    var existingWidth;
    var existingText;
    for (j = 0; j < eachLine.length; j++) {
        txt = '';
        words = text.textWrapping !== 'NoWrap' ? eachLine[j].split(' ') : eachLine;
        for (i = 0; i < words.length; i++) {
            txtValue += (((i !== 0 || words.length === 1) && wrap && txtValue.length > 0) ? ' ' : '') + words[i];
            newText = txtValue + (words[i + 1] || '');
            var width = bBoxText(newText, text);
            if (Math.floor(width) > text.width - 2 && txtValue.length > 0) {
                childNodes[childNodes.length] = {
                    text: txtValue, x: 0, dy: 0,
                    width: newText === txtValue ? width : (txtValue === existingText) ? existingWidth : bBoxText(txtValue, text)
                };
                txtValue = '';
            }
            else {
                if (i === words.length - 1) {
                    childNodes[childNodes.length] = { text: txtValue, x: 0, dy: 0, width: width };
                    txtValue = '';
                }
            }
            existingText = newText;
            existingWidth = width;
        }
    }
    return childNodes;
}
function wrapSvgTextAlign(text, childNodes) {
    var wrapBounds = { x: 0, width: 0 };
    var k = 0;
    var txtWidth;
    var width;
    for (k = 0; k < childNodes.length; k++) {
        txtWidth = childNodes[k].width;
        width = txtWidth;
        if (text.textAlign === 'left') {
            txtWidth = 0;
        }
        else if (text.textAlign === 'center') {
            if (txtWidth > text.width && (text.textOverflow === 'Ellipsis' || text.textOverflow === 'Clip')) {
                txtWidth = 0;
            }
            else {
                txtWidth = -txtWidth / 2;
            }
        }
        else if (text.textAlign === 'right') {
            txtWidth = -txtWidth;
        }
        else {
            txtWidth = childNodes.length > 1 ? 0 : -txtWidth / 2;
        }
        childNodes[k].dy = text.fontSize * 1.2;
        childNodes[k].x = txtWidth;
        if (!wrapBounds) {
            wrapBounds = {
                x: txtWidth,
                width: width
            };
        }
        else {
            wrapBounds.x = Math.min(wrapBounds.x, txtWidth);
            wrapBounds.width = Math.max(wrapBounds.width, width);
        }
    }
    return wrapBounds;
}
/** @private */
export function measureText(text, style, content, maxWidth, textValue) {
    var bounds = new Size(0, 0);
    var childNodes;
    var wrapBounds;
    var options = getTextOptions(text, maxWidth);
    text.childNodes = childNodes = wrapSvgText(options, textValue);
    text.wrapBounds = wrapBounds = wrapSvgTextAlign(options, childNodes);
    bounds.width = wrapBounds.width;
    if (text.wrapBounds.width >= maxWidth && options.textOverflow !== 'Wrap') {
        bounds.width = maxWidth;
    }
    bounds.height = childNodes.length * text.style.fontSize * 1.2;
    return bounds;
}
/** @private */
export function getDiagramElement(elementId, contentId) {
    var diagramElement;
    var element;
    if (contentId) {
        element = document.getElementById(contentId);
    }
    diagramElement = (element) ? element.querySelector('#' + elementId) : document.getElementById(elementId);
    return diagramElement;
}
/** @private */
export function createHtmlElement(elementType, attribute) {
    var element = createElement(elementType);
    setAttributeHtml(element, attribute);
    return element;
}
/** @private */
export function setAttributeHtml(element, attributes) {
    var keys = Object.keys(attributes);
    for (var i = 0; i < keys.length; i++) {
        element.setAttribute(keys[i], attributes[keys[i]]);
    }
}
/**
 * @private
 */
export function getAdornerLayerSvg(diagramId, index) {
    var adornerLayerSvg = null;
    var diagramElement = getDiagramElement(diagramId + index + '_diagramAdornerLayer');
    var elementcoll;
    if (diagramElement) {
        elementcoll = diagramElement.getElementsByClassName('e-adorner-layer' + index);
        adornerLayerSvg = elementcoll[0];
    }
    return adornerLayerSvg;
}
/** @private */
export function getSelectorElement(diagramId, index) {
    var adornerLayer = null;
    var adornerSvg = getAdornerLayerSvg(diagramId, index);
    if (adornerSvg) {
        adornerLayer = adornerSvg.getElementById(diagramId + '_SelectorElement');
    }
    return adornerLayer;
}
/** @private */
export function createMeasureElements() {
    var measureElement = 'measureElement';
    if (!window[measureElement]) {
        var divElement = createHtmlElement('div', {
            id: 'measureElement',
            style: 'visibility:hidden ; height: 0px ; width: 0px; overflow: hidden;'
        });
        var text = createHtmlElement('span', { 'style': 'display:inline-block ; line-height: normal' });
        divElement.appendChild(text);
        var imageElement = void 0;
        imageElement = createHtmlElement('img', {});
        divElement.appendChild(imageElement);
        var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('xlink', 'http://www.w3.org/1999/xlink');
        divElement.appendChild(svg);
        var element = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        svg.appendChild(element);
        var data = document.createTextNode('');
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
/** @private */
export function measureImage(source, contentSize) {
    var measureElement = 'measureElement';
    window[measureElement].style.visibility = 'visible';
    var imageElement = window[measureElement].children[1];
    imageElement.setAttribute('src', source);
    var bounds = imageElement.getBoundingClientRect();
    var width = bounds.width;
    var height = bounds.height;
    contentSize = new Size(width, height);
    window[measureElement].style.visibility = 'hidden';
    return contentSize;
}
