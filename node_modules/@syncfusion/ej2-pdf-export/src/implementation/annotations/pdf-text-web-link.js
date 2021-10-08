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
import { PdfPage } from './../pages/pdf-page';
import { PointF, RectangleF, SizeF } from './../drawing/pdf-drawing';
import { PdfTextElement } from './../graphics/figures/text-element';
import { PdfUriAnnotation } from './uri-annotation';
import { PdfStringLayouter } from './../graphics/fonts/string-layouter';
import { PdfFontStyle } from './../graphics/fonts/enum';
import { PdfTextAlignment } from './../graphics/enum';
import { PdfArray } from './../primitives/pdf-array';
import { PdfNumber } from './../primitives/pdf-number';
/**
 * `PdfTextWebLink` class represents the class for text web link annotation.
 * ```typescript
 * // create a new PDF document.
 * let document : PdfDocument = new PdfDocument();
 * // add a page to the document.
 * let page1 : PdfPage = document.pages.add();
 * // create the font
 * let font : PdfFont = new PdfStandardFont(PdfFontFamily.Helvetica, 12);
 * //
 * // create the Text Web Link
 * let textLink : PdfTextWebLink = new PdfTextWebLink();
 * // set the hyperlink
 * textLink.url = 'http://www.google.com';
 * // set the link text
 * textLink.text = 'Google';
 * // set the font
 * textLink.font = font;
 * // draw the hyperlink in PDF page
 * textLink.draw(page1, new PointF(10, 40));
 * //
 * // save the document.
 * document.save('output.pdf');
 * // destroy the document
 * document.destroy();
 * ```
 */
var PdfTextWebLink = /** @class */ (function (_super) {
    __extends(PdfTextWebLink, _super);
    // Constructors
    /**
     * Initializes a new instance of the `PdfTextWebLink` class.
     * @private
     */
    function PdfTextWebLink() {
        var _this = _super.call(this) || this;
        // Fields
        /**
         * Internal variable to store `Url`.
         * @default ''
         * @private
         */
        _this.uniformResourceLocator = '';
        /**
         * Internal variable to store `Uri Annotation` object.
         * @default null
         * @private
         */
        _this.uriAnnotation = null;
        /**
         * Checks whether the drawTextWebLink method with `PointF` overload is called or not.
         * If it set as true, then the start position of each lines excluding firest line is changed as (0, Y).
         * @private
         * @hidden
         */
        _this.recalculateBounds = false;
        _this.defaultBorder = new PdfArray();
        for (var i = 0; i < 3; i++) {
            _this.defaultBorder.add(new PdfNumber(0));
        }
        return _this;
    }
    Object.defineProperty(PdfTextWebLink.prototype, "url", {
        // Properties
        /**
         * Gets or sets the `Uri address`.
         * ```typescript
         * // create a new PDF document.
         * let document : PdfDocument = new PdfDocument();
         * // add a page to the document.
         * let page1 : PdfPage = document.pages.add();
         * // create the font
         * let font : PdfFont = new PdfStandardFont(PdfFontFamily.Helvetica, 12);
         * // create the Text Web Link
         * let textLink : PdfTextWebLink = new PdfTextWebLink();
         * //
         * // set the hyperlink
         * textLink.url = 'http://www.google.com';
         * //
         * // set the link text
         * textLink.text = 'Google';
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
            return this.uniformResourceLocator;
        },
        set: function (value) {
            if (value.length === 0) {
                throw new Error('ArgumentException : Url - string can not be empty');
            }
            this.uniformResourceLocator = value;
        },
        enumerable: true,
        configurable: true
    });
    PdfTextWebLink.prototype.draw = function (arg1, arg2) {
        if (arg1 instanceof PdfPage) {
            var layout = new PdfStringLayouter();
            var previousFontStyle = this.font.style;
            if (arg2 instanceof PointF) {
                this.recalculateBounds = true;
                this.font.style = PdfFontStyle.Underline;
                var layoutResult = layout.layout(this.value, this.font, this.stringFormat, new SizeF((arg1.graphics.clientSize.width - arg2.x), 0), true, arg1.graphics.clientSize);
                if (layoutResult.lines.length === 1) {
                    var textSize = this.font.measureString(this.value);
                    var rect = new RectangleF(arg2, textSize);
                    rect = this.calculateBounds(rect, textSize.width, arg1.graphics.clientSize.width, arg2.x);
                    this.uriAnnotation = new PdfUriAnnotation(rect, this.url);
                    this.uriAnnotation.dictionary.items.setValue('Border', this.defaultBorder);
                    arg1.annotations.add(this.uriAnnotation);
                    var result = this.drawText(arg1, arg2);
                    this.font.style = previousFontStyle;
                    return result;
                }
                else {
                    var result = this.drawMultipleLineWithPoint(layoutResult, arg1, arg2);
                    this.font.style = previousFontStyle;
                    return result;
                }
            }
            else {
                var layoutResult = layout.layout(this.value, this.font, this.stringFormat, new SizeF(arg2.width, 0), false, new SizeF(0, 0));
                this.font.style = PdfFontStyle.Underline;
                if (layoutResult.lines.length === 1) {
                    var textSize = this.font.measureString(this.value);
                    var rect = new RectangleF(new PointF(arg2.x, arg2.y), textSize);
                    rect = this.calculateBounds(rect, textSize.width, arg2.width, arg2.x);
                    this.uriAnnotation = new PdfUriAnnotation(rect, this.url);
                    this.uriAnnotation.dictionary.items.setValue('Border', this.defaultBorder);
                    arg1.annotations.add(this.uriAnnotation);
                    var returnValue = this.drawText(arg1, arg2);
                    this.font.style = previousFontStyle;
                    return returnValue;
                }
                else {
                    var returnValue = this.drawMultipleLineWithBounds(layoutResult, arg1, arg2);
                    this.font.style = previousFontStyle;
                    return returnValue;
                }
            }
        }
        else {
            var page = new PdfPage();
            page = arg1.page;
            return this.draw(page, arg2);
        }
    };
    /* tslint:enable */
    //Private methods
    /**
     * Helper method `Draw` a Multiple Line Text Web Link on the Graphics with the specified location.
     * @private
     */
    PdfTextWebLink.prototype.drawMultipleLineWithPoint = function (result, page, location) {
        var layoutResult;
        for (var i = 0; i < result.layoutLines.length; i++) {
            var size = this.font.measureString(result.lines[i].text);
            var bounds = new RectangleF(location, size);
            if (i !== 0) {
                bounds.x = 0;
            }
            this.text = result.lines[i].text;
            if (bounds.y + size.height > page.graphics.clientSize.height) {
                if (i !== 0) {
                    page = page.graphics.getNextPage();
                    bounds = new RectangleF(0, 0, page.graphics.clientSize.width, size.height);
                    location.y = 0;
                }
                else {
                    break;
                }
            }
            bounds = this.calculateBounds(bounds, size.width, page.graphics.clientSize.width, bounds.x);
            this.uriAnnotation = new PdfUriAnnotation(bounds, this.url);
            this.uriAnnotation.dictionary.items.setValue('Border', this.defaultBorder);
            page.annotations.add(this.uriAnnotation);
            if (i !== 0) {
                layoutResult = this.drawText(page, new PointF(0, bounds.y));
            }
            else {
                layoutResult = this.drawText(page, bounds.x, bounds.y);
            }
            location.y += size.height;
        }
        return layoutResult;
    };
    /**
     * Helper method `Draw` a Multiple Line Text Web Link on the Graphics with the specified bounds.
     * @private
     */
    PdfTextWebLink.prototype.drawMultipleLineWithBounds = function (result, page, bounds) {
        var layoutResult;
        for (var i = 0; i < result.layoutLines.length; i++) {
            var size = this.font.measureString(result.lines[i].text);
            var internalBounds = new RectangleF(new PointF(bounds.x, bounds.y), size);
            internalBounds = this.calculateBounds(internalBounds, size.width, bounds.width, bounds.x);
            this.text = result.lines[i].text;
            if (bounds.y + size.height > page.graphics.clientSize.height) {
                if (i !== 0) {
                    page = page.graphics.getNextPage();
                    bounds = new RectangleF(bounds.x, 0, bounds.width, size.height);
                    internalBounds.y = 0;
                }
                else {
                    break;
                }
            }
            this.uriAnnotation = new PdfUriAnnotation(internalBounds, this.url);
            this.uriAnnotation.dictionary.items.setValue('Border', this.defaultBorder);
            page.annotations.add(this.uriAnnotation);
            layoutResult = this.drawText(page, bounds);
            bounds.y += size.height;
        }
        return layoutResult;
    };
    /* tslint:disable */
    PdfTextWebLink.prototype.calculateBounds = function (currentBounds, lineWidth, maximumWidth, startPosition) {
        var shift = 0;
        if (this.stringFormat != null && typeof this.stringFormat !== 'undefined' && this.stringFormat.alignment === PdfTextAlignment.Center) {
            currentBounds.x = startPosition + (maximumWidth - lineWidth) / 2;
            currentBounds.width = lineWidth;
        }
        else if (this.stringFormat != null && typeof this.stringFormat !== 'undefined' && this.stringFormat.alignment === PdfTextAlignment.Right) {
            currentBounds.x = startPosition + (maximumWidth - lineWidth);
            currentBounds.width = lineWidth;
        }
        else if (this.stringFormat != null && typeof this.stringFormat !== 'undefined' && this.stringFormat.alignment === PdfTextAlignment.Justify) {
            currentBounds.x = startPosition;
            currentBounds.width = maximumWidth;
        }
        else {
            currentBounds.width = startPosition;
            currentBounds.width = lineWidth;
        }
        return currentBounds;
    };
    return PdfTextWebLink;
}(PdfTextElement));
export { PdfTextWebLink };
