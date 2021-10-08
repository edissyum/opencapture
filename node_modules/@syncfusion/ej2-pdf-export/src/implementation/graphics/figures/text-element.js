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
/**
 * PdfTextElement.ts class for EJ2-PDF
 */
import { PdfLayoutElement } from './../figures/layout-element';
import { PdfBrush } from './../brushes/pdf-brush';
import { PdfFont } from './../fonts/pdf-font';
import { PdfStandardFont } from './../fonts/pdf-standard-font';
import { PdfPen } from './../pdf-pen';
import { PdfLayoutParams } from './../figures/base/element-layouter';
import { TextLayouter } from './base/text-layouter';
import { PdfSolidBrush } from './../brushes/pdf-solid-brush';
import { PdfColor } from './../pdf-color';
import { RectangleF, SizeF, PointF } from './../../drawing/pdf-drawing';
import { PdfLayoutFormat } from './base/element-layouter';
import { PdfStringLayouter } from './../fonts/string-layouter';
import { PdfTextAlignment } from './../enum';
/**
 * `PdfTextElement` class represents the text area with the ability to span several pages
 * and inherited from the 'PdfLayoutElement' class.
 * @private
 */
var PdfTextElement = /** @class */ (function (_super) {
    __extends(PdfTextElement, _super);
    function PdfTextElement(arg1, arg2, arg3, arg4, arg5) {
        var _this = _super.call(this) || this;
        // Fields
        /**
         * `Text` data.
         * @private
         */
        _this.content = '';
        /**
         * `Value` of text data.
         * @private
         */
        _this.elementValue = '';
        /**
         * indicate whether the drawText with PointF overload is called or not.
         * @default false
         * @private
         */
        _this.hasPointOverload = false;
        /**
         * indicate whether the PdfGridCell value is `PdfTextElement`
         * @default false
         * @private
         */
        _this.isPdfTextElement = false;
        if (typeof arg1 === 'undefined') {
            //
        }
        else if (typeof arg1 === 'string' && typeof arg2 === 'undefined') {
            _this.content = arg1;
            _this.elementValue = arg1;
        }
        else if (typeof arg1 === 'string' && arg2 instanceof PdfFont && typeof arg3 === 'undefined') {
            _this.content = arg1;
            _this.elementValue = arg1;
            _this.pdfFont = arg2;
        }
        else if (typeof arg1 === 'string' && arg2 instanceof PdfFont && arg3 instanceof PdfPen && typeof arg4 === 'undefined') {
            _this.content = arg1;
            _this.elementValue = arg1;
            _this.pdfFont = arg2;
            _this.pdfPen = arg3;
        }
        else if (typeof arg1 === 'string' && arg2 instanceof PdfFont && arg3 instanceof PdfBrush && typeof arg4 === 'undefined') {
            _this.content = arg1;
            _this.elementValue = arg1;
            _this.pdfFont = arg2;
            _this.pdfBrush = arg3;
        }
        else {
            _this.content = arg1;
            _this.elementValue = arg1;
            _this.pdfFont = arg2;
            _this.pdfPen = arg3;
            _this.pdfBrush = arg4;
            _this.format = arg5;
        }
        return _this;
    }
    Object.defineProperty(PdfTextElement.prototype, "text", {
        // Properties
        /**
         * Gets or sets a value indicating the `text` that should be printed.
         * ```typescript
         * // create a new PDF document.
         * let document : PdfDocument = new PdfDocument();
         * // add a page to the document.
         * let page1 : PdfPage = document.pages.add();
         * // create the font
         * let font : PdfFont = new PdfStandardFont(PdfFontFamily.Helvetica, 12);
         * // create the Text Web Link
         * let textLink : PdfTextWebLink = new PdfTextWebLink();
         * // set the hyperlink
         * textLink.url = 'http://www.google.com';
         * //
         * // set the link text
         * textLink.text = 'Google';
         * //
         * // set the font
         * textLink.font = font;
         * // draw the hyperlink in PDF page
         * textLink.draw(page1, new PointF(10, 40));
         * // save the document.
         * document.save('output.pdf');
         * // destroy the document
         * document.destroy();
         * ```
         */
        get: function () {
            return this.content;
        },
        set: function (value) {
            this.elementValue = value;
            this.content = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PdfTextElement.prototype, "value", {
        //get value
        /**
         * Gets or sets a `value` indicating the text that should be printed.
         * @private
         */
        get: function () {
            return this.elementValue;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PdfTextElement.prototype, "pen", {
        //get pen
        /**
         * Gets or sets a `PdfPen` that determines the color, width, and style of the text
         * @private
         */
        get: function () {
            return this.pdfPen;
        },
        //Set pen value
        set: function (value) {
            this.pdfPen = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PdfTextElement.prototype, "brush", {
        //get brush
        /**
         * Gets or sets the `PdfBrush` that will be used to draw the text with color and texture.
         * @private
         */
        get: function () {
            return this.pdfBrush;
        },
        //Set brush value
        set: function (value) {
            this.pdfBrush = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PdfTextElement.prototype, "font", {
        //get font
        /**
         * Gets or sets a `PdfFont` that defines the text format.
         * ```typescript
         * // create a new PDF document.
         * let document : PdfDocument = new PdfDocument();
         * // add a page to the document.
         * let page1 : PdfPage = document.pages.add();
         * // create the font
         * let font : PdfFont = new PdfStandardFont(PdfFontFamily.Helvetica, 12);
         * // create the Text Web Link
         * let textLink : PdfTextWebLink = new PdfTextWebLink();
         * // set the hyperlink
         * textLink.url = 'http://www.google.com';
         * // set the link text
         * textLink.text = 'Google';
         * //
         * // set the font
         * textLink.font = font;
         * //
         * // draw the hyperlink in PDF page
         * textLink.draw(page1, new PointF(10, 40));
         * // save the document.
         * document.save('output.pdf');
         * // destroy the document
         * document.destroy();
         * ```
         */
        get: function () {
            return this.pdfFont;
        },
        set: function (value) {
            this.pdfFont = value;
            if (this.pdfFont instanceof PdfStandardFont && this.content != null) {
                this.elementValue = PdfStandardFont.convert(this.content);
            }
            else {
                this.elementValue = this.content;
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PdfTextElement.prototype, "stringFormat", {
        /**
         * Gets or sets the `PdfStringFormat` that will be used to set the string format
         * @private
         */
        get: function () {
            return this.format;
        },
        set: function (value) {
            this.format = value;
        },
        enumerable: true,
        configurable: true
    });
    // Implementation
    /**
     * Gets a `brush` for drawing.
     * @private
     */
    PdfTextElement.prototype.getBrush = function () {
        return (this.pdfBrush == null || typeof this.pdfBrush === 'undefined') ? new PdfSolidBrush(new PdfColor(0, 0, 0)) : this.pdfBrush;
    };
    // /**
    //  * `Draws` an element on the Graphics.
    //  * @private
    //  */
    // public drawInternal(graphics : PdfGraphics) : void {
    //     graphics.drawString(this.elementValue, this.pdfFont, this.pdfPen, this.getBrush(), 0, 0, this.stringFormat);
    // }
    /**
     * `Layouts` the element.
     * @private
     */
    PdfTextElement.prototype.layout = function (param) {
        var layouter = new TextLayouter(this);
        var result = layouter.layout(param);
        return result;
    };
    PdfTextElement.prototype.drawText = function (arg2, arg3, arg4, arg5) {
        if (arg3 instanceof PointF && typeof arg3.width === 'undefined' && typeof arg4 === 'undefined') {
            this.hasPointOverload = true;
            return this.drawText(arg2, arg3.x, arg3.y);
        }
        else if (typeof arg3 === 'number' && typeof arg4 === 'number' && typeof arg5 === 'undefined') {
            this.hasPointOverload = true;
            return this.drawText(arg2, arg3, arg4, null);
        }
        else if (arg3 instanceof RectangleF && typeof arg3.width !== 'undefined' && typeof arg4 === 'undefined') {
            return this.drawText(arg2, arg3, null);
        }
        else if (arg3 instanceof PointF && typeof arg3.width === 'undefined' && arg4 instanceof PdfLayoutFormat) {
            this.hasPointOverload = true;
            return this.drawText(arg2, arg3.x, arg3.y, arg4);
        }
        else if (typeof arg3 === 'number' && typeof arg4 === 'number' && (arg5 instanceof PdfLayoutFormat || arg5 == null)) {
            this.hasPointOverload = true;
            var width = (arg2.graphics.clientSize.width - arg3);
            var layoutRectangle = new RectangleF(arg3, arg4, width, 0);
            return this.drawText(arg2, layoutRectangle, arg5);
        }
        else if (arg3 instanceof RectangleF && typeof arg3.width !== 'undefined' && typeof arg4 === 'boolean') {
            return this.drawText(arg2, arg3, null);
        }
        else {
            var layout = new PdfStringLayouter();
            if (this.hasPointOverload) {
                var stringLayoutResult = layout.layout(this.value, this.font, this.stringFormat, new SizeF((arg2.graphics.clientSize.width - arg3.x), 0), true, arg2.graphics.clientSize);
                var layoutResult = void 0;
                var param = new PdfLayoutParams();
                var temparg3 = arg3;
                var temparg4 = arg4;
                param.page = arg2;
                var previousPage = arg2;
                param.bounds = temparg3;
                param.format = (temparg4 != null) ? temparg4 : new PdfLayoutFormat();
                if (stringLayoutResult.lines.length > 1) {
                    this.text = stringLayoutResult.layoutLines[0].text;
                    if (param.bounds.y <= param.page.graphics.clientSize.height) {
                        var previousPosition = new PointF(param.bounds.x, param.bounds.y);
                        layoutResult = this.layout(param);
                        var bounds = new RectangleF(0, layoutResult.bounds.y + stringLayoutResult.lineHeight, arg2.graphics.clientSize.width, stringLayoutResult.lineHeight);
                        var isPaginate = false;
                        for (var i = 1; i < stringLayoutResult.lines.length; i++) {
                            param.page = layoutResult.page;
                            param.bounds = new RectangleF(new PointF(bounds.x, bounds.y), new SizeF(bounds.width, bounds.height));
                            this.text = stringLayoutResult.layoutLines[i].text;
                            if (bounds.y + stringLayoutResult.lineHeight > layoutResult.page.graphics.clientSize.height) {
                                isPaginate = true;
                                param.page = param.page.graphics.getNextPage();
                                if (previousPosition.y > (layoutResult.page.graphics.clientSize.height - layoutResult.bounds.height)) {
                                    bounds = new RectangleF(0, layoutResult.bounds.height, layoutResult.page.graphics.clientSize.width, stringLayoutResult.lineHeight);
                                }
                                else {
                                    bounds = new RectangleF(0, 0, layoutResult.page.graphics.clientSize.width, stringLayoutResult.lineHeight);
                                }
                                param.bounds = bounds;
                            }
                            layoutResult = this.layout(param);
                            if (i !== (stringLayoutResult.lines.length - 1)) {
                                bounds = new RectangleF(0, layoutResult.bounds.y + stringLayoutResult.lineHeight, layoutResult.page.graphics.clientSize.width, stringLayoutResult.lineHeight);
                            }
                            else {
                                var lineWidth = this.font.measureString(this.text, this.format).width;
                                layoutResult = this.calculateResultBounds(layoutResult, lineWidth, layoutResult.page.graphics.clientSize.width, 0);
                            }
                        }
                    }
                    return layoutResult;
                }
                else {
                    var lineSize = this.font.measureString(this.text, this.format);
                    if (param.bounds.y <= param.page.graphics.clientSize.height) {
                        layoutResult = this.layout(param);
                        layoutResult = this.calculateResultBounds(layoutResult, lineSize.width, layoutResult.page.graphics.clientSize.width, 0);
                    }
                    return layoutResult;
                }
            }
            else {
                var layoutResult = layout.layout(this.value, this.font, this.stringFormat, new SizeF(arg3.width, 0), false, arg2.graphics.clientSize);
                var result = void 0;
                var param = new PdfLayoutParams();
                var temparg3 = arg3;
                var temparg4 = arg4;
                param.page = arg2;
                param.bounds = temparg3;
                param.format = (temparg4 != null) ? temparg4 : new PdfLayoutFormat();
                if (layoutResult.lines.length > 1) {
                    this.text = layoutResult.layoutLines[0].text;
                    if (param.bounds.y <= param.page.graphics.clientSize.height) {
                        var previousPosition = new PointF(param.bounds.x, param.bounds.y);
                        result = this.layout(param);
                        var bounds = new RectangleF(temparg3.x, result.bounds.y + layoutResult.lineHeight, temparg3.width, layoutResult.lineHeight);
                        var isPaginate = false;
                        for (var i = 1; i < layoutResult.lines.length; i++) {
                            param.page = result.page;
                            param.bounds = new RectangleF(bounds.x, bounds.y, bounds.width, bounds.height);
                            this.text = layoutResult.layoutLines[i].text;
                            if (bounds.y + layoutResult.lineHeight > result.page.graphics.clientSize.height) {
                                isPaginate = true;
                                param.page = param.page.graphics.getNextPage();
                                if (previousPosition.y > (result.page.graphics.clientSize.height - result.bounds.height)) {
                                    bounds = new RectangleF(temparg3.x, layoutResult.lineHeight, temparg3.width, layoutResult.lineHeight);
                                }
                                else {
                                    bounds = new RectangleF(temparg3.x, 0, temparg3.width, layoutResult.lineHeight);
                                }
                                param.bounds = bounds;
                            }
                            result = this.layout(param);
                            if (i !== (layoutResult.lines.length - 1)) {
                                bounds = new RectangleF(temparg3.x, result.bounds.y + layoutResult.lineHeight, temparg3.width, layoutResult.lineHeight);
                            }
                            else {
                                var lineWidth = this.font.measureString(this.text, this.format).width;
                                result = this.calculateResultBounds(result, lineWidth, temparg3.width, temparg3.x);
                            }
                        }
                    }
                    return result;
                }
                else {
                    var lineSize = this.font.measureString(this.text, this.format);
                    if (param.bounds.y <= param.page.graphics.clientSize.height) {
                        result = this.layout(param);
                        result = this.calculateResultBounds(result, lineSize.width, temparg3.width, temparg3.x);
                    }
                    return result;
                }
            }
        }
    };
    PdfTextElement.prototype.calculateResultBounds = function (result, lineWidth, maximumWidth, startPosition) {
        var shift = 0;
        if (this.stringFormat != null && typeof this.stringFormat !== 'undefined' && this.stringFormat.alignment === PdfTextAlignment.Center) {
            result.bounds.x = startPosition + (maximumWidth - lineWidth) / 2;
            result.bounds.width = lineWidth;
        }
        else if (this.stringFormat != null && typeof this.stringFormat !== 'undefined' && this.stringFormat.alignment === PdfTextAlignment.Right) {
            result.bounds.x = startPosition + (maximumWidth - lineWidth);
            result.bounds.width = lineWidth;
        }
        else if (this.stringFormat != null && typeof this.stringFormat !== 'undefined' && this.stringFormat.alignment === PdfTextAlignment.Justify) {
            result.bounds.x = startPosition;
            result.bounds.width = maximumWidth;
        }
        else {
            result.bounds.width = startPosition;
            result.bounds.width = lineWidth;
        }
        return result;
    };
    return PdfTextElement;
}(PdfLayoutElement));
export { PdfTextElement };
