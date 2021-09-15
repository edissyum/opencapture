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
import { PdfFontFamily, PdfFontStyle, FontEncoding } from './enum';
import { PdfFont } from './pdf-font';
import { PdfDocument } from './../../document/pdf-document';
import { PdfStandardFontMetricsFactory } from './pdf-standard-font-metrics-factory';
import { PdfDictionary } from './../../primitives/pdf-dictionary';
import { DictionaryProperties } from './../../input-output/pdf-dictionary-properties';
import { PdfName } from './../../primitives/pdf-name';
/**
 * Represents one of the 14 standard fonts.
 * It's used to create a standard PDF font to draw the text in to the PDF.
 * ```typescript
 * // create a new PDF document
 * let document : PdfDocument = new PdfDocument();
 * // add a new page to the document
 * let page1 : PdfPage = document.pages.add();
 * //
 * // create new standard font
 * let font : PdfStandardFont = new PdfStandardFont(PdfFontFamily.Helvetica, 20);
 * //
 * // create black brush
 * let blackBrush : PdfSolidBrush = new PdfSolidBrush(new PdfColor(0, 0, 0));
 * // draw the text
 * page1.graphics.drawString('Hello World', font, blackBrush, new PointF(0, 0));
 * // save the document
 * document.save('output.pdf');
 * // destroy the document
 * document.destroy();
 * ```
 */
var PdfStandardFont = /** @class */ (function (_super) {
    __extends(PdfStandardFont, _super);
    function PdfStandardFont(fontFamilyPrototype, size, style) {
        var _this = _super.call(this, size, (typeof style === 'undefined') ? ((fontFamilyPrototype instanceof PdfStandardFont) ? fontFamilyPrototype.style : PdfFontStyle.Regular) : style) || this;
        /**
         * Gets `ascent` of the font.
         * @private
         */
        _this.dictionaryProperties = new DictionaryProperties();
        /**
         * Gets `encodings` for internal class use.
         * @hidden
         * @private
         */
        _this.encodings = ['Unknown', 'StandardEncoding', 'MacRomanEncoding', 'MacExpertEncoding',
            'WinAnsiEncoding', 'PDFDocEncoding', 'IdentityH'];
        if (typeof fontFamilyPrototype === 'undefined') {
            _this.pdfFontFamily = PdfFontFamily.Helvetica;
        }
        else if ((fontFamilyPrototype instanceof PdfStandardFont)) {
            _this.pdfFontFamily = fontFamilyPrototype.fontFamily;
        }
        else {
            _this.pdfFontFamily = fontFamilyPrototype;
        }
        _this.checkStyle();
        _this.initializeInternals();
        return _this;
    }
    Object.defineProperty(PdfStandardFont.prototype, "fontFamily", {
        /* tslint:enable */
        //Properties
        /**
         * Gets the `FontFamily`.
         * @private
         */
        get: function () {
            return this.pdfFontFamily;
        },
        enumerable: true,
        configurable: true
    });
    //methods
    /**
     * Checks font `style` of the font.
     * @private
     */
    PdfStandardFont.prototype.checkStyle = function () {
        if (this.fontFamily === PdfFontFamily.Symbol || this.fontFamily === PdfFontFamily.ZapfDingbats) {
            var style = this.style;
            style &= ~(PdfFontStyle.Bold | PdfFontStyle.Italic);
            this.setStyle(style);
        }
    };
    /**
     * Returns `width` of the line.
     * @public
     */
    PdfStandardFont.prototype.getLineWidth = function (line, format) {
        if (line == null) {
            throw new Error('ArgumentNullException:line');
        }
        var width = 0;
        var name = this.name;
        line = PdfStandardFont.convert(line);
        for (var i = 0, len = line.length; i < len; i++) {
            var ch = line[i];
            var charWidth = this.getCharWidthInternal(ch, format);
            width += charWidth;
        }
        var size = this.metrics.getSize(format);
        width *= (PdfFont.charSizeMultiplier * size);
        width = this.applyFormatSettings(line, format, width);
        return width;
    };
    /**
     * Checks whether fonts are `equals`.
     * @private
     */
    PdfStandardFont.prototype.equalsToFont = function (font) {
        var equal = false;
        var stFont = font;
        if (stFont != null) {
            var fontFamilyEqual = (this.fontFamily === stFont.fontFamily);
            var lineReducer = (~(PdfFontStyle.Underline | PdfFontStyle.Strikeout));
            var styleEqual = (this.style & lineReducer) === (stFont.style & lineReducer);
            equal = (fontFamilyEqual && styleEqual);
        }
        return equal;
    };
    /**
     * `Initializes` font internals..
     * @private
     */
    PdfStandardFont.prototype.initializeInternals = function () {
        var equalFont = null;
        // if (PdfDocument.EnableCache) {
        equalFont = PdfDocument.cache.search(this);
        // }
        var internals = null;
        // if (equalFont == null) {
        // Create font metrics.
        var metrics = PdfStandardFontMetricsFactory.getMetrics(this.pdfFontFamily, this.style, this.size);
        this.metrics = metrics;
        internals = this.createInternals();
        this.setInternals(internals);
    };
    /**
     * `Creates` font`s dictionary.
     * @private
     */
    PdfStandardFont.prototype.createInternals = function () {
        var dictionary = new PdfDictionary();
        dictionary.items.setValue(this.dictionaryProperties.type, new PdfName(this.dictionaryProperties.font));
        dictionary.items.setValue(this.dictionaryProperties.subtype, new PdfName(this.dictionaryProperties.type1));
        dictionary.items.setValue(this.dictionaryProperties.baseFont, new PdfName(this.metrics.postScriptName));
        if (this.fontFamily !== PdfFontFamily.Symbol && this.fontFamily !== PdfFontFamily.ZapfDingbats) {
            var encoding = this.encodings[FontEncoding.WinAnsiEncoding];
            dictionary.items.setValue(this.dictionaryProperties.encoding, new PdfName(encoding));
        }
        return dictionary;
    };
    /**
     * Returns `width` of the char. This methods doesn`t takes into consideration font`s size.
     * @private
     */
    PdfStandardFont.prototype.getCharWidthInternal = function (charCode, format) {
        var width = 0;
        var code = 0;
        code = charCode.charCodeAt(0);
        if (this.name === '0' || this.name === '1' || this.name === '2' ||
            this.name === '3' || this.name === '4') {
            code = code - PdfStandardFont.charOffset;
        }
        code = (code >= 0 && code !== 128) ? code : 0;
        var metrics = this.metrics;
        var widthTable = metrics.widthTable;
        width = widthTable.items(code);
        return width;
    };
    /**
     * `Converts` the specified text.
     * @private
     */
    PdfStandardFont.convert = function (text) {
        return text;
    };
    //Constants
    /**
     * First character `position`.
     * @private
     */
    PdfStandardFont.charOffset = 32;
    return PdfStandardFont;
}(PdfFont));
export { PdfStandardFont };
