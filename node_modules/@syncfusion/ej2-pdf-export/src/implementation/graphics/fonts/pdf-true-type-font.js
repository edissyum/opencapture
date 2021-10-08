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
 * PdfTrueTypeFont.ts class for EJ2-PDF
 */
import { UnicodeTrueTypeFont } from './unicode-true-type-font';
import { PdfFont } from './pdf-font';
import { PdfFontStyle } from './enum';
import { PdfDocument } from './../../document/pdf-document';
import { PdfTextDirection } from './../enum';
import { RtlRenderer } from './rtl-renderer';
//https://www.giftofspeed.com/base64-encoder/
var PdfTrueTypeFont = /** @class */ (function (_super) {
    __extends(PdfTrueTypeFont, _super);
    function PdfTrueTypeFont(base64String, size, style) {
        var _this = _super.call(this, size) || this;
        /**
         * Indicates whether the font is embedded or not.
         * @private
         */
        _this.isEmbedFont = false;
        /**
         * Indicates whether the font is unicoded or not.
         * @private
         */
        _this.isUnicode = true;
        if (style !== undefined) {
            _this.createFontInternal(base64String, style);
        }
        else {
            _this.createFontInternal(base64String, PdfFontStyle.Regular);
        }
        return _this;
    }
    PdfTrueTypeFont.prototype.equalsToFont = function (font) {
        var result = false;
        //let result : boolean = this.fontInternal.equalsToFont(font);
        return result;
    };
    PdfTrueTypeFont.prototype.getLineWidth = function (line, format) {
        var width = 0;
        if (format !== null && typeof format !== 'undefined' && format.textDirection !== PdfTextDirection.None) {
            var returnValue = this.getUnicodeLineWidth(line, /*out*/ width, format);
            width = returnValue.width;
        }
        else {
            width = this.fontInternal.getLineWidth(line);
        }
        var size = this.metrics.getSize(format);
        width *= (PdfFont.charSizeMultiplier * size);
        width = this.applyFormatSettings(line, format, width);
        return width;
    };
    /**
     * Returns width of the char.
     */
    PdfTrueTypeFont.prototype.getCharWidth = function (charCode, format) {
        var codeWidth = this.fontInternal.getCharWidth(charCode);
        var size = this.metrics.getSize(format);
        codeWidth *= (0.001 * size);
        return codeWidth;
    };
    //Implementation
    PdfTrueTypeFont.prototype.createFontInternal = function (base64String, style) {
        this.fontInternal = new UnicodeTrueTypeFont(base64String, this.size);
        this.calculateStyle(style);
        this.initializeInternals();
    };
    PdfTrueTypeFont.prototype.calculateStyle = function (style) {
        var iStyle = this.fontInternal.ttfMetrics.macStyle;
        if ((style & PdfFontStyle.Underline) !== 0) {
            iStyle |= PdfFontStyle.Underline;
        }
        if ((style & PdfFontStyle.Strikeout) !== 0) {
            iStyle |= PdfFontStyle.Strikeout;
        }
        this.setStyle(iStyle);
    };
    PdfTrueTypeFont.prototype.initializeInternals = function () {
        var equalFont = null;
        if (PdfDocument.enableCache) {
            // Search for the similar fonts.
            equalFont = PdfDocument.cache.search(this);
        }
        var internals = null;
        // There is not equal font in the cache.
        if (equalFont !== null && equalFont !== undefined) {
            // Get the settings from the cached font.
            internals = equalFont.getInternals();
            var metrics = equalFont.metrics;
            metrics = metrics.clone();
            metrics.size = this.size;
            this.metrics = metrics;
            this.fontInternal = equalFont.fontInternal;
        }
        else {
            if (equalFont == null) {
                if (this.fontInternal instanceof UnicodeTrueTypeFont) {
                    this.fontInternal.isEmbed = this.isEmbedFont;
                }
                this.fontInternal.createInternals();
                internals = this.fontInternal.getInternals();
                this.metrics = this.fontInternal.metrics;
            }
        }
        this.metrics.isUnicodeFont = true;
        this.setInternals(internals);
        //this.ttfReader = (this.fontInternal as UnicodeTrueTypeFont).ttfReader;
    };
    /**
     * Stores used symbols.
     */
    PdfTrueTypeFont.prototype.setSymbols = function (text) {
        var internalFont = this.fontInternal;
        if (internalFont != null) {
            internalFont.setSymbols(text);
        }
    };
    Object.defineProperty(PdfTrueTypeFont.prototype, "Unicode", {
        /**
         * Property
         *
         */
        get: function () {
            return this.isUnicode;
        },
        enumerable: true,
        configurable: true
    });
    // public get Font() : UnicodeTrueTypeFont {
    //     return this.fontInternal as UnicodeTrueTypeFont;
    // }
    PdfTrueTypeFont.prototype.getUnicodeLineWidth = function (line, /*out*/ width, format) {
        // if (line == null) {
        //     throw new Error('ArgumentNullException : line');
        // }
        width = 0;
        var glyphIndices = null;
        var rtlRender = new RtlRenderer();
        /* tslint:disable-next-line:max-line-length */
        var result = rtlRender.getGlyphIndex(line, this, (format.textDirection === PdfTextDirection.RightToLeft) ? true : false, /*out*/ glyphIndices, true);
        var resultGlyph = result.success;
        glyphIndices = result.glyphs;
        if (resultGlyph && glyphIndices !== null) {
            var ttfReader = this.fontInternal.ttfReader;
            for (var i = 0, len = glyphIndices.length; i < len; i++) {
                var glyphIndex = glyphIndices[i];
                var glyph = ttfReader.getGlyph(glyphIndex);
                if (glyph !== null && typeof glyph !== 'undefined') {
                    width += glyph.width;
                }
            }
        }
        return { success: resultGlyph, width: width };
    };
    return PdfTrueTypeFont;
}(PdfFont));
export { PdfTrueTypeFont };
