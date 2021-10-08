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
import { remove, createElement, isNullOrUndefined } from '@syncfusion/ej2-base';
import { SvgRenderer } from '@syncfusion/ej2-svg-base';
import { RgbColor } from '../utils/colorMapping';
/**
 * Function to check whether target object implement specific interface
 *
 * @param  {string} value - specifies the value
 * @param  {number} containerSize - specifies the containerSize
 * @returns {number} returns the number
 * @hidden
 */
export function stringToNumber(value, containerSize) {
    if (value !== null && value !== undefined) {
        return value.indexOf('%') !== -1 ? (containerSize / 100) * parseInt(value, 10) : parseInt(value, 10);
    }
    return null;
}
/**
 * Function to check whether target object implement specific interface
 *
 * @param  {string} text - specifies the text
 * @param  {FontModel} font - specifies the font
 * @returns {Size} returns the number
 * @hidden
 */
export function measureText(text, font) {
    var htmlObject = document.getElementById('heatmapmeasuretext');
    if (htmlObject === null) {
        htmlObject = createElement('text', { id: 'heatmapmeasuretext' });
        document.body.appendChild(htmlObject);
    }
    htmlObject.innerText = text;
    htmlObject.style.position = 'absolute';
    htmlObject.style.visibility = 'hidden';
    htmlObject.style.fontSize = (font.size).indexOf('px') !== -1 ? font.size : font.size + 'px';
    htmlObject.style.fontWeight = font.fontWeight;
    htmlObject.style.fontStyle = font.fontStyle;
    htmlObject.style.fontFamily = font.fontFamily;
    htmlObject.style.top = '-100';
    htmlObject.style.left = '0';
    htmlObject.style.whiteSpace = 'nowrap';
    // For bootstrap line height issue
    htmlObject.style.lineHeight = 'normal';
    return new Size(htmlObject.clientWidth, htmlObject.clientHeight);
}
/** @private */
var TextElement = /** @class */ (function () {
    function TextElement(fontModel, fontColor) {
        this['font-size'] = fontModel.size;
        this['font-style'] = fontModel.fontStyle.toLowerCase();
        this['font-family'] = fontModel.fontFamily;
        this['font-weight'] = fontModel.fontWeight.toLowerCase();
        this.fill = fontColor ? fontColor : '';
    }
    return TextElement;
}());
export { TextElement };
/**
 * Function to check whether target object implement specific interface
 *
 * @param  {number} width - specifies the text
 * @param  {number} leftPadding - specifies the font
 * @param  {number} rightPadding - specifies the font
 * @param  {FontModel} titleStyle - specifies the font
 * @returns {number} returns the number
 * @hidden
 */
export function titlePositionX(width, leftPadding, rightPadding, titleStyle) {
    var positionX;
    if (titleStyle.textAlignment === 'Near') {
        positionX = leftPadding;
    }
    else if (titleStyle.textAlignment === 'Center') {
        positionX = leftPadding + width / 2;
    }
    else {
        positionX = width + leftPadding;
    }
    return positionX;
}
/**
 * Internal class size for height and width
 *
 * @private
 */
var Size = /** @class */ (function () {
    function Size(width, height) {
        this.width = width;
        this.height = height;
    }
    return Size;
}());
export { Size };
/** @private */
var CustomizeOption = /** @class */ (function () {
    function CustomizeOption(id) {
        this.id = id;
    }
    return CustomizeOption;
}());
export { CustomizeOption };
/** @private */
var PathOption = /** @class */ (function (_super) {
    __extends(PathOption, _super);
    function PathOption(id, fill, width, color, opacity, dashArray, d) {
        var _this = _super.call(this, id) || this;
        _this.opacity = opacity;
        _this.fill = fill;
        _this.stroke = color ? color : '';
        _this['stroke-width'] = parseFloat(width.toString());
        _this['stroke-dasharray'] = dashArray;
        _this.d = d;
        return _this;
    }
    return PathOption;
}(CustomizeOption));
export { PathOption };
/**
 * Class to define currentRect private property.
 *
 * @private
 */
var CurrentRect = /** @class */ (function () {
    function CurrentRect(x, y, width, height, value, id, xIndex, yIndex, xValue, yValue, visible, displayText, textId, allowCollection) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.value = value;
        this.id = id;
        this.xIndex = xIndex;
        this.yIndex = yIndex;
        this.xValue = xValue;
        this.yValue = yValue;
        this.visible = visible;
        this.displayText = displayText;
        this.textId = textId;
        /** @private */
        this.allowCollection = allowCollection;
    }
    return CurrentRect;
}());
export { CurrentRect };
/**
 * Class to define the details of selected cell.
 *
 * @private
 */
var SelectedCellDetails = /** @class */ (function () {
    function SelectedCellDetails(value, xLabel, yLabel, xValue, yValue, cellElement, xPosition, yPosition, width, height, x, y) {
        this.value = value;
        this.xLabel = xLabel;
        this.yLabel = yLabel;
        this.xValue = xValue;
        this.yValue = yValue;
        this.cellElement = cellElement;
        this.xPosition = xPosition;
        this.yPosition = yPosition;
        this.width = width;
        this.height = height;
        this.x = x;
        this.y = y;
    }
    return SelectedCellDetails;
}());
export { SelectedCellDetails };
/**
 * Class to define property to draw rectangle.
 *
 * @private
 */
var RectOption = /** @class */ (function (_super) {
    __extends(RectOption, _super);
    function RectOption(id, fill, border, opacity, rect, borderColor, rx, ry, transform, dashArray) {
        var _this = _super.call(this, id, fill, border.width, borderColor, opacity, dashArray) || this;
        _this.y = rect.y;
        _this.x = rect.x;
        _this.height = rect.height > 0 ? rect.height : 0;
        _this.width = rect.width > 0 ? rect.width : 0;
        _this.rx = rx ? rx : 0;
        _this.ry = ry ? ry : 0;
        _this.transform = transform ? transform : '';
        return _this;
    }
    return RectOption;
}(PathOption));
export { RectOption };
/**
 * Class to define property to draw circle.
 *
 * @private
 */
var CircleOption = /** @class */ (function (_super) {
    __extends(CircleOption, _super);
    function CircleOption(id, fill, border, opacity, borderColor, cx, cy, r) {
        var _this = _super.call(this, id, fill, border.width, borderColor, opacity) || this;
        _this.cx = cx ? cx : 0;
        _this.cy = cy ? cy : 0;
        _this.r = r ? r : 0;
        return _this;
    }
    return CircleOption;
}(PathOption));
export { CircleOption };
/**
 * Helper Class to define property to draw rectangle.
 *
 * @private
 */
var Rect = /** @class */ (function () {
    function Rect(x, y, width, height) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
    }
    return Rect;
}());
export { Rect };
/**
 * Class to define property to draw text.
 *
 * @private
 */
var TextOption = /** @class */ (function (_super) {
    __extends(TextOption, _super);
    function TextOption(id, basic, element, fontColor) {
        var _this = _super.call(this, element, fontColor) || this;
        _this.transform = '';
        _this['dominant-baseline'] = 'auto';
        _this.labelRotation = 0;
        _this.baseline = 'auto';
        _this.id = id;
        _this.x = basic.x;
        _this.y = basic.y;
        _this['text-anchor'] = basic['text-anchor'];
        _this.text = basic.text;
        _this.transform = basic.transform;
        _this.labelRotation = basic.labelRotation;
        _this['dominant-baseline'] = basic['dominant-baseline'];
        _this.baseline = basic.baseline;
        _this.dy = basic.dy;
        return _this;
    }
    return TextOption;
}(TextElement));
export { TextOption };
/**
 * Helper Class to define property to draw text.
 *
 * @private
 */
var TextBasic = /** @class */ (function () {
    function TextBasic(x, y, anchor, text, labelRotation, transform, baseLine, dy) {
        this.transform = '';
        this['dominant-baseline'] = 'auto';
        this.labelRotation = 0;
        this.baseline = 'auto';
        this.x = x ? x : 0;
        this.y = y ? y : 0;
        this['text-anchor'] = anchor ? anchor : 'start';
        this.text = text ? text : '';
        this.transform = transform ? transform : '';
        this.labelRotation = labelRotation;
        this['dominant-baseline'] = baseLine ? baseLine : 'auto';
        this.baseline = baseLine ? baseLine : '';
        this.dy = dy ? dy : '';
    }
    return TextBasic;
}());
export { TextBasic };
/**
 * Class to define property to draw line.
 *
 * @private
 */
var Line = /** @class */ (function () {
    function Line(x1, y1, x2, y2) {
        this.x1 = x1;
        this.y1 = y1;
        this.x2 = x2;
        this.y2 = y2;
    }
    return Line;
}());
export { Line };
/**
 * Class to define property to draw line.
 *
 * @private
 */
var LineOption = /** @class */ (function (_super) {
    __extends(LineOption, _super);
    function LineOption(id, line, stroke, strokewidth, opacity, dasharray) {
        var _this = _super.call(this, id, null, strokewidth, stroke, opacity, dasharray, null) || this;
        _this.x1 = line.x1;
        _this.y1 = line.y1;
        _this.x2 = line.x2;
        _this.y2 = line.y2;
        return _this;
    }
    return LineOption;
}(PathOption));
export { LineOption };
/**
 * Properties required to render path.
 *
 * @private
 */
var PathAttributes = /** @class */ (function (_super) {
    __extends(PathAttributes, _super);
    function PathAttributes(id, path, fill, border, borderWidth, opacity, borderColor) {
        var _this = _super.call(this, id, fill, borderWidth, borderColor, opacity, null) || this;
        _this.d = path.d;
        _this.x = path.x;
        _this.y = path.y;
        return _this;
    }
    return PathAttributes;
}(PathOption));
export { PathAttributes };
/**
 * Helper Class to define property to path.
 *
 * @private
 */
var Path = /** @class */ (function () {
    function Path(d, innerR, x, y, x1, y1, cx, cy, start, end, radius, counterClockWise) {
        this.d = d;
        this.innerR = innerR;
        this.cx = cx;
        this.cy = cy;
        this.x = x;
        this.y = y;
        this.x1 = x1;
        this.y1 = y1;
        this.start = start;
        this.end = end;
        this.radius = radius;
        this.counterClockWise = counterClockWise;
    }
    return Path;
}());
export { Path };
/**
 * Function to check whether target object implement specific interface
 *
 * @param  {number} values - specifies the values
 * @returns {number} returns the number
 * @hidden
 */
export function sum(values) {
    var sum = 0;
    for (var _i = 0, values_1 = values; _i < values_1.length; _i++) {
        var value = values_1[_i];
        sum += value;
    }
    return sum;
}
/**
 * Function to check whether target object implement specific interface
 *
 * @param { Size } heatmapSize - Specifies the heatmapsize
 * @param { number } topPadding - Specifies the topPadding
 * @param { number }  bottomPadding - Specifies the bottomPadding
 * @param { FontModel } titleStyle - Specifies the titleStyle
 * @returns {number} returns the number
 * @private
 */
export function titlePositionY(heatmapSize, topPadding, bottomPadding, titleStyle) {
    var positionY;
    if (titleStyle.textAlignment === 'Near') {
        positionY = heatmapSize.height - bottomPadding;
    }
    else if (titleStyle.textAlignment === 'Center') {
        positionY = heatmapSize.height / 2;
    }
    else {
        positionY = topPadding;
    }
    return positionY;
}
/**
 * Function to check whether target object implement specific interface
 *
 * @param { FontModel } font - Specifies the heatmapsize
 * @param { string } text - Specifies the topPadding
 * @param { number }  angle - Specifies the bottomPadding
 * @returns {Size} returns the size
 * @private
 */
export function rotateTextSize(font, text, angle) {
    var renderer = new SvgRenderer('heatmapMeasureRotateText');
    var svgObject = renderer.createSvg({ id: 'heatmapMeasureRotateText_svg', width: 100, height: 100 });
    var options = {
        'font-size': font.size,
        'font-style': font.fontStyle.toLowerCase(),
        'font-family': font.fontFamily,
        'font-weight': font.fontWeight.toLowerCase(),
        'transform': 'rotate(' + angle + ', 0, 0)',
        'text-anchor': 'middle'
    };
    var htmlObject = renderer.createText(options, text);
    svgObject.appendChild(htmlObject);
    document.body.appendChild(svgObject);
    var box = htmlObject.getBoundingClientRect();
    remove(svgObject);
    return new Size((box.right - box.left), (box.bottom - box.top));
}
/**
 * Class to draw SVG and Canvas Rectangle & Text.
 *
 * @private
 */
var DrawSvgCanvas = /** @class */ (function () {
    function DrawSvgCanvas(heatmap) {
        this.heatMap = heatmap;
    }
    //Svg & Canvas Rectangle Part
    DrawSvgCanvas.prototype.drawRectangle = function (properties, parentElement, isFromSeries) {
        if (!this.heatMap.enableCanvasRendering) {
            delete properties.d;
            parentElement.appendChild(this.heatMap.renderer.drawRectangle(properties));
        }
        else {
            this.drawCanvasRectangle(this.heatMap.canvasRenderer, properties, isFromSeries);
        }
    };
    //Svg & Canvas Bubble Part
    DrawSvgCanvas.prototype.drawCircle = function (properties, parentElement) {
        if (!this.heatMap.enableCanvasRendering) {
            delete properties.d;
            parentElement.appendChild(this.heatMap.renderer.drawCircle(properties));
        }
        else {
            this.drawCanvasCircle(this.heatMap.canvasRenderer, properties);
        }
    };
    //Svg & Canvas Pie Part
    DrawSvgCanvas.prototype.drawPath = function (properties, options, parentElement) {
        if (!this.heatMap.enableCanvasRendering) {
            delete properties.x;
            delete properties.y;
            parentElement.appendChild(this.heatMap.renderer.drawPath(properties));
        }
        else {
            this.drawCanvasPath(this.heatMap.canvasRenderer, properties, options);
        }
    };
    //Svg & Canvas Text Part
    DrawSvgCanvas.prototype.createText = function (properties, parentElement, text) {
        if (!this.heatMap.enableCanvasRendering) {
            delete properties.labelRotation;
            delete properties.baseline;
            delete properties.text;
            parentElement.appendChild(this.heatMap.renderer.createText(properties, text));
            properties.text = text;
        }
        else {
            this.canvasDrawText(properties, text);
        }
    };
    //Draw the wrapped text for both SVG & canvas
    DrawSvgCanvas.prototype.createWrapText = function (options, font, parentElement) {
        var renderOptions = {};
        var htmlObject;
        var tspanElement;
        var height;
        renderOptions = {
            'id': options.id,
            'x': options.x,
            'y': options.y,
            'fill': options.fill,
            'font-size': font.size,
            'font-style': font.fontStyle,
            'font-family': font.fontFamily,
            'font-weight': font.fontWeight.toLowerCase(),
            'text-anchor': options['text-anchor'],
            'transform': options.transform,
            'dominant-baseline': options['dominant-baseline']
        };
        var text = options.text[0];
        if (!this.heatMap.enableCanvasRendering) {
            htmlObject = this.heatMap.renderer.createText(renderOptions, text);
        }
        else {
            this.heatMap.canvasRenderer.createText(options, text);
        }
        if (typeof options.text !== 'string' && options.text.length > 1) {
            for (var i = 1, len = options.text.length; i < len; i++) {
                height = (measureText(options.text[i], font).height);
                if (!this.heatMap.enableCanvasRendering) {
                    tspanElement = this.heatMap.renderer.createTSpan({
                        'x': options.x, 'id': options.id + i,
                        'y': (options.y) + (i * height)
                    }, options.text[i]);
                    htmlObject.appendChild(tspanElement);
                }
                else {
                    options.id = options.id + i;
                    options.y += height;
                    this.heatMap.canvasRenderer.createText(options, options.text[i]);
                }
            }
        }
        if (!this.heatMap.enableCanvasRendering) {
            parentElement.appendChild(htmlObject);
        }
    };
    DrawSvgCanvas.prototype.drawLine = function (properties, parentElement) {
        if (!this.heatMap.enableCanvasRendering) {
            delete properties.d;
            parentElement.appendChild(this.heatMap.renderer.drawLine(properties));
        }
        else {
            this.heatMap.canvasRenderer.drawLine(properties);
        }
    };
    //Canvas Text Part
    DrawSvgCanvas.prototype.canvasDrawText = function (options, label, translateX, translateY) {
        var ctx = this.heatMap.canvasRenderer.ctx;
        if (!translateX) {
            translateX = options.x;
        }
        if (!translateY) {
            translateY = options.y;
        }
        var fontWeight = this.getOptionValue(options, 'font-weight');
        if (!isNullOrUndefined(fontWeight) && fontWeight.toLowerCase() === 'regular') {
            fontWeight = 'normal';
        }
        var fontFamily = this.getOptionValue(options, 'font-family');
        var fontSize = (options['font-size'].toString()).indexOf('px') === -1 ? options['font-size'] + 'px' : options['font-size'];
        var anchor = this.getOptionValue(options, 'text-anchor');
        var fontStyle = this.getOptionValue(options, 'font-style').toLowerCase();
        var font = (fontStyle + ' ' + fontWeight + ' ' + fontSize + ' ' + fontFamily);
        if (anchor === 'middle') {
            anchor = 'center';
        }
        ctx.save();
        ctx.fillStyle = options.fill;
        ctx.font = font;
        ctx.textAlign = anchor;
        if (options.baseline) {
            ctx.textBaseline = options.baseline;
        }
        ctx.translate(translateX, translateY);
        ctx.rotate(options.labelRotation * Math.PI / 180);
        ctx.fillText(label, options.x - translateX, options.y - translateY);
        ctx.restore();
    };
    // method to get the attributes value
    /* tslint:disable */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    DrawSvgCanvas.prototype.getOptionValue = function (options, key) {
        return options[key];
    };
    DrawSvgCanvas.prototype.setAttributes = function (canvas, options) {
        canvas.ctx.lineWidth = options['stroke-width'];
        var dashArray = options['stroke-dasharray'];
        if (!isNullOrUndefined(dashArray)) {
            var dashArrayString = dashArray.split(',');
            canvas.ctx.setLineDash([parseInt(dashArrayString[0], 10), parseInt(dashArrayString[1], 10)]);
        }
        canvas.ctx.strokeStyle = options['stroke'];
    };
    DrawSvgCanvas.prototype.drawCanvasRectangle = function (canvas, options, isFromSeries) {
        var canvasCtx = canvas.ctx;
        canvas.ctx.save();
        canvas.ctx.beginPath();
        canvas.ctx.globalAlpha = options['opacity'];
        this.setAttributes(canvas, options);
        this.drawCornerRadius(canvas, options);
        if ((options['stroke-width'] && options['stroke-width'] !== 0) || isFromSeries) {
            canvas.ctx.stroke();
        }
        canvas.ctx.restore();
        canvas.ctx = canvasCtx;
    };
    // To draw the corner of a rectangle
    DrawSvgCanvas.prototype.drawCornerRadius = function (canvas, options) {
        var cornerRadius = options.rx;
        var x = options.x;
        var y = options.y;
        var width = options.width;
        var height = options.height;
        if (options.fill === 'none') {
            options.fill = 'transparent';
        }
        canvas.ctx.fillStyle = options.fill;
        if (width < 2 * cornerRadius) {
            cornerRadius = width / 2;
        }
        if (height < 2 * cornerRadius) {
            cornerRadius = height / 2;
        }
        canvas.ctx.beginPath();
        canvas.ctx.moveTo(x + width - cornerRadius, y);
        canvas.ctx.arcTo(x + width, y, x + width, y + height, cornerRadius);
        canvas.ctx.arcTo(x + width, y + height, x, y + height, cornerRadius);
        canvas.ctx.arcTo(x, y + height, x, y, cornerRadius);
        canvas.ctx.arcTo(x, y, x + width, y, cornerRadius);
        canvas.ctx.closePath();
        canvas.ctx.fill();
    };
    DrawSvgCanvas.prototype.drawCanvasCircle = function (canvas, options) {
        canvas.ctx.save();
        canvas.ctx.beginPath();
        canvas.ctx.arc(options.cx, options.cy, options.r, 0, 2 * Math.PI);
        canvas.ctx.fillStyle = options.fill;
        canvas.ctx.globalAlpha = options.opacity;
        canvas.ctx.fill();
        this.setAttributes(canvas, options);
        if (options['stroke-width'] && options['stroke-width'] !== 0) {
            canvas.ctx.stroke();
        }
        canvas.ctx.restore();
    };
    DrawSvgCanvas.prototype.drawCanvasPath = function (canvas, properties, options) {
        var path = properties.d;
        var dataSplit = path.split(' ');
        canvas.ctx.save();
        canvas.ctx.beginPath();
        canvas.ctx.globalAlpha = properties.opacity;
        canvas.ctx.fillStyle = properties.fill;
        this.setAttributes(canvas, properties);
        for (var i = 0; i < dataSplit.length; i = i + 3) {
            var x1 = parseFloat(dataSplit[i + 1]);
            var y1 = parseFloat(dataSplit[i + 2]);
            switch (dataSplit[i]) {
                case 'M':
                    canvas.ctx.moveTo(x1, y1);
                    break;
                case 'L':
                    canvas.ctx.lineTo(x1, y1);
                    break;
                case 'A':
                case 'a':
                    canvas.ctx.arc(options.x, options.y, options.radius, (options.start * 0.0174533), (options.end * 0.0174533), false);
                    i = dataSplit[i] === 'a' ? i + 13 : i + 5;
                    break;
                case 'Z':
                    canvas.ctx.closePath();
                    break;
            }
        }
        canvas.ctx.fill();
        if (properties['stroke-width'] && properties['stroke-width'] !== 0) {
            canvas.ctx.stroke();
        }
        canvas.ctx.restore();
    };
    return DrawSvgCanvas;
}());
export { DrawSvgCanvas };
/**
 * Function to check whether target object implement specific interface
 *
 * @param { string } title - Specifies the heatmapsize
 * @param { FontModel } style - Specifies the topPadding
 * @param { number }  width - Specifies the bottomPadding
 * @returns {string} returns the size
 * @private
 */
export function getTitle(title, style, width) {
    var titleCollection = [];
    switch (style.textOverflow) {
        case 'Wrap':
            titleCollection = textWrap(title, width, style);
            break;
        case 'Trim':
            titleCollection.push(textTrim(width, title, style));
            break;
        default:
            titleCollection.push(textNone(width, title, style));
            break;
    }
    return titleCollection;
}
/**
 * Function to check whether target object implement specific interface
 *
 * @param { string } currentLabel - Specifies the heatmapsize
 * @param { number } maximumWidth - Specifies the topPadding
 * @param { FontModel }  font - Specifies the bottomPadding
 * @returns {string} returns the size
 * @private
 */
export function textWrap(currentLabel, maximumWidth, font) {
    var textCollection = currentLabel.split(' ');
    var label = '';
    var labelCollection = [];
    var text;
    for (var i = 0, len = textCollection.length; i < len; i++) {
        text = textCollection[i];
        if (measureText(label.concat(text), font).width < maximumWidth) {
            label = label.concat((label === '' ? '' : ' ') + text);
        }
        else {
            if (label !== '') {
                labelCollection.push(textTrim(maximumWidth, label, font));
                label = text;
            }
            else {
                labelCollection.push(textTrim(maximumWidth, text, font));
                text = '';
            }
        }
        if (label && i === len - 1) {
            labelCollection.push(textTrim(maximumWidth, label, font));
        }
    }
    return labelCollection;
}
/**
 * Function to check whether target object implement specific interface
 *
 * @param { number } maxWidth - Specifies the heatmapsize
 * @param { string } text - Specifies the topPadding
 * @param { FontModel }  font - Specifies the bottomPadding
 * @returns {string} returns the size
 * @private
 */
export function textTrim(maxWidth, text, font) {
    var label = text;
    var size = measureText(text, font).width;
    if (size > maxWidth) {
        var textLength = text.length;
        for (var index = textLength - 1; index >= 0; --index) {
            label = text.substring(0, index) + '...';
            size = measureText(label, font).width;
            if (size <= maxWidth) {
                return label;
            }
        }
    }
    return label;
}
/**
 * Function to check whether target object implement specific interface
 *
 * @param { number } maxWidth - Specifies the heatmapsize
 * @param { string } text - Specifies the topPadding
 * @param { FontModel }  font - Specifies the bottomPadding
 * @returns {string} returns the size
 * @private
 */
export function textNone(maxWidth, text, font) {
    var label = text;
    var size = measureText(text, font).width;
    if (size > maxWidth) {
        var textLength = text.length;
        for (var i = textLength - 1; i >= 0; --i) {
            label = text.substring(0, i);
            size = measureText(label, font).width;
            if (size <= maxWidth) {
                return label;
            }
        }
    }
    return label;
}
/** @private */
var Gradient = /** @class */ (function () {
    function Gradient(x, x1, x2, y1, y2) {
        this.id = x;
        this.x1 = x1;
        this.x2 = x2;
        this.y1 = y1;
        this.y2 = y2;
    }
    return Gradient;
}());
export { Gradient };
var GradientColor = /** @class */ (function () {
    function GradientColor(color, colorStop) {
        this.color = color;
        this.colorStop = colorStop;
    }
    return GradientColor;
}());
export { GradientColor };
/**
 * Function to check whether target object implement specific interface
 *
 * @param { string } text - Specifies the heatmapsize
 * @param { number } x - Specifies the topPadding
 * @param { number }  y - Specifies the bottomPadding
 * @param { number }  areaWidth - Specifies the bottomPadding
 * @param { string }  id - Specifies the bottomPadding
 * @param { Element }  element - Specifies the bottomPadding
 * @param { boolean }  isTouch - Specifies the bottomPadding
 * @param { HeatMap }  heatmap - Specifies the bottomPadding
 * @returns {void} returns the size
 * @private
 */
export function showTooltip(text, x, y, areaWidth, id, element, isTouch, heatmap) {
    var tooltip = document.getElementById(id);
    var size = measureText(text, {
        fontFamily: 'Segoe UI', size: '12px',
        fontStyle: 'Normal', fontWeight: 'Regular'
    });
    var width = size.width + 5;
    x = (x + width > areaWidth) ? x - width : x;
    x = x < 0 ? 5 : x;
    if (!tooltip) {
        tooltip = createElement('div', {
            id: id,
            styles: 'top:' + (y + 15).toString() + 'px;left:' + (x + 15).toString() +
                'px;background-color: rgb(255, 255, 255) !important; color:black !important; ' +
                'position:absolute;border:1px solid rgb(112, 112, 112); padding-left : 3px; padding-right : 2px;' +
                'padding-bottom : 2px; padding-top : 2px; font-size:12px; font-family: Segoe UI'
        });
        tooltip.innerText = text;
        element.appendChild(tooltip);
    }
    else {
        tooltip.innerText = text;
        tooltip.style.top = (y + 15).toString() + 'px';
        tooltip.style.left = (x + 15).toString() + 'px';
    }
    if (text === heatmap.titleSettings.text) {
        tooltip.style.width = (x + 15) + size.width + 7 > heatmap.availableSize.width ?
            (heatmap.availableSize.width - (x + 15)).toString() + 'px' : '';
    }
    else {
        tooltip.style.left = (x + 15) + size.width + 7 > heatmap.availableSize.width ?
            (heatmap.availableSize.width - (size.width + 7)).toString() + 'px' : x.toString() + 'px';
        tooltip.style.top = (y + 15) + size.height + 6 > heatmap.availableSize.height ?
            (y - (size.height + 6) - 10).toString() + 'px' : tooltip.style.top; // 6 and 7 are padding and border width
    }
    if (isTouch) {
        setTimeout(function () { removeElement(id); }, 1500);
    }
}
/**
 * Function to check whether target object implement specific interface
 *
 * @param { string }  id - Specifies the bottomPadding
 * @returns {void} returns the size
 * @private
 */
export function removeElement(id) {
    var element = getElement(id);
    if (element) {
        remove(element);
    }
}
/**
 * Function to check whether target object implement specific interface
 *
 * @param { string }  id - Specifies the bottomPadding
 * @returns {Element} returns the size
 * @private
 */
export function getElement(id) {
    return document.getElementById(id);
}
/**
 * Function to check whether target object implement specific interface
 *
 * @param { number } value - Specifies the topPadding
 * @param { number }  interval - Specifies the bottomPadding
 * @param { string } intervalType - Specifies the heatmapsize
 * @param { number }  increment - Specifies the bottomPadding
 * @returns {Date} returns the size
 * @private
 */
export function increaseDateTimeInterval(value, interval, intervalType, increment) {
    var result = new Date(value);
    interval = Math.ceil(interval * increment);
    switch (intervalType) {
        case 'Years':
            result.setFullYear(result.getFullYear() + interval);
            break;
        case 'Months':
            result.setMonth(result.getMonth() + interval);
            break;
        case 'Days':
            result.setDate(result.getDate() + interval);
            break;
        case 'Hours':
            result.setHours(result.getHours() + interval);
            break;
        case 'Minutes':
            result.setMinutes(result.getMinutes() + interval);
            break;
    }
    return result;
}
/* private */
var CanvasTooltip = /** @class */ (function () {
    function CanvasTooltip(text, rect) {
        this.region = new Rect(0, 0, 0, 0);
        this.text = text;
        this.region = rect;
    }
    return CanvasTooltip;
}());
export { CanvasTooltip };
/**
 * Function to check whether target object implement specific interface
 *
 * @param { CanvasTooltip } tooltipCollection - Specifies the topPadding
 * @param { number }  xPosition - Specifies the bottomPadding
 * @param { number } yPosition - Specifies the heatmapsize
 * @returns {string} returns the size
 * @private
 */
export function getTooltipText(tooltipCollection, xPosition, yPosition) {
    var length = tooltipCollection.length;
    var tooltip;
    var region;
    var text;
    for (var i = 0; i < length; i++) {
        tooltip = tooltipCollection[i];
        region = tooltip.region;
        if (xPosition >= region.x && xPosition <= (region.x + region.width) && yPosition >= region.y
            && yPosition <= (region.y + region.height)) {
            text = tooltip.text;
            break;
        }
    }
    return text;
}
/**
 * @private
 */
var PaletterColor = /** @class */ (function () {
    function PaletterColor() {
    }
    return PaletterColor;
}());
export { PaletterColor };
/**
 * @private
 */
var GradientPointer = /** @class */ (function () {
    function GradientPointer(pathX1, pathY1, pathX2, pathY2, pathX3, pathY3) {
        this.pathX1 = pathX1;
        this.pathY1 = pathY1;
        this.pathX2 = pathX2;
        this.pathY2 = pathY2;
        this.pathX3 = pathX3;
        this.pathY3 = pathY3;
    }
    return GradientPointer;
}());
export { GradientPointer };
/**
 * Class to define currentRect private property.
 *
 * @private
 */
var CurrentLegendRect = /** @class */ (function () {
    function CurrentLegendRect(x, y, width, height, label, id) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.label = label;
        this.id = id;
    }
    return CurrentLegendRect;
}());
export { CurrentLegendRect };
/** @private */
var LegendRange = /** @class */ (function () {
    function LegendRange(x, y, width, height, value, visible, currentPage) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.value = value;
        this.visible = visible;
        this.currentPage = currentPage;
    }
    return LegendRange;
}());
export { LegendRange };
/** @private */
var ToggleVisibility = /** @class */ (function () {
    function ToggleVisibility(visible, value, startValue, endValue) {
        this.visible = visible;
        this.value = value;
        this.startValue = startValue;
        this.endValue = endValue;
    }
    return ToggleVisibility;
}());
export { ToggleVisibility };
/**
 * Function to check whether target object implement specific interface
 *
 * @param { string } color - Specifies the topPadding
 * @returns {string} returns the size
 * @private
 */
export function colorNameToHex(color) {
    color = color === 'transparent' ? 'white' : color;
    var element = document.getElementById('heatmapmeasuretext');
    element.style.color = color;
    color = window.getComputedStyle(element).color;
    var exp = /^(rgb|hsl)(a?)[(]\s*([\d.]+\s*%?)\s*,\s*([\d.]+\s*%?)\s*,\s*([\d.]+\s*%?)\s*(?:,\s*([\d.]+)\s*)?[)]$/;
    var isRGBValue = exp.exec(color);
    return convertToHexCode(new RgbColor(parseInt(isRGBValue[3], 10), parseInt(isRGBValue[4], 10), parseInt(isRGBValue[5], 10)));
}
/**
 * Function to check whether target object implement specific interface
 *
 * @param { RgbColor } value - Specifies the topPadding
 * @returns {string} returns the size
 * @private
 */
export function convertToHexCode(value) {
    return '#' + componentToHex(value.R) + componentToHex(value.G) + componentToHex(value.B);
}
/**
 * Function to check whether target object implement specific interface
 *
 * @param { number }  value - Specifies the bottomPadding
 * @returns {string} returns the size
 * @private
 */
export function componentToHex(value) {
    var hex = value.toString(16);
    return hex.length === 1 ? '0' + hex : hex;
}
/**
 * Function to check whether target object implement specific interface
 *
 * @param { string }  hex - Specifies the bottomPadding
 * @returns {RgbColor} returns the size
 * @private
 */
export function convertHexToColor(hex) {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? new RgbColor(parseInt(result[1], 16), parseInt(result[2], 16), parseInt(result[3], 16)) :
        new RgbColor(255, 255, 255);
}
/**
 * Function to check whether target object implement specific interface
 *
 * @param { boolean }  isCustom - Specifies the bottomPadding
 * @param { string }  format - Specifies the bottomPadding
 * @param { number }  tempInterval - Specifies the bottomPadding
 * @param { Function }  formatFun - Specifies the bottomPadding
 * @returns {string} returns the size
 * @private
 */
// eslint-disable-next-line @typescript-eslint/ban-types
export function formatValue(isCustom, format, tempInterval, formatFun) {
    return isCustom ? format.replace('{value}', formatFun(tempInterval))
        : formatFun(tempInterval);
}
/** @private */
var MultiLevelPosition = /** @class */ (function () {
    function MultiLevelPosition(x, y) {
        this.x = x;
        this.y = y;
    }
    return MultiLevelPosition;
}());
export { MultiLevelPosition };
