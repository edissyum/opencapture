/**
 * TrueTypeFont.ts class for EJ2-PDF
 */
import { ByteArray } from './../../graphics/images/index';
import { TtfReader } from './ttf-reader';
import { PdfDictionary, SaveDescendantFontEventHandler, SaveFontDictionaryEventHandler } from './../../primitives/pdf-dictionary';
import { SaveFontProgramEventHandler, SaveCmapEventHandler } from './../../primitives/pdf-stream';
import { PdfStream } from './../../primitives/pdf-stream';
import { PdfArray } from './../../primitives/pdf-array';
import { PdfName } from './../../primitives/pdf-name';
import { PdfNumber } from './../../primitives/pdf-number';
import { PdfString } from './../../primitives/pdf-string';
import { PdfReferenceHolder } from './../../primitives/pdf-reference';
import { PdfFontMetrics } from './pdf-font-metrics';
import { StandardWidthTable } from './pdf-font-metrics';
import { DictionaryProperties } from './../../input-output/pdf-dictionary-properties';
import { Dictionary } from './../../collections/dictionary';
import { FontDescriptorFlags } from './enum';
import { RectangleF } from './../../drawing/pdf-drawing';
import { Operators } from './../../input-output/pdf-operators';
var UnicodeTrueTypeFont = /** @class */ (function () {
    /* tslint:enable */
    //Constructors
    /**
     * Initializes a new instance of the `PdfTrueTypeFont` class.
     * @private
     */
    function UnicodeTrueTypeFont(base64String, size) {
        // Fields
        this.nameString = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        /**
         * Specifies the Internal variable to store fields of `PdfDictionaryProperties`.
         * @private
         */
        this.dictionaryProperties = new DictionaryProperties();
        /**
         * Indicates whether the font program is compressed or not.
         * @private
         */
        this.isCompress = false;
        /**
         * Indicates whether the font is embedded or not.
         */
        this.isEmbedFont = false;
        /**
         * Cmap table's start prefix.
         */
        /* tslint:disable */
        this.cmapPrefix = '/CIDInit /ProcSet findresource begin\n12 dict begin\nbegincmap' + Operators.newLine + '/CIDSystemInfo << /Registry (Adobe)/Ordering (UCS)/Supplement 0>> def\n/CMapName ' + '/Adobe-Identity-UCS def\n/CMapType 2 def\n1 begincodespacerange' + Operators.newLine;
        /* tslint:enable */
        /**
         * Cmap table's start suffix.
         */
        this.cmapEndCodespaceRange = 'endcodespacerange' + Operators.newLine;
        /**
         * Cmap's begin range marker.
         */
        this.cmapBeginRange = 'beginbfrange' + Operators.newLine;
        /**
         * Cmap's end range marker.
         */
        this.cmapEndRange = 'endbfrange' + Operators.newLine;
        /**
         * Cmap table's end
         */
        /* tslint:disable */
        this.cmapSuffix = 'endbfrange\nendcmap\nCMapName currentdict ' + '/CMap defineresource pop\nend end' + Operators.newLine;
        if (base64String === null || base64String === undefined) {
            throw new Error('ArgumentNullException:base64String');
        }
        this.fontSize = size;
        this.fontString = base64String;
        this.Initialize();
    }
    //Implementation
    /**
     * Returns width of the char symbol.
     */
    UnicodeTrueTypeFont.prototype.getCharWidth = function (charCode) {
        var codeWidth = this.ttfReader.getCharWidth(charCode);
        return codeWidth;
    };
    /**
     * Returns width of the text line.
     */
    UnicodeTrueTypeFont.prototype.getLineWidth = function (line) {
        // if (line == null) {
        //     throw new Error('ArgumentNullException : line');
        // }
        var width = 0;
        for (var i = 0, len = line.length; i < len; i++) {
            var ch = line[i];
            var charWidth = this.getCharWidth(ch);
            width += charWidth;
        }
        return width;
    };
    /**
     * Initializes a new instance of the `PdfTrueTypeFont` class.
     * @private
     */
    UnicodeTrueTypeFont.prototype.Initialize = function () {
        var byteArray = new ByteArray(this.fontString.length);
        byteArray.writeFromBase64String(this.fontString);
        this.fontData = byteArray.internalBuffer;
        this.ttfReader = new TtfReader(this.fontData);
        this.ttfMetrics = this.ttfReader.metrics;
    };
    UnicodeTrueTypeFont.prototype.createInternals = function () {
        this.fontDictionary = new PdfDictionary();
        this.fontProgram = new PdfStream();
        this.cmap = new PdfStream();
        this.descendantFont = new PdfDictionary();
        this.metrics = new PdfFontMetrics();
        this.ttfReader.createInternals();
        this.ttfMetrics = this.ttfReader.metrics;
        this.initializeMetrics();
        // Create all the dictionaries of the font.
        this.subsetName = this.getFontName();
        this.createDescendantFont();
        this.createCmap();
        this.createFontDictionary();
        this.createFontProgram();
    };
    UnicodeTrueTypeFont.prototype.getInternals = function () {
        return this.fontDictionary;
    };
    /**
     * Initializes metrics.
     */
    UnicodeTrueTypeFont.prototype.initializeMetrics = function () {
        var ttfMetrics = this.ttfReader.metrics;
        this.metrics.ascent = ttfMetrics.macAscent;
        this.metrics.descent = ttfMetrics.macDescent;
        this.metrics.height = ttfMetrics.macAscent - ttfMetrics.macDescent + ttfMetrics.lineGap;
        this.metrics.name = ttfMetrics.fontFamily;
        this.metrics.postScriptName = ttfMetrics.postScriptName;
        this.metrics.size = this.fontSize;
        this.metrics.widthTable = new StandardWidthTable(ttfMetrics.widthTable);
        this.metrics.lineGap = ttfMetrics.lineGap;
        this.metrics.subScriptSizeFactor = ttfMetrics.subScriptSizeFactor;
        this.metrics.superscriptSizeFactor = ttfMetrics.superscriptSizeFactor;
        this.metrics.isBold = ttfMetrics.isBold;
    };
    /**
     * Gets random string.
     */
    UnicodeTrueTypeFont.prototype.getFontName = function () {
        var builder = '';
        var name;
        // if (this.isEmbed === false) {
        for (var i = 0; i < 6; i++) {
            var index = Math.floor(Math.random() * (25 - 0 + 1)) + 0;
            builder += this.nameString[index];
        }
        builder += '+';
        // }
        builder += this.ttfReader.metrics.postScriptName;
        name = builder.toString();
        // if (name === '') {
        //     name = this.ttfReader.metrics.fontFamily;
        // }
        name = this.formatName(name);
        return name;
    };
    /**
     * Generates name of the font.
     */
    UnicodeTrueTypeFont.prototype.formatName = function (fontName) {
        // if (fontName === null) {
        //     throw new Error('ArgumentNullException : fontName');
        // }
        // if (fontName === '') {
        //     throw new Error('ArgumentOutOfRangeException : fontName, Parameter can not be empty');
        // }
        var ret = fontName.replace('(', '#28');
        ret = ret.replace(')', '#29');
        ret = ret.replace('[', '#5B');
        ret = ret.replace(']', '#5D');
        ret = ret.replace('<', '#3C');
        ret = ret.replace('>', '#3E');
        ret = ret.replace('{', '#7B');
        ret = ret.replace('}', '#7D');
        ret = ret.replace('/', '#2F');
        ret = ret.replace('%', '#25');
        return ret.replace(' ', '#20');
    };
    /**
     * Creates descendant font.
     */
    UnicodeTrueTypeFont.prototype.createDescendantFont = function () {
        // Set property used to clone Font every time
        this.descendantFont.isFont = true;
        this.descendantFont.descendantFontBeginSave = new SaveDescendantFontEventHandler(this);
        this.descendantFont.items.setValue(this.dictionaryProperties.type, new PdfName(this.dictionaryProperties.font));
        this.descendantFont.items.setValue(this.dictionaryProperties.subtype, new PdfName(this.dictionaryProperties.cIDFontType2));
        this.descendantFont.items.setValue(this.dictionaryProperties.baseFont, new PdfName(this.subsetName));
        this.descendantFont.items.setValue(this.dictionaryProperties.cIDToGIDMap, new PdfName(this.dictionaryProperties.identity));
        this.descendantFont.items.setValue(this.dictionaryProperties.dw, new PdfNumber(1000));
        this.fontDescriptor = this.createFontDescriptor();
        this.descendantFont.items.setValue(this.dictionaryProperties.fontDescriptor, new PdfReferenceHolder(this.fontDescriptor));
        var systemInfo = this.createSystemInfo();
        this.descendantFont.items.setValue(this.dictionaryProperties.cIDSystemInfo, systemInfo);
    };
    /**
     * Creates font descriptor.
     */
    UnicodeTrueTypeFont.prototype.createFontDescriptor = function () {
        var descriptor = new PdfDictionary();
        var metrics = this.ttfReader.metrics;
        // Set property used to clone Font every time
        descriptor.isFont = true;
        descriptor.items.setValue(this.dictionaryProperties.type, new PdfName(this.dictionaryProperties.fontDescriptor));
        descriptor.items.setValue(this.dictionaryProperties.fontName, new PdfName(this.subsetName));
        descriptor.items.setValue(this.dictionaryProperties.flags, new PdfNumber(this.getDescriptorFlags()));
        descriptor.items.setValue(this.dictionaryProperties.fontBBox, PdfArray.fromRectangle(this.getBoundBox()));
        descriptor.items.setValue(this.dictionaryProperties.missingWidth, new PdfNumber(metrics.widthTable[32]));
        descriptor.items.setValue(this.dictionaryProperties.stemV, new PdfNumber(metrics.stemV));
        descriptor.items.setValue(this.dictionaryProperties.italicAngle, new PdfNumber(metrics.italicAngle));
        descriptor.items.setValue(this.dictionaryProperties.capHeight, new PdfNumber(metrics.capHeight));
        descriptor.items.setValue(this.dictionaryProperties.ascent, new PdfNumber(metrics.winAscent));
        descriptor.items.setValue(this.dictionaryProperties.descent, new PdfNumber(metrics.winDescent));
        descriptor.items.setValue(this.dictionaryProperties.leading, new PdfNumber(metrics.leading));
        descriptor.items.setValue(this.dictionaryProperties.avgWidth, new PdfNumber(metrics.widthTable[32]));
        descriptor.items.setValue(this.dictionaryProperties.fontFile2, new PdfReferenceHolder(this.fontProgram));
        descriptor.items.setValue(this.dictionaryProperties.maxWidth, new PdfNumber(metrics.widthTable[32]));
        descriptor.items.setValue(this.dictionaryProperties.xHeight, new PdfNumber(0));
        descriptor.items.setValue(this.dictionaryProperties.stemH, new PdfNumber(0));
        return descriptor;
    };
    /**
     * Generates cmap.
     * @private
     */
    UnicodeTrueTypeFont.prototype.createCmap = function () {
        this.cmap.cmapBeginSave = new SaveCmapEventHandler(this);
    };
    /**
     * Generates font dictionary.
     */
    UnicodeTrueTypeFont.prototype.createFontDictionary = function () {
        // Set property used to clone Font every time
        this.fontDictionary.isFont = true;
        this.fontDictionary.fontDictionaryBeginSave = new SaveFontDictionaryEventHandler(this);
        this.fontDictionary.items.setValue(this.dictionaryProperties.type, new PdfName(this.dictionaryProperties.font));
        this.fontDictionary.items.setValue(this.dictionaryProperties.baseFont, new PdfName(this.subsetName));
        this.fontDictionary.items.setValue(this.dictionaryProperties.subtype, new PdfName(this.dictionaryProperties.type0));
        this.fontDictionary.items.setValue(this.dictionaryProperties.encoding, new PdfName(this.dictionaryProperties.identityH));
        var descFonts = new PdfArray();
        var reference = new PdfReferenceHolder(this.descendantFont);
        // Set property used to clone Font every time
        descFonts.isFont = true;
        descFonts.add(reference);
        this.fontDictionary.items.setValue(this.dictionaryProperties.descendantFonts, descFonts);
    };
    /**
     * Creates font program.
     */
    UnicodeTrueTypeFont.prototype.createFontProgram = function () {
        this.fontProgram.fontProgramBeginSave = new SaveFontProgramEventHandler(this);
    };
    /**
     * Creates system info dictionary for CID font.
     * @private
     */
    UnicodeTrueTypeFont.prototype.createSystemInfo = function () {
        var systemInfo = new PdfDictionary();
        systemInfo.items.setValue(this.dictionaryProperties.registry, new PdfString('Adobe'));
        systemInfo.items.setValue(this.dictionaryProperties.ordering, new PdfString(this.dictionaryProperties.identity));
        systemInfo.items.setValue(this.dictionaryProperties.supplement, new PdfNumber(0));
        return systemInfo;
    };
    /**
     * Runs before font Dictionary will be saved.
     */
    UnicodeTrueTypeFont.prototype.descendantFontBeginSave = function () {
        if (this.usedChars !== null && this.usedChars !== undefined && this.usedChars.size() > 0) {
            var width = this.getDescendantWidth();
            if (width !== null) {
                this.descendantFont.items.setValue(this.dictionaryProperties.w, width);
            }
        }
    };
    /**
     * Runs before font Dictionary will be saved.
     */
    UnicodeTrueTypeFont.prototype.cmapBeginSave = function () {
        this.generateCmap();
    };
    /**
     * Runs before font Dictionary will be saved.
     */
    /* tslint:disable */
    UnicodeTrueTypeFont.prototype.fontDictionaryBeginSave = function () {
        if (this.usedChars !== null && this.usedChars !== undefined && this.usedChars.size() > 0 && !this.fontDictionary.containsKey(this.dictionaryProperties.toUnicode)) {
            this.fontDictionary.items.setValue(this.dictionaryProperties.toUnicode, new PdfReferenceHolder(this.cmap));
        }
    };
    /* tslint:enable */
    /**
     * Runs before font program stream save.
     */
    UnicodeTrueTypeFont.prototype.fontProgramBeginSave = function () {
        this.isCompress = true;
        this.generateFontProgram();
    };
    /**
     * Gets width description pad array for c i d font.
     */
    UnicodeTrueTypeFont.prototype.getDescendantWidth = function () {
        var array = new PdfArray();
        if (this.usedChars !== null && this.usedChars !== undefined && this.usedChars.size() > 0) {
            var glyphInfo = [];
            // if (!this.isEmbedFont) {
            var keys = this.usedChars.keys();
            for (var i = 0; i < keys.length; i++) {
                var chLen = keys[i];
                var glyph = this.ttfReader.getGlyph(chLen);
                if (glyph.empty) {
                    continue;
                }
                glyphInfo.push(glyph);
            }
            // } else {
            //     glyphInfo = this.ttfReader.getAllGlyphs();
            // }
            glyphInfo.sort(function (a, b) { return a.index - b.index; });
            var firstGlyphIndex = 0;
            var lastGlyphIndex = 0;
            var firstGlyphIndexWasSet = false;
            var widthDetails = new PdfArray();
            // if (!this.isEmbedFont) {
            for (var i = 0; i < glyphInfo.length; i++) {
                var glyph = glyphInfo[i];
                if (!firstGlyphIndexWasSet) {
                    firstGlyphIndexWasSet = true;
                    firstGlyphIndex = glyph.index;
                    lastGlyphIndex = glyph.index - 1;
                }
                if ((lastGlyphIndex + 1 !== glyph.index || (i + 1 === glyphInfo.length)) && glyphInfo.length > 1) {
                    // Add glyph index / width.
                    array.add(new PdfNumber(firstGlyphIndex));
                    if (i !== 0) {
                        array.add(widthDetails);
                    }
                    firstGlyphIndex = glyph.index;
                    widthDetails = new PdfArray();
                }
                widthDetails.add(new PdfNumber(glyph.width));
                if (i + 1 === glyphInfo.length) {
                    array.add(new PdfNumber(firstGlyphIndex));
                    array.add(widthDetails);
                }
                lastGlyphIndex = glyph.index;
            }
            // } else {
            //     for (let i : number = 0; i < glyphInfo.length; i++) {
            //         let glyph : TtfGlyphInfo = glyphInfo[i];
            //         if (!firstGlyphIndexWasSet) {
            //             firstGlyphIndexWasSet = true;
            //             lastGlyphIndex = glyph.index - 1;
            //         }
            //         firstGlyphIndex = glyph.index;
            //         if ((lastGlyphIndex + 1 === glyph.index || (i + 1 === glyphInfo.length)) && glyphInfo.length > 1) {
            //             // Add glyph index / width.
            //             widthDetails.add(new PdfNumber(glyph.width));
            //             array.add(new PdfNumber(firstGlyphIndex));
            //             array.add(widthDetails);
            //             widthDetails = new PdfArray();
            //         }
            //         lastGlyphIndex = glyph.index;
            //     }
            // }
        }
        return array;
    };
    /**
     * Creates cmap.
     */
    UnicodeTrueTypeFont.prototype.generateCmap = function () {
        if (this.usedChars !== null && this.usedChars !== undefined && this.usedChars.size() > 0) {
            var glyphChars = this.ttfReader.getGlyphChars(this.usedChars);
            if (glyphChars.size() > 0) {
                var keys = glyphChars.keys().sort();
                // add first and last glyph indexes
                var first = keys[0];
                var last = keys[keys.length - 1];
                var middlePart = this.toHexString(first, false) + this.toHexString(last, false) + Operators.newLine;
                var builder = '';
                builder += this.cmapPrefix;
                builder += middlePart;
                builder += this.cmapEndCodespaceRange;
                var nextRange = 0;
                for (var i = 0; i < keys.length; i++) {
                    if (nextRange === 0) {
                        if (i !== 0) {
                            builder += this.cmapEndRange;
                        }
                        nextRange = Math.min(100, keys.length - i);
                        builder += nextRange;
                        builder += Operators.whiteSpace;
                        builder += this.cmapBeginRange;
                    }
                    nextRange -= 1;
                    var key = keys[i];
                    /* tslint:disable */
                    builder += this.toHexString(key, true) + this.toHexString(key, true) + this.toHexString(glyphChars.getValue(key), true) + '\n';
                    /* tslint:enable */
                }
                builder += this.cmapSuffix;
                this.cmap.clearStream();
                this.cmap.isFont = true;
                this.cmap.write(builder);
            }
        }
    };
    /**
     * Generates font program.
     */
    UnicodeTrueTypeFont.prototype.generateFontProgram = function () {
        var fontProgram = null;
        this.usedChars = (this.usedChars === null || this.usedChars === undefined) ? new Dictionary() : this.usedChars;
        this.ttfReader.setOffset(0);
        fontProgram = this.ttfReader.readFontProgram(this.usedChars);
        this.fontProgram.clearStream();
        this.fontProgram.isFont = true;
        this.fontProgram.writeBytes(fontProgram);
    };
    /**
     * Calculates flags for the font descriptor.
     * @private
     */
    UnicodeTrueTypeFont.prototype.getDescriptorFlags = function () {
        var flags = 0;
        var metrics = this.ttfReader.metrics;
        if (metrics.isFixedPitch) {
            flags |= FontDescriptorFlags.FixedPitch;
        }
        if (metrics.isSymbol) {
            flags |= FontDescriptorFlags.Symbolic;
        }
        else {
            flags |= FontDescriptorFlags.Nonsymbolic;
        }
        if (metrics.isItalic) {
            flags |= FontDescriptorFlags.Italic;
        }
        if (metrics.isBold) {
            flags |= FontDescriptorFlags.ForceBold;
        }
        return flags;
    };
    /**
     * Calculates BoundBox of the descriptor.
     * @private
     */
    UnicodeTrueTypeFont.prototype.getBoundBox = function () {
        var rect = this.ttfReader.metrics.fontBox;
        var width = Math.abs(rect.right - rect.left);
        var height = Math.abs(rect.top - rect.bottom);
        var rectangle = new RectangleF(rect.left, rect.bottom, width, height);
        return rectangle;
    };
    /**
     * Converts integer of decimal system to hex integer.
     */
    UnicodeTrueTypeFont.prototype.toHexString = function (n, isCaseChange) {
        var s = n.toString(16);
        if (isCaseChange) {
            s = s.toUpperCase();
        }
        return '<0000'.substring(0, 5 - s.length) + s + '>';
    };
    /**
     * Stores used symbols.
     */
    UnicodeTrueTypeFont.prototype.setSymbols = function (text) {
        if (text === null) {
            throw new Error('Argument Null Exception : text');
        }
        if (this.usedChars === null || this.usedChars === undefined) {
            this.usedChars = new Dictionary();
        }
        for (var i = 0; i < text.length; i++) {
            var ch = text[i];
            this.usedChars.setValue(ch, String.fromCharCode(0));
        }
        // else {
        //     if (text === null) {
        //         throw new Error('Argument Null Exception : glyphs');
        //     }
        //     if (this.usedChars === null || this.usedChars === undefined) {
        //             this.usedChars = new Dictionary<string, string>();
        //     }
        //     for (let i : number = 0; i < text.length; i++) {
        //         let glyphIndex : number = text[i];
        //         let glyph : TtfGlyphInfo =  this.ttfReader.getGlyph(glyphIndex);
        //         if (!glyph == null) {
        //             let c : string = glyph.charCode.toLocaleString();
        //             this.usedChars.setValue(c, String.fromCharCode(0));
        //         }
        //     }
        // }
        if (this.isEmbedFont === false) {
            this.getDescendantWidth();
        }
    };
    return UnicodeTrueTypeFont;
}());
export { UnicodeTrueTypeFont };
