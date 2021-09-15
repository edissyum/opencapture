import { Size } from './../primitives/size';
import { CanvasRenderer } from './../rendering/canvas-renderer';
import { processPathData, pathSegmentCollection } from '../utility/path-util';
/**
 * SVG Renderer
 */
/** @private */
var SvgRenderer = /** @class */ (function () {
    function SvgRenderer() {
    }
    /**   @private  */
    SvgRenderer.prototype.parseDashArray = function (dashArray) {
        var dashes = [];
        return dashes;
    };
    /**   @private  */
    SvgRenderer.prototype.drawRectangle = function (svg, options, diagramId, onlyRect, isSelector, parentSvg, ariaLabel) {
        var id;
        if (options.id === svg.id) {
            id = options.id + '_container';
        }
        else {
            id = options.id;
        }
        var rect;
        if (!rect || isSelector) {
            rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
            svg.appendChild(rect);
        }
        var attr = {
            'id': id, 'x': options.x.toString(), 'y': options.y.toString(), 'width': options.width.toString(),
            'height': options.height.toString(), 'visibility': options.visible ? 'visible' : 'hidden',
            'transform': 'rotate(' + options.angle + ','
                + (options.x + options.width * options.pivotX) + ',' + (options.y + options.height * options.pivotY) + ')',
            'rx': options.cornerRadius || 0, 'ry': options.cornerRadius || 0, 'opacity': options.opacity,
            'aria-label': ariaLabel ? ariaLabel : ''
        };
        if (options.class) {
            attr['class'] = options.class;
        }
        var poiterEvents = 'pointer-events';
        if (!ariaLabel) {
            attr[poiterEvents] = 'none';
        }
        setAttributeSvg(rect, attr);
        this.setSvgStyle(rect, options, diagramId);
    };
    /**   @private  */
    SvgRenderer.prototype.updateSelectionRegion = function (gElement, options) {
        var rect;
        rect = gElement.parentNode.getElementById(options.id);
        var attr;
        attr = {
            'id': options.id, 'x': options.x.toString(), 'y': options.y.toString(), 'width': options.width.toString(),
            'height': options.height.toString(), 'transform': 'rotate(' + options.angle + ','
                + (options.x + options.width * options.pivotX) + ',' + (options.y + options.height * options.pivotY) + ')',
            class: 'e-diagram-selected-region'
        };
        if (!rect) {
            rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
            gElement.appendChild(rect);
        }
        this.setSvgStyle(rect, options);
        setAttributeSvg(rect, attr);
    };
    /**   @private  */
    SvgRenderer.prototype.createGElement = function (elementType, attribute) {
        var gElement = createSvgElement(elementType, attribute);
        return gElement;
    };
    /** @private */
    SvgRenderer.prototype.drawCircle = function (gElement, options, enableSelector, ariaLabel) {
        var circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        this.setSvgStyle(circle, options);
        var classval = options.class || '';
        if (!enableSelector) {
            classval += ' e-disabled';
        }
        var attr = {
            'id': options.id,
            'cx': options.centerX,
            'cy': options.centerY,
            'r': options.radius,
            'visibility': options.visible ? 'visible' : 'hidden',
            'class': classval,
            'aria-label': ariaLabel ? ariaLabel['aria-label'] : ''
        };
        var pointerEvents = 'pointer-events';
        if (attr['aria-label'] === '') {
            attr[pointerEvents] = 'none';
        }
        circle.style.display = options.visible ? 'block' : 'none';
        setAttributeSvg(circle, attr);
        gElement.appendChild(circle);
    };
    /**   @private  */
    SvgRenderer.prototype.setSvgStyle = function (svg, style, diagramId) {
        if (style.canApplyStyle || style.canApplyStyle === undefined) {
            if (style.fill === 'none') {
                style.fill = 'transparent';
            }
            if (style.stroke === 'none') {
                style.stroke = 'transparent';
            }
            var dashArray = [];
            var fill = void 0;
            if (style.dashArray !== undefined) {
                var canvasRenderer = new CanvasRenderer();
                dashArray = canvasRenderer.parseDashArray(style.dashArray);
            }
            fill = style.fill;
            if (style.stroke) {
                svg.setAttribute('stroke', style.stroke);
            }
            if (style.strokeWidth !== undefined && style.strokeWidth !== null) {
                svg.setAttribute('stroke-width', style.strokeWidth.toString());
            }
            if (dashArray) {
                svg.setAttribute('stroke-dasharray', dashArray.toString());
            }
            if (fill) {
                svg.setAttribute('fill', fill);
            }
        }
    };
    //end region
    // text utility
    /**   @private  */
    SvgRenderer.prototype.svgLabelAlign = function (text, wrapBound, childNodes) {
        var bounds = new Size(wrapBound.width, childNodes.length * (text.fontSize * 1.2));
        var pos = { x: 0, y: 0 };
        var x = 0;
        var y = 1.2;
        var offsetX = text.width * 0.5;
        var offsety = text.height * 0.5;
        var pointX = offsetX;
        var pointY = offsety;
        if (text.textAlign === 'left') {
            pointX = 0;
        }
        else if (text.textAlign === 'center') {
            if (wrapBound.width > text.width && (text.textOverflow === 'Ellipsis' || text.textOverflow === 'Clip')) {
                pointX = 0;
            }
            else {
                pointX = text.width * 0.5;
            }
        }
        else if (text.textAlign === 'right') {
            pointX = (text.width * 1);
        }
        pos.x = x + pointX + (wrapBound ? wrapBound.x : 0);
        pos.y = y + pointY - bounds.height / 2;
        return pos;
    };
    /** @private */
    SvgRenderer.prototype.drawLine = function (gElement, options) {
        var line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        this.setSvgStyle(line, options);
        var pivotX = options.x + options.width * options.pivotX;
        var pivotY = options.y + options.height * options.pivotY;
        var kk = '';
        var attr = {
            'id': options.id,
            'x1': options.startPoint.x + options.x,
            'y1': options.startPoint.y + options.y,
            'x2': options.endPoint.x + options.x,
            'y2': options.endPoint.y + options.y,
            'stroke': options.stroke,
            'stroke-width': options.strokeWidth.toString(), 'opacity': options.opacity.toString(),
            'transform': 'rotate(' + options.angle + ' ' + pivotX + ' ' + pivotY + ')',
            'visibility': options.visible ? 'visible' : 'hidden',
        };
        if (options.class) {
            attr['class'] = options.class;
        }
        setAttributeSvg(line, attr);
        gElement.appendChild(line);
    };
    /**   @private  */
    SvgRenderer.prototype.drawPath = function (svg, options, diagramId, isSelector, parentSvg, ariaLabel) {
        var id;
        var x = Math.floor((Math.random() * 10) + 1);
        id = svg.id + '_shape' + x.toString();
        var collection = [];
        collection = processPathData(options.data);
        collection = pathSegmentCollection(collection);
        var shadowElement;
        if (parentSvg) {
            shadowElement = parentSvg.getElementById(options.id + '_groupElement_shadow');
            if (shadowElement) {
                shadowElement.parentNode.removeChild(shadowElement);
            }
        }
        var path;
        if (parentSvg) {
            path = parentSvg.getElementById(options.id);
        }
        if (!path || isSelector) {
            path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            svg.appendChild(path);
        }
        this.renderPath(path, options, collection);
        var attr = {
            'id': options.id, 'transform': 'rotate(' + options.angle + ',' + (options.x + options.width * options.pivotX) + ','
                + (options.y + options.height * options.pivotY) + ')' + 'translate(' + (options.x) + ',' + (options.y) + ')',
            'visibility': options.visible ? 'visible' : 'hidden', 'opacity': options.opacity,
            'aria-label': ariaLabel ? ariaLabel : ''
        };
        if (options.class) {
            attr['class'] = options.class;
        }
        setAttributeSvg(path, attr);
        this.setSvgStyle(path, options, diagramId);
    };
    /**   @private  */
    SvgRenderer.prototype.renderPath = function (svg, options, collection) {
        var x1;
        var y1;
        var x2;
        var y2;
        var x;
        var y;
        var length;
        var i;
        var segments = collection;
        var d = '';
        for (x = 0, y = 0, i = 0, length = segments.length; i < length; ++i) {
            var obj = segments[i];
            var segment = obj;
            var char = segment.command;
            if ('x1' in segment) {
                x1 = segment.x1;
            }
            if ('x2' in segment) {
                x2 = segment.x2;
            }
            if ('y1' in segment) {
                y1 = segment.y1;
            }
            if ('y2' in segment) {
                y2 = segment.y2;
            }
            if ('x' in segment) {
                x = segment.x;
            }
            if ('y' in segment) {
                y = segment.y;
            }
            switch (char) {
                case 'M':
                    d = d + 'M' + x.toString() + ',' + y.toString() + ' ';
                    break;
                case 'L':
                    d = d + 'L' + x.toString() + ',' + y.toString() + ' ';
                    break;
                case 'C':
                    d = d + 'C' + x1.toString() + ',' + y1.toString() + ',' + x2.toString() + ',' + y2.toString() + ',';
                    d += x.toString() + ',' + y.toString() + ' ';
                    break;
                case 'Q':
                    d = d + 'Q' + x1.toString() + ',' + y1.toString() + ',' + x.toString() + ',' + y.toString() + ' ';
                    break;
                case 'A':
                    d = d + 'A' + segment.r1.toString() + ',' + segment.r2.toString() + ',' + segment.angle.toString() + ',';
                    d += segment.largeArc.toString() + ',' + segment.sweep + ',' + x.toString() + ',' + y.toString() + ' ';
                    break;
                case 'Z':
                case 'z':
                    d = d + 'Z' + ' ';
                    break;
            }
        }
        svg.setAttribute('d', d);
    };
    return SvgRenderer;
}());
export { SvgRenderer };
/** @private */
export function setAttributeSvg(svg, attributes) {
    var keys = Object.keys(attributes);
    for (var i = 0; i < keys.length; i++) {
        svg.setAttribute(keys[i], attributes[keys[i]]);
    }
}
/** @private */
export function createSvgElement(elementType, attribute) {
    var element = document.createElementNS('http://www.w3.org/2000/svg', elementType);
    setAttributeSvg(element, attribute);
    return element;
}
/** @private */
export function createSvg(id, width, height) {
    var svgObj = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    setAttributeSvg(svgObj, { 'id': id, 'width': width, 'height': height });
    return svgObj;
}
export function getParentSvg(element, targetElement, canvas) {
    if (element && element.id) {
        if (targetElement && targetElement === 'selector') {
            return this.pdfViewer.adornerSvgLayer;
        }
    }
    return canvas;
}
