var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable valid-jsdoc */
/* eslint-disable jsdoc/require-returns */
/* eslint-disable jsdoc/require-param */
import { PathOption } from '@syncfusion/ej2-svg-base';
import { remove, createElement } from '@syncfusion/ej2-base';
/**
 * helper for progress bar
 */
/** @private */
var Rect = /** @class */ (function () {
    function Rect(x, y, height, width) {
        this.x = x;
        this.y = y;
        this.height = height;
        this.width = width;
    }
    return Rect;
}());
export { Rect };
/** @private */
var Size = /** @class */ (function () {
    function Size(height, width) {
        this.height = height;
        this.width = width;
    }
    return Size;
}());
export { Size };
/** @private */
var Pos = /** @class */ (function () {
    function Pos(x, y) {
        this.x = x;
        this.y = y;
    }
    return Pos;
}());
export { Pos };
/** @private */
var RectOption = /** @class */ (function (_super) {
    __extends(RectOption, _super);
    function RectOption(id, fill, width, color, opacity, rect, rx, ry, transform, dashArray) {
        var _this = _super.call(this, id, fill, width, color, opacity, dashArray) || this;
        _this.y = rect.y;
        _this.x = rect.x;
        _this.height = rect.height;
        _this.width = rect.width;
        _this.rx = rx ? rx : 0;
        _this.ry = ry ? ry : 0;
        _this.transform = transform ? transform : '';
        _this.stroke = (width !== 0 && _this.stroke !== '') ? color : 'transparent';
        return _this;
    }
    return RectOption;
}(PathOption));
export { RectOption };
/** @private */
var ColorValue = /** @class */ (function () {
    function ColorValue(r, g, b) {
        this.r = r;
        this.g = g;
        this.b = b;
    }
    return ColorValue;
}());
export { ColorValue };
/** @private */
export function convertToHexCode(value) {
    return '#' + componentToHex(value.r) + componentToHex(value.g) + componentToHex(value.b);
}
/** @private */
export function componentToHex(value) {
    var hex = value.toString(16);
    return hex.length === 1 ? '0' + hex : hex;
}
/** @private */
export function convertHexToColor(hex) {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? new ColorValue(parseInt(result[1], 16), parseInt(result[2], 16), parseInt(result[3], 16)) :
        new ColorValue(255, 255, 255);
}
/** @private */
export function colorNameToHex(color) {
    color = color === 'transparent' ? 'white' : color;
    document.body.appendChild(createElement('text', { id: 'chartmeasuretext' }));
    var element = document.getElementById('chartmeasuretext');
    element.style.color = color;
    color = window.getComputedStyle(element).color;
    remove(element);
    var exp = /^(rgb|hsl)(a?)[(]\s*([\d.]+\s*%?)\s*,\s*([\d.]+\s*%?)\s*,\s*([\d.]+\s*%?)\s*(?:,\s*([\d.]+)\s*)?[)]$/;
    var isRGBValue = exp.exec(color);
    return convertToHexCode(new ColorValue(parseInt(isRGBValue[3], 10), parseInt(isRGBValue[4], 10), parseInt(isRGBValue[5], 10)));
}
/** @private */
var TextOption = /** @class */ (function () {
    function TextOption(id, fontSize, fontStyle, fontFamily, fontWeight, textAnchor, fill, x, y, width, height) {
        this.id = id;
        this['font-size'] = fontSize;
        this['font-style'] = fontStyle;
        this['font-family'] = fontFamily;
        this['font-weight'] = fontWeight;
        this['text-anchor'] = textAnchor;
        this.fill = fill;
        this.x = x;
        this.y = y;
        this.width = width ? width : 0;
        this.height = height ? height : 0;
    }
    return TextOption;
}());
export { TextOption };
/** calculate the start and end point of circle */
export function degreeToLocation(centerX, centerY, radius, angleInDegrees) {
    var angleInRadians = (angleInDegrees - 90) * (Math.PI / 180);
    return {
        x: centerX + (radius * Math.cos(angleInRadians)),
        y: centerY + (radius * Math.sin(angleInRadians))
    };
}
/** calculate the path of the circle */
export function getPathArc(x, y, radius, startAngle, endAngle, enableRtl, pieView) {
    var start = degreeToLocation(x, y, radius, startAngle);
    var end = degreeToLocation(x, y, radius, endAngle);
    var largeArcFlag = '0';
    var sweepFlag = (enableRtl) ? '0' : '1';
    if (!enableRtl) {
        largeArcFlag = ((endAngle >= startAngle) ? endAngle : endAngle + 360) - startAngle <= 180 ? '0' : '1';
    }
    else {
        largeArcFlag = ((startAngle >= endAngle) ? startAngle : startAngle + 360) - endAngle <= 180 ? '0' : '1';
    }
    var d;
    if (pieView) {
        d = 'M ' + x + ' ' + y + ' L ' + start.x + ' ' + start.y + ' A ' + radius + ' ' +
            radius + ' ' + ' 0 ' + ' ' + largeArcFlag + ' ' + sweepFlag + ' ' + end.x + ' ' + end.y + ' ' + 'Z';
    }
    else {
        d = 'M' + start.x + ' ' + start.y +
            'A' + radius + ' ' + radius + ' ' + '0' + ' ' + largeArcFlag + ' ' + sweepFlag + ' ' + end.x + ' ' + end.y;
    }
    return d;
}
/** @private */
export function stringToNumber(value, containerSize) {
    if (value !== null && value !== undefined) {
        return value.indexOf('%') !== -1 ? (containerSize / 100) * parseInt(value, 10) : parseInt(value, 10);
    }
    return null;
}
/** @private */
export function setAttributes(options, element) {
    var keys = Object.keys(options);
    for (var i = 0; i < keys.length; i++) {
        element.setAttribute(keys[i], options[keys[i]]);
    }
    return element;
}
/**
 * Animation Effect Calculation
 *
 * @private
 */
export function effect(currentTime, startValue, endValue, duration, enableRtl) {
    var start = (enableRtl) ? endValue : -endValue;
    var end = startValue + ((enableRtl) ? -endValue : endValue);
    return start * Math.cos(currentTime / duration * (Math.PI / 2)) + end;
}
/**
 * @private
 */
export var annotationRender = 'annotationRender';
/**
 * @private
 */
export function getElement(id) {
    return document.getElementById(id);
}
/**
 * @private
 */
export function removeElement(id) {
    if (!id) {
        return null;
    }
    var element = typeof id === 'string' ? getElement(id) : id;
    if (element) {
        remove(element);
    }
}
/**
 * @private
 */
var ProgressLocation = /** @class */ (function () {
    function ProgressLocation(x, y) {
        this.x = x;
        this.y = y;
    }
    return ProgressLocation;
}());
export { ProgressLocation };
