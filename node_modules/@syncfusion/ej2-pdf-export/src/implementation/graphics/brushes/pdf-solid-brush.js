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
import { PdfColor } from './../pdf-color';
import { PdfColorSpace } from './../enum';
import { PdfBrush } from './pdf-brush';
/**
 * Represents a brush that fills any object with a solid color.
 * ```typescript
 * // create a new PDF document
 * let document : PdfDocument = new PdfDocument();
 * // add a pages to the document
 * let page1 : PdfPage = document.pages.add();
 * // set font
 * let font : PdfStandardFont = new PdfStandardFont(PdfFontFamily.Helvetica, 20);
 * // set brush
 * let blackBrush : PdfSolidBrush = new PdfSolidBrush(new PdfColor(0, 0, 0));
 * // draw the text
 * page1.graphics.drawString('Hello World', font, blackBrush, new PointF(10, 10));
 * // save the document
 * document.save('output.pdf');
 * // destroy the document
 * document.destroy();
 * ```
 */
var PdfSolidBrush = /** @class */ (function (_super) {
    __extends(PdfSolidBrush, _super);
    //Constructors
    /**
     * Initializes a new instance of the `PdfSolidBrush` class.
     * ```typescript
     * // create a new PDF document
     * let document : PdfDocument = new PdfDocument();
     * // add a pages to the document
     * let page1 : PdfPage = document.pages.add();
     * // set font
     * let font : PdfStandardFont = new PdfStandardFont(PdfFontFamily.Helvetica, 20);
     * // set brush
     * let blackBrush : PdfSolidBrush = new PdfSolidBrush(new PdfColor(0, 0, 0));
     * // draw the text
     * page1.graphics.drawString('Hello World', font, blackBrush, new PointF(10, 10));
     * // save the document
     * document.save('output.pdf');
     * // destroy the document
     * document.destroy();
     * ```
     * @param color color of the brush
     */
    function PdfSolidBrush(color) {
        var _this = _super.call(this) || this;
        _this.pdfColor = color;
        return _this;
    }
    Object.defineProperty(PdfSolidBrush.prototype, "color", {
        //Properties
        /**
         * Gets or sets the `color` of the brush.
         * @private
         */
        get: function () {
            return this.pdfColor;
        },
        set: function (value) {
            this.pdfColor = value;
        },
        enumerable: true,
        configurable: true
    });
    //Implementation
    /**
     * `Monitors` the changes of the brush and modify PDF state respectively.
     * @private
     */
    PdfSolidBrush.prototype.monitorChanges = function (brush, streamWriter, getResources, saveChanges, currentColorSpace) {
        if (streamWriter == null) {
            throw new Error('ArgumentNullException:streamWriter');
        }
        var diff = false;
        if (brush == null) {
            diff = true;
            streamWriter.setColorAndSpace(this.pdfColor, currentColorSpace, false);
            return diff;
        }
        else {
            var sBrush = brush;
            diff = true;
            streamWriter.setColorAndSpace(this.pdfColor, currentColorSpace, false);
            return diff;
        }
    };
    /**
     * `Resets` the changes, which were made by the brush.
     * @private
     */
    PdfSolidBrush.prototype.resetChanges = function (streamWriter) {
        streamWriter.setColorAndSpace(new PdfColor(0, 0, 0), PdfColorSpace.Rgb, false);
    };
    return PdfSolidBrush;
}(PdfBrush));
export { PdfSolidBrush };
