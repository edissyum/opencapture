/**
 * PdfStringFormat.ts class for EJ2-PDF
 */
import { PdfVerticalAlignment } from './../../graphics/enum';
import { PdfSubSuperScript, PdfWordWrapType } from './../../graphics/fonts/enum';
/**
 * `PdfStringFormat` class represents the text layout information on PDF.
 * ```typescript
 * // create a new PDF document
 * let document : PdfDocument = new PdfDocument();
 * // add a pages to the document
 * let page1 : PdfPage = document.pages.add();
 * // set font
 * let font : PdfStandardFont = new PdfStandardFont(PdfFontFamily.Helvetica, 20);
 * // set brush
 * let blackBrush : PdfSolidBrush = new PdfSolidBrush(new PdfColor(0, 0, 0));
 * //
 * // set the format for string
 * let stringFormat : PdfStringFormat = new PdfStringFormat();
 * // set the text alignment
 * stringFormat.alignment = PdfTextAlignment.Center;
 * // set the vertical alignment
 * stringFormat.lineAlignment = PdfVerticalAlignment.Middle;
 * //
 * // draw the text
 * page1.graphics.drawString('Hello World', font, blackBrush, new PointF(10, 10), stringFormat);
 * // save the document
 * document.save('output.pdf');
 * // destroy the document
 * document.destroy();
 * ```
 */
var PdfStringFormat = /** @class */ (function () {
    function PdfStringFormat(arg1, arg2) {
        /**
         * The `scaling factor` of the text being drawn.
         * @private
         */
        this.scalingFactor = 100.0;
        /**
         * Indicates text `wrapping` type.
         * @private
         */
        this.wordWrapType = PdfWordWrapType.Word;
        this.internalLineLimit = true;
        this.wordWrapType = PdfWordWrapType.Word;
        if ((typeof arg1 !== 'undefined') && (typeof arg1 !== 'string')) {
            this.textAlignment = arg1;
        }
        if (typeof arg2 !== 'undefined') {
            this.verticalAlignment = arg2;
        }
    }
    Object.defineProperty(PdfStringFormat.prototype, "alignment", {
        //Properties
        /**
         * Gets or sets the `horizontal` text alignment
         * ```typescript
         * // create a new PDF document
         * let document : PdfDocument = new PdfDocument();
         * // add a pages to the document
         * let page1 : PdfPage = document.pages.add();
         * // set font
         * let font : PdfStandardFont = new PdfStandardFont(PdfFontFamily.Helvetica, 20);
         * // set brush
         * let blackBrush : PdfSolidBrush = new PdfSolidBrush(new PdfColor(0, 0, 0));
         * //
         * // set the format for string
         * let stringFormat : PdfStringFormat = new PdfStringFormat();
         * // set the text alignment
         * stringFormat.alignment = PdfTextAlignment.Center;
         * //
         * // draw the text
         * page1.graphics.drawString('Hello World', font, blackBrush, new PointF(10, 10), stringFormat);
         * // save the document
         * document.save('output.pdf');
         * // destroy the document
         * document.destroy();
         * ```
         */
        get: function () {
            return this.textAlignment;
        },
        set: function (value) {
            this.textAlignment = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PdfStringFormat.prototype, "textDirection", {
        get: function () {
            return this.direction;
        },
        set: function (value) {
            this.direction = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PdfStringFormat.prototype, "lineAlignment", {
        /**
         * Gets or sets the `vertical` text alignment.
         * ```typescript
         * // create a new PDF document
         * let document : PdfDocument = new PdfDocument();
         * // add a pages to the document
         * let page1 : PdfPage = document.pages.add();
         * // set font
         * let font : PdfStandardFont = new PdfStandardFont(PdfFontFamily.Helvetica, 20);
         * // set brush
         * let blackBrush : PdfSolidBrush = new PdfSolidBrush(new PdfColor(0, 0, 0));
         * //
         * // set the format for string
         * let stringFormat : PdfStringFormat = new PdfStringFormat();
         * // set the vertical alignment
         * stringFormat.lineAlignment = PdfVerticalAlignment.Middle;
         * //
         * // draw the text
         * page1.graphics.drawString('Hello World', font, blackBrush, new PointF(10, 10), stringFormat);
         * // save the document
         * document.save('output.pdf');
         * // destroy the document
         * document.destroy();
         * ```
         */
        get: function () {
            if (typeof this.verticalAlignment === 'undefined' || this.verticalAlignment == null) {
                return PdfVerticalAlignment.Top;
            }
            else {
                return this.verticalAlignment;
            }
        },
        set: function (value) {
            this.verticalAlignment = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PdfStringFormat.prototype, "rightToLeft", {
        /**
         * Gets or sets the value that indicates text `direction` mode.
         * @private
         */
        get: function () {
            if (typeof this.isRightToLeft === 'undefined' || this.isRightToLeft == null) {
                return false;
            }
            else {
                return this.isRightToLeft;
            }
        },
        set: function (value) {
            this.isRightToLeft = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PdfStringFormat.prototype, "characterSpacing", {
        /**
         * Gets or sets value that indicates a `size` among the characters in the text.
         * ```typescript
         * // create a new PDF document
         * let document : PdfDocument = new PdfDocument();
         * // add a pages to the document
         * let page1 : PdfPage = document.pages.add();
         * // set font
         * let font : PdfStandardFont = new PdfStandardFont(PdfFontFamily.Helvetica, 20);
         * // set brush
         * let blackBrush : PdfSolidBrush = new PdfSolidBrush(new PdfColor(0, 0, 0));
         * //
         * // set the format for string
         * let stringFormat : PdfStringFormat = new PdfStringFormat();
         * // set character spacing
         * stringFormat.characterSpacing = 10;
         * //
         * // draw the text
         * page1.graphics.drawString('Hello World', font, blackBrush, new PointF(10, 10), stringFormat);
         * // save the document
         * document.save('output.pdf');
         * // destroy the document
         * document.destroy();
         * ```
         */
        get: function () {
            if (typeof this.internalCharacterSpacing === 'undefined' || this.internalCharacterSpacing == null) {
                return 0;
            }
            else {
                return this.internalCharacterSpacing;
            }
        },
        set: function (value) {
            this.internalCharacterSpacing = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PdfStringFormat.prototype, "wordSpacing", {
        /**
         * Gets or sets value that indicates a `size` among the words in the text.
         * ```typescript
         * // create a new PDF document
         * let document : PdfDocument = new PdfDocument();
         * // add a pages to the document
         * let page1 : PdfPage = document.pages.add();
         * // set font
         * let font : PdfStandardFont = new PdfStandardFont(PdfFontFamily.Helvetica, 20);
         * // set brush
         * let blackBrush : PdfSolidBrush = new PdfSolidBrush(new PdfColor(0, 0, 0));
         * //
         * // set the format for string
         * let stringFormat : PdfStringFormat = new PdfStringFormat();
         * // set word spacing
         * stringFormat.wordSpacing = 10;
         * //
         * // draw the text
         * page1.graphics.drawString('Hello World', font, blackBrush, new PointF(10, 10), stringFormat);
         * // save the document
         * document.save('output.pdf');
         * // destroy the document
         * document.destroy();
         * ```
         */
        get: function () {
            if (typeof this.internalWordSpacing === 'undefined' || this.internalWordSpacing == null) {
                return 0;
            }
            else {
                return this.internalWordSpacing;
            }
        },
        set: function (value) {
            this.internalWordSpacing = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PdfStringFormat.prototype, "lineSpacing", {
        /**
         * Gets or sets value that indicates the `vertical distance` between the baselines of adjacent lines of text.
         * ```typescript
         * // create a new PDF document
         * let document : PdfDocument = new PdfDocument();
         * // add a pages to the document
         * let page1 : PdfPage = document.pages.add();
         * // set font
         * let font : PdfStandardFont = new PdfStandardFont(PdfFontFamily.Helvetica, 20);
         * // set brush
         * let blackBrush : PdfSolidBrush = new PdfSolidBrush(new PdfColor(0, 0, 0));
         * // set string
         * let text : string = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor
         * incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitati';
         * // set rectangle bounds
         * let rectangle : RectangleF = new RectangleF({x : 0, y : 0}, {width : 300, height : 100})
         * //
         * // set the format for string
         * let stringFormat : PdfStringFormat = new PdfStringFormat();
         * // set line spacing
         * stringFormat.lineSpacing = 10;
         * //
         * // draw the text
         * page1.graphics.drawString(text, font, blackBrush, rectangle, stringFormat);
         * // save the document
         * document.save('output.pdf');
         * // destroy the document
         * document.destroy();
         * ```
         */
        get: function () {
            if (typeof this.leading === 'undefined' || this.leading == null) {
                return 0;
            }
            else {
                return this.leading;
            }
        },
        set: function (value) {
            this.leading = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PdfStringFormat.prototype, "clipPath", {
        /**
         * Gets or sets a value indicating whether the text is `clipped` or not.
         * @private
         */
        get: function () {
            if (typeof this.clip === 'undefined' || this.clip == null) {
                return false;
            }
            else {
                return this.clip;
            }
        },
        set: function (value) {
            this.clip = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PdfStringFormat.prototype, "subSuperScript", {
        /**
         * Gets or sets value indicating whether the text is in `subscript or superscript` mode.
         * @private
         */
        get: function () {
            if (typeof this.pdfSubSuperScript === 'undefined' || this.pdfSubSuperScript == null) {
                return PdfSubSuperScript.None;
            }
            else {
                return this.pdfSubSuperScript;
            }
        },
        set: function (value) {
            this.pdfSubSuperScript = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PdfStringFormat.prototype, "paragraphIndent", {
        /**
         * Gets or sets the `indent` of the first line in the paragraph.
         * @private
         */
        get: function () {
            if (typeof this.internalParagraphIndent === 'undefined' || this.internalParagraphIndent == null) {
                return 0;
            }
            else {
                return this.internalParagraphIndent;
            }
        },
        set: function (value) {
            this.internalParagraphIndent = value;
            this.firstLineIndent = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PdfStringFormat.prototype, "lineLimit", {
        /**
         * Gets or sets a value indicating whether [`line limit`].
         * @private
         */
        get: function () {
            return this.internalLineLimit;
        },
        set: function (value) {
            this.internalLineLimit = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PdfStringFormat.prototype, "measureTrailingSpaces", {
        /**
         * Gets or sets a value indicating whether [`measure trailing spaces`].
         * @private
         */
        get: function () {
            if (typeof this.trailingSpaces === 'undefined' || this.trailingSpaces == null) {
                return false;
            }
            else {
                return this.trailingSpaces;
            }
        },
        set: function (value) {
            this.trailingSpaces = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PdfStringFormat.prototype, "noClip", {
        /**
         * Gets or sets a value indicating whether [`no clip`].
         * @private
         */
        get: function () {
            if (typeof this.isNoClip === 'undefined' || this.isNoClip == null) {
                return false;
            }
            else {
                return this.isNoClip;
            }
        },
        set: function (value) {
            this.isNoClip = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PdfStringFormat.prototype, "wordWrap", {
        /**
         * Gets or sets value indicating type of the text `wrapping`.
         * @private
         */
        get: function () {
            // if (typeof this.wrapType === 'undefined' || this.wrapType == null) {
            //     return PdfWordWrapType.Word;
            // } else {
            return this.wordWrapType;
            // }
        },
        set: function (value) {
            this.wordWrapType = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PdfStringFormat.prototype, "horizontalScalingFactor", {
        /**
         * Gets or sets the `scaling factor`.
         * @private
         */
        get: function () {
            // if (typeof this.scalingFactor === 'undefined' || this.scalingFactor == null) {
            //     return 100;
            // } else {
            return this.scalingFactor;
            // }
        },
        set: function (value) {
            if (value <= 0) {
                throw new Error('ArgumentOutOfRangeException:The scaling factor cant be less of equal to zero, ScalingFactor');
            }
            this.scalingFactor = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PdfStringFormat.prototype, "firstLineIndent", {
        /**
         * Gets or sets the `indent` of the first line in the text.
         * @private
         */
        get: function () {
            if (typeof this.initialLineIndent === 'undefined' || this.initialLineIndent == null) {
                return 0;
            }
            else {
                return this.initialLineIndent;
            }
        },
        set: function (value) {
            this.initialLineIndent = value;
        },
        enumerable: true,
        configurable: true
    });
    /**
     * `Clones` the object.
     * @private
     */
    //IClonable implementation
    PdfStringFormat.prototype.clone = function () {
        var format = this;
        return format;
    };
    return PdfStringFormat;
}());
export { PdfStringFormat };
