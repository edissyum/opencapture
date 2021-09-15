import { PdfString } from './../../primitives/pdf-string';
import { ArabicShapeRenderer } from './rtl/rtl-text-shape';
import { PdfTextDirection } from './../enum';
import { Bidi } from './rtl/rtl-bidirectional';
/**
 * `Metrics` of the font.
 * @private
 */
var RtlRenderer = /** @class */ (function () {
    function RtlRenderer() {
        //region Constants
        /// Open bracket symbol.
        /// </summary>
        this.openBracket = '(';
        /// <summary>
        /// Close bracket symbol.
        /// </summary>
        this.closeBracket = ')';
        //#endregion
    }
    //#region Constructors
    /// <summary>
    /// Initializes a new instance of the <see cref="RtlRenderer"/> class.
    /// </summary>
    // public constructor() {
    // }
    //#region Public Methods
    /// <summary>
    /// Layouts text. Changes blocks position in the RTL text.
    /// Ligates the text if needed.
    /// </summary>
    /// <param name="line">Line of the text.</param>
    /// <param name="font">Font to be used for string printing.</param>
    /// <param name="rtl">Font alignment.</param>
    /// <param name="wordSpace">Indicates whether Word Spacing used or not.</param>
    /// <returns>Layout string.</returns>
    RtlRenderer.prototype.layout = function (line, font, rtl, wordSpace, format) {
        if (line == null) {
            throw new Error('ArgumentNullException : line');
        }
        if (font == null) {
            throw new Error('ArgumentNullException : font');
        }
        var result = [];
        if (font.Unicode) {
            result = this.customLayout(line, rtl, format, font, wordSpace);
        }
        else {
            result = [];
            result[0] = line;
        }
        return result;
    };
    /// <summary>
    /// Layouts a string and splits it by the words and using correct lay outing.
    /// </summary>
    /// <param name="line">Text line.</param>
    /// <param name="font">Font object.</param>
    /// <param name="rtl">Indicates whether RTL should be applied.</param>
    /// <param name="wordSpace">Indicates whether word spacing is used.</param>
    /// <returns>Array of words if converted, null otherwise.</returns>
    RtlRenderer.prototype.splitLayout = function (line, font, rtl, wordSpace, format) {
        if (line == null) {
            throw new Error('ArgumentNullException : line');
        }
        if (font == null) {
            throw new Error('ArgumentNullException : font');
        }
        var words = [];
        var system = false;
        if (!system || words == null) {
            words = this.customSplitLayout(line, font, rtl, wordSpace, format);
        }
        return words;
    };
    //#endregion
    //#region Implementation
    // private isEnglish( word : string) : boolean
    // {
    //     let c : string = (word.length > 0) ? word[0] : '';
    //     return (c >= '0' && c < 'ÿ');
    // }
    // private keepOrder( words : string, startIndex : number, count: number, result : string[], resultIndex : number) : void
    // {
    //     for (let i : number = 0, ri = resultIndex - count + 1; i < count; ++i, ++ri) {
    //         result[ri] = words[i + startIndex];
    //     }
    // }
    /// <summary>
    /// Uses system API to layout the text.
    /// </summary>
    /// <param name="line">Line of the text to be layouted.</param>
    /// <param name="font">Font which is used for text printing.</param>
    /// <param name="rtl">Indicates whether we use RTL or RTL lay outing of the text container.</param>
    /// <returns>Layout string.</returns>
    /* tslint:disable-next-line:max-line-length */
    RtlRenderer.prototype.getGlyphIndex = function (line, font, rtl, /*out*/ glyphs, custom) {
        var success = true;
        var fail = false;
        if (line == null) {
            throw new Error('ArgumentNullException : line');
        }
        if (font == null) {
            throw new Error('ArgumentNullException : font');
        }
        glyphs = null;
        if (line.length === 0) {
            return { success: fail, glyphs: glyphs };
        }
        var renderer = new ArabicShapeRenderer();
        var text = renderer.shape(line, 0);
        var internalFont = font.fontInternal;
        var ttfReader = internalFont.ttfReader;
        glyphs = new Uint16Array(text.length);
        var i = 0;
        for (var k = 0, len = text.length; k < len; k++) {
            var ch = text[k];
            var glyphInfo = ttfReader.getGlyph(ch);
            if (glyphInfo !== null && typeof glyphInfo !== 'undefined') {
                glyphs[i++] = (glyphInfo).index;
            }
        }
        return { success: success, glyphs: glyphs };
    };
    /* tslint:disable-next-line:max-line-length */
    RtlRenderer.prototype.customLayout = function (line, rtl, format, font, wordSpace) {
        if (wordSpace === null || typeof wordSpace === 'undefined') {
            if (line == null) {
                throw new Error('ArgumentNullException : line');
            }
            var result = null;
            //bidirectional order.
            if (format !== null && typeof format !== 'undefined' && format.textDirection !== PdfTextDirection.None) {
                var bidi = new Bidi();
                result = bidi.getLogicalToVisualString(line, rtl);
            }
            return result;
        }
        else {
            if (line == null) {
                throw new Error('ArgumentNullException : line');
            }
            if (font == null) {
                throw new Error('ArgumentNullException : font');
            }
            var layouted = null;
            if (format !== null && typeof format !== 'undefined' && format.textDirection !== PdfTextDirection.None) {
                var renderer = new ArabicShapeRenderer();
                var txt = renderer.shape(line, 0);
                layouted = this.customLayout(txt, rtl, format);
            }
            // else {
            //     layouted = this.customLayout(line, rtl, format);
            // }
            // We have unicode font, but from the file.        
            var result = [];
            // Split the text by words if word spacing is not default.
            if (wordSpace) {
                var words = layouted.split('');
                var count = words.length;
                for (var i = 0; i < count; i++) {
                    words[i] = this.addChars(font, words[i]);
                }
                result = words;
            }
            else {
                result = [];
                result[0] = this.addChars(font, layouted);
            }
            return result;
        }
    };
    /// <summary>
    /// Add information about used glyphs to the font.
    /// </summary>
    /// <param name="font">Font used for text rendering.</param>
    /// <param name="glyphs">Array of used glyphs.</param>
    /// <returns>String in the form to be written to the file.</returns>
    RtlRenderer.prototype.addChars = function (font, glyphs) {
        var line = glyphs;
        if (font == null) {
            throw new Error('ArgumentNullException : font');
        }
        if (line == null) {
            throw new Error('ArgumentNullException : line');
        }
        var text = line;
        var internalFont = font.fontInternal;
        var ttfReader = internalFont.ttfReader;
        font.setSymbols(text);
        // Reconvert string according to unicode standard.
        text = ttfReader.convertString(text);
        var bytes = PdfString.toUnicodeArray(text, false);
        text = PdfString.byteToString(bytes);
        return text;
        // else {
        //     if (font == null) {
        //         throw new Error('ArgumentNullException : font');
        //     }
        //     if (glyphs == null) {
        //         throw new Error('ArgumentNullException : glyphs');
        //     }
        //     // Mark the chars as used.
        //     let text : string = '';
        //     font.setSymbols(glyphs);
        //     // Create string from the glyphs.
        //     
        //     let chars : string[] = [];
        //     for (let i : number = 0; i < glyphs.length; i++) {
        //         chars[i] = glyphs[i].toString();
        //     }
        //     for (let j : number = 0 ; j < chars.length; j++) {
        //         text = text + chars[j];
        //     }
        //     let bytes : number[] = PdfString.toUnicodeArray(text, false);
        //     text = PdfString.byteToString(bytes);
        //     return text;
        // }
    };
    /// <summary>
    /// Layouts a string and splits it by the words by using custom lay outing.
    /// </summary>
    /// <param name="line">Text line.</param>
    /// <param name="font">Font object.</param>
    /// <param name="rtl">Indicates whether RTL should be applied.</param>
    /// <param name="wordSpace">Indicates whether word spacing is used.</param>
    /// <returns>Array of words if converted, null otherwise.</returns>
    /* tslint:disable-next-line:max-line-length */
    RtlRenderer.prototype.customSplitLayout = function (line, font, rtl, wordSpace, format) {
        if (line == null) {
            throw new Error('ArgumentNullException : line');
        }
        if (font == null) {
            throw new Error('ArgumentNullException : font');
        }
        var reversedLine = this.customLayout(line, rtl, format);
        var words = reversedLine.split('');
        return words;
    };
    return RtlRenderer;
}());
export { RtlRenderer };
