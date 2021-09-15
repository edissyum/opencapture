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
 * TextLayouter.ts class for EJ2-PDF
 */
import { ElementLayouter, PdfLayoutResult } from './element-layouter';
import { RectangleF, SizeF } from './../../../drawing/pdf-drawing';
import { PdfStringLayouter } from './../../fonts/string-layouter';
import { PdfLayoutBreakType } from './../../figures/enum';
import { PdfColor } from './../../pdf-color';
import { PdfTextWebLink } from './../../../annotations/pdf-text-web-link';
/**
 * Class that `layouts the text`.
 * @private
 */
var TextLayouter = /** @class */ (function (_super) {
    __extends(TextLayouter, _super);
    // Constructors
    /**
     * Initializes a new instance of the `TextLayouter` class.
     * @private
     */
    function TextLayouter(element) {
        return _super.call(this, element) || this;
    }
    Object.defineProperty(TextLayouter.prototype, "element", {
        /**
         * Gets the layout `element`.
         * @private
         */
        get: function () {
            return _super.prototype.getElement.call(this);
        },
        enumerable: true,
        configurable: true
    });
    // Implementation
    /**
     * `Layouts` the element.
     * @private
     */
    TextLayouter.prototype.layoutInternal = function (param) {
        /* tslint:disable */
        this.format = (this.element.stringFormat !== null && typeof this.element.stringFormat !== 'undefined') ? this.element.stringFormat : null;
        var currentPage = param.page;
        var currentBounds = param.bounds;
        var text = this.element.value;
        var result = null;
        var pageResult = new TextPageLayoutResult();
        pageResult.page = currentPage;
        pageResult.remainder = text;
        for (;;) {
            pageResult = this.layoutOnPage(text, currentPage, currentBounds, param);
            result = this.getLayoutResult(pageResult);
            break;
        }
        /* tslint:enable */
        return result;
    };
    /**
     * Raises `PageLayout` event if needed.
     * @private
     */
    TextLayouter.prototype.getLayoutResult = function (pageResult) {
        var result = new PdfTextLayoutResult(pageResult.page, pageResult.bounds, pageResult.remainder, pageResult.lastLineBounds);
        return result;
    };
    /* tslint:disable */
    /**
     * `Layouts` the text on the page.
     * @private
     */
    TextLayouter.prototype.layoutOnPage = function (text, currentPage, currentBounds, param) {
        var result = new TextPageLayoutResult();
        result.remainder = text;
        result.page = currentPage;
        currentBounds = this.checkCorrectBounds(currentPage, currentBounds);
        var layouter = new PdfStringLayouter();
        var stringResult = layouter.layout(text, this.element.font, this.format, currentBounds, currentPage.getClientSize().height, false, new SizeF(0, 0));
        var textFinished = (stringResult.remainder == null);
        var doesntFit = (param.format.break === PdfLayoutBreakType.FitElement);
        var canDraw = !(doesntFit || stringResult.empty);
        // Draw the text.
        var graphics = currentPage.graphics;
        var brush = this.element.getBrush();
        if (this.element instanceof PdfTextWebLink) {
            brush.color = new PdfColor(0, 0, 255);
        }
        graphics.drawStringLayoutResult(stringResult, this.element.font, this.element.pen, brush, currentBounds, this.format);
        var lineInfo = stringResult.lines[stringResult.lineCount - 1];
        result.lastLineBounds = graphics.getLineBounds(stringResult.lineCount - 1, stringResult, this.element.font, currentBounds, this.format);
        result.bounds = this.getTextPageBounds(currentPage, currentBounds, stringResult);
        result.remainder = stringResult.remainder;
        result.end = (textFinished);
        return result;
    };
    /* tslint:enable */
    /**
     * `Corrects current bounds` on the page.
     * @private
     */
    TextLayouter.prototype.checkCorrectBounds = function (currentPage, currentBounds) {
        var pageSize = currentPage.graphics.clientSize;
        currentBounds.height = (currentBounds.height > 0) ? currentBounds.height : pageSize.height - currentBounds.y;
        return currentBounds;
    };
    /**
     * Returns a `rectangle` where the text was printed on the page.
     * @private
     */
    /* tslint:disable */
    TextLayouter.prototype.getTextPageBounds = function (currentPage, currentBounds, stringResult) {
        var textSize = stringResult.actualSize;
        var x = currentBounds.x;
        var y = currentBounds.y;
        var width = (currentBounds.width > 0) ? currentBounds.width : textSize.width;
        var height = textSize.height;
        var shiftedRect = currentPage.graphics.checkCorrectLayoutRectangle(textSize, currentBounds.x, currentBounds.y, this.format);
        // if (currentBounds.width <= 0) {
        x = shiftedRect.x;
        // }
        var verticalShift = currentPage.graphics.getTextVerticalAlignShift(textSize.height, currentBounds.height, this.format);
        y += verticalShift;
        var bounds = new RectangleF(x, y, width, height);
        return bounds;
    };
    return TextLayouter;
}(ElementLayouter));
export { TextLayouter };
var TextPageLayoutResult = /** @class */ (function () {
    function TextPageLayoutResult() {
    }
    return TextPageLayoutResult;
}());
export { TextPageLayoutResult };
var PdfTextLayoutResult = /** @class */ (function (_super) {
    __extends(PdfTextLayoutResult, _super);
    // Constructors
    /**
     * Initializes the new instance of `PdfTextLayoutResult` class.
     * @private
     */
    function PdfTextLayoutResult(page, bounds, remainder, lastLineBounds) {
        var _this = _super.call(this, page, bounds) || this;
        _this.remainderText = remainder;
        _this.lastLineTextBounds = lastLineBounds;
        return _this;
    }
    Object.defineProperty(PdfTextLayoutResult.prototype, "remainder", {
        // Properties
        /**
         * Gets a value that contains the `text` that was not printed.
         * @private
         */
        get: function () {
            return this.remainderText;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PdfTextLayoutResult.prototype, "lastLineBounds", {
        /**
         * Gets a value that indicates the `bounds` of the last line that was printed on the page.
         * @private
         */
        get: function () {
            return this.lastLineTextBounds;
        },
        enumerable: true,
        configurable: true
    });
    return PdfTextLayoutResult;
}(PdfLayoutResult));
export { PdfTextLayoutResult };
