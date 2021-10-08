/**
 * dictionaryProperties.ts class for EJ2-PDF
 * PDF dictionary properties.
 * @private
 */
var DictionaryProperties = /** @class */ (function () {
    /**
     * Initialize an instance for `PdfDictionaryProperties` class.
     * @private
     */
    function DictionaryProperties() {
        /**
         * Specifies the value of `Pages`.
         * @private
         */
        this.pages = 'Pages';
        /**
         * Specifies the value of `Kids`.
         * @private
         */
        this.kids = 'Kids';
        /**
         * Specifies the value of `Count`.
         * @private
         */
        this.count = 'Count';
        /**
         * Specifies the value of `Resources`.
         * @private
         */
        this.resources = 'Resources';
        /**
         * Specifies the value of `Type`.
         * @private
         */
        this.type = 'Type';
        /**
         * Specifies the value of `Size`.
         * @private
         */
        this.size = 'Size';
        /**
         * Specifies the value of `MediaBox`.
         * @private
         */
        this.mediaBox = 'MediaBox';
        /**
         * Specifies the value of `Parent`.
         * @private
         */
        this.parent = 'Parent';
        /**
         * Specifies the value of `Root`.
         * @private
         */
        this.root = 'Root';
        /**
         * Specifies the value of `DecodeParms`.
         * @private
         */
        this.decodeParms = 'DecodeParms';
        /**
         * Specifies the value of `Filter`.
         * @private
         */
        this.filter = 'Filter';
        /**
         * Specifies the value of `Font`.
         * @private
         */
        this.font = 'Font';
        /**
         * Specifies the value of `Type1`.
         * @private
         */
        this.type1 = 'Type1';
        /**
         * Specifies the value of `BaseFont`.
         * @private
         */
        this.baseFont = 'BaseFont';
        /**
         * Specifies the value of `Encoding`.
         * @private
         */
        this.encoding = 'Encoding';
        /**
         * Specifies the value of `Subtype`.
         * @private
         */
        this.subtype = 'Subtype';
        /**
         * Specifies the value of `Contents`.
         * @private
         */
        this.contents = 'Contents';
        /**
         * Specifies the value of `ProcSet`.
         * @private
         */
        this.procset = 'ProcSet';
        /**
         * Specifies the value of `ColorSpace`.
         * @private
         */
        this.colorSpace = 'ColorSpace';
        /**
         * Specifies the value of `ExtGState`.
         * @private
         */
        this.extGState = 'ExtGState';
        /**
         * Specifies the value of `Pattern`.
         * @private
         */
        this.pattern = 'Pattern';
        /**
         * Specifies the value of `XObject`.
         * @private
         */
        this.xObject = 'XObject';
        /**
         * Specifies the value of `Length`.
         * @private
         */
        this.length = 'Length';
        /**
         * Specifies the value of `Width`.
         * @private
         */
        this.width = 'Width';
        /**
         * Specifies the value of `Height`.
         * @private
         */
        this.height = 'Height';
        /**
         * Specifies the value of `BitsPerComponent`.
         * @private
         */
        this.bitsPerComponent = 'BitsPerComponent';
        /**
         * Specifies the value of `Image`.
         * @private
         */
        this.image = 'Image';
        /**
         * Specifies the value of `dctdecode`.
         * @private
         */
        this.dctdecode = 'DCTDecode';
        /**
         * Specifies the value of `Columns`.
         * @private
         */
        this.columns = 'Columns';
        /**
         * Specifies the value of `BlackIs1`.
         * @private
         */
        this.blackIs1 = 'BlackIs1';
        /**
         * Specifies the value of `K`.
         * @private
         */
        this.k = 'K';
        /**
         * Specifies the value of `S`.
         * @private
         */
        this.s = 'S';
        /**
         * Specifies the value of `Predictor`.
         * @private
         */
        this.predictor = 'Predictor';
        /**
         * Specifies the value of `DeviceRGB`.
         * @private
         */
        this.deviceRgb = 'DeviceRGB';
        /**
         * Specifies the value of `Next`.
         * @private
         */
        this.next = 'Next';
        /**
         * Specifies the value of `Action`.
         * @private
         */
        this.action = 'Action';
        /**
         * Specifies the value of `Link`.
         * @private
         */
        this.link = 'Link';
        /**
         *
         * Specifies the value of `A`.
         * @private
         */
        this.a = 'A';
        /**
         * Specifies the value of `Annot`.
         * @private
         */
        this.annot = 'Annot';
        /**
         * Specifies the value of `P`.
         * @private
         */
        this.p = 'P';
        /**
         * Specifies the value of `C`.
         * @private
         */
        this.c = 'C';
        /**
         * Specifies the value of `Rect`.
         * @private
         */
        this.rect = 'Rect';
        /**
         * Specifies the value of `URI`.
         * @private
         */
        this.uri = 'URI';
        /**
         * Specifies the value of `Annots`.
         * @private
         */
        this.annots = 'Annots';
        /**
         * Specifies the value of `ca`.
         * @private
         */
        this.ca = 'ca';
        /**
         * Specifies the value of `CA`.
         * @private
         */
        this.CA = 'CA';
        /**
         * Specifies the value of `XYZ`.
         * @private
         */
        this.xyz = 'XYZ';
        /**
         * Specifies the value of `Fit`.
         * @private
         */
        this.fit = 'Fit';
        /**
         * Specifies the value of `Dest`.
         * @private
         */
        this.dest = 'Dest';
        /**
         * Specifies the value of `BM`.
         * @private
         */
        this.BM = 'BM';
        /**
         * Specifies the value of `flatedecode`.
         * @private
         */
        this.flatedecode = 'FlateDecode';
        /**
         * Specifies the value of `Rotate`.
         * @private
         */
        this.rotate = 'Rotate';
        /**
         * Specifies the value of 'bBox'.
         * @private
         */
        this.bBox = 'BBox';
        /**
         * Specifies the value of 'form'.
         * @private
         */
        this.form = 'Form';
        /**
         * Specifies the value of 'w'.
         * @private
         */
        this.w = 'W';
        /**
         * Specifies the value of 'cIDFontType2'.
         * @private
         */
        this.cIDFontType2 = 'CIDFontType2';
        /**
         * Specifies the value of 'cIDToGIDMap'.
         * @private
         */
        this.cIDToGIDMap = 'CIDToGIDMap';
        /**
         * Specifies the value of 'identity'.
         * @private
         */
        this.identity = 'Identity';
        /**
         * Specifies the value of 'dw'.
         * @private
         */
        this.dw = 'DW';
        /**
         * Specifies the value of 'fontDescriptor'.
         * @private
         */
        this.fontDescriptor = 'FontDescriptor';
        /**
         * Specifies the value of 'cIDSystemInfo'.
         * @private
         */
        this.cIDSystemInfo = 'CIDSystemInfo';
        /**
         * Specifies the value of 'fontName'.
         * @private
         */
        this.fontName = 'FontName';
        /**
         * Specifies the value of 'flags'.
         * @private
         */
        this.flags = 'Flags';
        /**
         * Specifies the value of 'fontBBox'.
         * @private
         */
        this.fontBBox = 'FontBBox';
        /**
         * Specifies the value of 'missingWidth'.
         * @private
         */
        this.missingWidth = 'MissingWidth';
        /**
         * Specifies the value of 'stemV'.
         * @private
         */
        this.stemV = 'StemV';
        /**
         * Specifies the value of 'italicAngle'.
         * @private
         */
        this.italicAngle = 'ItalicAngle';
        /**
         * Specifies the value of 'capHeight'.
         * @private
         */
        this.capHeight = 'CapHeight';
        /**
         * Specifies the value of 'ascent'.
         * @private
         */
        this.ascent = 'Ascent';
        /**
         * Specifies the value of 'descent'.
         * @private
         */
        this.descent = 'Descent';
        /**
         * Specifies the value of 'leading'.
         * @private
         */
        this.leading = 'Leading';
        /**
         * Specifies the value of 'avgWidth'.
         * @private
         */
        this.avgWidth = 'AvgWidth';
        /**
         * Specifies the value of 'fontFile2'.
         * @private
         */
        this.fontFile2 = 'FontFile2';
        /**
         * Specifies the value of 'maxWidth'.
         * @private
         */
        this.maxWidth = 'MaxWidth';
        /**
         * Specifies the value of 'xHeight'.
         * @private
         */
        this.xHeight = 'XHeight';
        /**
         * Specifies the value of 'stemH'.
         * @private
         */
        this.stemH = 'StemH';
        /**
         * Specifies the value of 'registry'.
         * @private
         */
        this.registry = 'Registry';
        /**
         * Specifies the value of 'ordering'.
         * @private
         */
        this.ordering = 'Ordering';
        /**
         * Specifies the value of 'supplement'.
         * @private
         */
        this.supplement = 'Supplement';
        /**
         * Specifies the value of 'type0'.
         * @private
         */
        this.type0 = 'Type0';
        /**
         * Specifies the value of 'identityH'.
         * @private
         */
        this.identityH = 'Identity-H';
        /**
         * Specifies the value of 'toUnicode'.
         * @private
         */
        this.toUnicode = 'ToUnicode';
        /**
         * Specifies the value of 'descendantFonts'.
         * @private
         */
        this.descendantFonts = 'DescendantFonts';
        /**
         * Specifies the value of 'background'.
         * @private
         */
        this.background = 'Background';
        /**
         * Specifies the value of 'shading'.
         * @private
         */
        this.shading = 'Shading';
        /**
         * Specifies the value of 'matrix'.
         * @private
         */
        this.matrix = 'Matrix';
        /**
         * Specifies the value of 'antiAlias'.
         * @private
         */
        this.antiAlias = 'AntiAlias';
        /**
         * Specifies the value of 'function'.
         * @private
         */
        this.function = 'Function';
        /**
         * Specifies the value of 'extend'.
         * @private
         */
        this.extend = 'Extend';
        /**
         * Specifies the value of 'shadingType'.
         * @private
         */
        this.shadingType = 'ShadingType';
        /**
         * Specifies the value of 'coords'.
         * @private
         */
        this.coords = 'Coords';
        /**
         * Specifies the value of 'domain'.
         * @private
         */
        this.domain = 'Domain';
        /**
         * Specifies the value of 'range'.
         * @private
         */
        this.range = 'Range';
        /**
         * Specifies the value of 'functionType'.
         * @private
         */
        this.functionType = 'FunctionType';
        /**
         * Specifies the value of 'bitsPerSample'.
         * @private
         */
        this.bitsPerSample = 'BitsPerSample';
        /**
         * Specifies the value of 'patternType'.
         * @private
         */
        this.patternType = 'PatternType';
        /**
         * Specifies the value of 'paintType'.
         * @private
         */
        this.paintType = 'PaintType';
        /**
         * Specifies the value of 'tilingType'.
         * @private
         */
        this.tilingType = 'TilingType';
        /**
         * Specifies the value of 'xStep'.
         * @private
         */
        this.xStep = 'XStep';
        /**
         * Specifies the value of 'yStep'.
         * @private
         */
        this.yStep = 'YStep';
        //
    }
    return DictionaryProperties;
}());
export { DictionaryProperties };
