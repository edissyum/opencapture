/**
 * PdfFont.ts class for EJ2-PDF
 */
import { PdfFontStyle } from './enum';
import { SizeF } from './../../drawing/pdf-drawing';
import { PdfStringFormat } from './pdf-string-format';
import { PdfStringLayouter } from './string-layouter';
import { StringTokenizer } from './string-tokenizer';
/**
 * Defines a particular format for text, including font face, size, and style attributes.
 * @private
 */
var PdfFont = /** @class */ (function () {
    function PdfFont(size, style) {
        /**
         * `Style` of the font.
         * @private
         */
        this.fontStyle = PdfFontStyle.Regular;
        if (typeof size === 'number' && typeof style === 'undefined') {
            this.fontSize = size;
        }
        else {
            this.fontSize = size;
            this.setStyle(style);
        }
    }
    Object.defineProperty(PdfFont.prototype, "name", {
        //Properties
        /**
         * Gets the face name of this Font.
         * @private
         */
        get: function () {
            return this.metrics.name;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PdfFont.prototype, "size", {
        /**
         * Gets the size of this font.
         * @private
         */
        get: function () {
            return this.fontSize;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PdfFont.prototype, "height", {
        /**
         * Gets the height of the font in points.
         * @private
         */
        get: function () {
            return this.metrics.getHeight(null);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PdfFont.prototype, "style", {
        /**
         * Gets the style information for this font.
         * @private
         */
        get: function () {
            return this.fontStyle;
        },
        set: function (value) {
            this.fontStyle = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PdfFont.prototype, "bold", {
        /**
         * Gets a value indicating whether this `PdfFont` is `bold`.
         * @private
         */
        get: function () {
            return ((this.style & PdfFontStyle.Bold) > 0);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PdfFont.prototype, "italic", {
        /**
         * Gets a value indicating whether this `PdfFont` has the `italic` style applied.
         * @private
         */
        get: function () {
            return ((this.style & PdfFontStyle.Italic) > 0);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PdfFont.prototype, "strikeout", {
        /**
         * Gets a value indicating whether this `PdfFont` is `strikeout`.
         * @private
         */
        get: function () {
            return ((this.style & PdfFontStyle.Strikeout) > 0);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PdfFont.prototype, "underline", {
        /**
         * Gets a value indicating whether this `PdfFont` is `underline`.
         * @private
         */
        get: function () {
            return ((this.style & PdfFontStyle.Underline) > 0);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PdfFont.prototype, "metrics", {
        /**
         * Gets or sets the `metrics` for this font.
         * @private
         */
        get: function () {
            return this.fontMetrics;
        },
        set: function (value) {
            this.fontMetrics = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PdfFont.prototype, "element", {
        // /**
        //  * Gets and Sets the font `internals`.
        //  * @private
        //  */
        // public get fontInternal() : IPdfPrimitive {
        //     return this.pdfFontInternals;
        // }
        // public set fontInternal(value : IPdfPrimitive) {
        //     this.pdfFontInternals = value;
        // }
        //IPdfWrapper Members
        /**
         * Gets the `element` representing the font.
         * @private
         */
        get: function () {
            return this.pdfFontInternals;
        },
        enumerable: true,
        configurable: true
    });
    PdfFont.prototype.measureString = function (text, arg2, arg3, arg4, arg5) {
        if (typeof text === 'string' && typeof arg2 === 'undefined') {
            return this.measureString(text, null);
        }
        else if (typeof text === 'string' && (arg2 instanceof PdfStringFormat || arg2 == null) && typeof arg3 === 'undefined' && typeof arg4 === 'undefined') {
            var temparg2 = arg2;
            var charactersFitted = 0;
            var linesFilled = 0;
            return this.measureString(text, temparg2, charactersFitted, linesFilled);
        }
        else if (typeof text === 'string' && (arg2 instanceof PdfStringFormat || arg2 == null) && typeof arg3 === 'number' && typeof arg4 === 'number') {
            var temparg2 = arg2;
            return this.measureString(text, 0, temparg2, arg3, arg4);
            // } else if (typeof text === 'string' && typeof arg2 === 'number' && typeof arg3 === 'undefined') {
            //     return this.measureString(text, arg2, null);
            // } else if (typeof text === 'string' && typeof arg2 === 'number' && (arg3 instanceof PdfStringFormat || arg3 == null) && typeof arg4 === 'undefined' && typeof arg5 === 'undefined') {
            //     let temparg3 : PdfStringFormat = arg3 as PdfStringFormat;
            //     let charactersFitted : number = 0;
            //     let linesFilled : number = 0;
            //     return this.measureString(text, arg2, temparg3, charactersFitted, linesFilled);
        }
        else if (typeof text === 'string' && typeof arg2 === 'number' && (arg3 instanceof PdfStringFormat || arg3 == null) && typeof arg4 === 'number' && typeof arg5 === 'number') {
            var layoutArea = new SizeF(arg2, 0);
            var temparg3 = arg3;
            return this.measureString(text, layoutArea, temparg3, arg4, arg5);
            // } else if (typeof text === 'string' && arg2 instanceof SizeF && typeof arg3 === 'undefined') {
            //     return this.measureString(text, arg2, null);
            // } else if (typeof text === 'string' && arg2 instanceof SizeF && (arg3 instanceof PdfStringFormat || arg3 == null) && typeof arg4 === 'undefined' && typeof arg5 === 'undefined') {
            //     let temparg3 : PdfStringFormat = arg3 as PdfStringFormat;
            //     let charactersFitted : number = 0;
            //     let linesFilled : number = 0;
            //     return this.measureString(text, arg2, temparg3, charactersFitted, linesFilled);
        }
        else {
            if (text == null) {
                throw Error("ArgumentNullException(\"text\")");
            }
            var temparg2 = arg2;
            var temparg3 = arg3;
            var layouter = new PdfStringLayouter();
            var result = layouter.layout(text, this, temparg3, temparg2, false, new SizeF(0, 0));
            // arg4 = (result.Remainder == null) ? text.length : text.length - result.Remainder.length;
            arg4 = text.length;
            arg5 = (result.empty) ? 0 : result.lines.length;
            return result.actualSize;
        }
    };
    /* tslint:enable */
    //IPdfCache Members
    /**
     * `Checks` whether the object is similar to another object.
     * @private
     */
    PdfFont.prototype.equalsTo = function (obj) {
        var result = this.equalsToFont(obj);
        return result;
    };
    /**
     * Returns `internals` of the object.
     * @private
     */
    PdfFont.prototype.getInternals = function () {
        return this.pdfFontInternals;
    };
    /**
     * Sets `internals` to the object.
     * @private
     */
    PdfFont.prototype.setInternals = function (internals) {
        if (internals == null) {
            throw new Error('ArgumentNullException:internals');
        }
        this.pdfFontInternals = internals;
    };
    /**
     * Sets the `style` of the font.
     * @private
     */
    PdfFont.prototype.setStyle = function (style) {
        this.fontStyle = style;
    };
    /**
     * Applies `settings` to the default line width.
     * @private
     */
    PdfFont.prototype.applyFormatSettings = function (line, format, width) {
        // if (line == null) {
        //     throw new Error(`ArgumentNullException:line`);
        // }
        var realWidth = width;
        if (format != null && width > 0) {
            // Space among characters is not default.
            if (format.characterSpacing !== 0) {
                realWidth += (line.length - 1) * format.characterSpacing;
            }
            // Space among words is not default.
            if (format.wordSpacing !== 0) {
                var symbols = StringTokenizer.spaces;
                var whitespacesCount = StringTokenizer.getCharsCount(line, symbols);
                realWidth += whitespacesCount * format.wordSpacing;
            }
        }
        return realWidth;
    };
    //Constants
    /**
     * `Multiplier` of the symbol width.
     * @default 0.001
     * @private
     */
    PdfFont.charSizeMultiplier = 0.001;
    /**
     * `Synchronization` object.
     * @private
     */
    PdfFont.syncObject = new Object();
    return PdfFont;
}());
export { PdfFont };
