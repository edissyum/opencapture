/**
 * public Enum for `PdfFontStyle`.
 * @private
 */
export var PdfFontStyle;
(function (PdfFontStyle) {
    /**
     * Specifies the type of `Regular`.
     * @private
     */
    PdfFontStyle[PdfFontStyle["Regular"] = 0] = "Regular";
    /**
     * Specifies the type of `Bold`.
     * @private
     */
    PdfFontStyle[PdfFontStyle["Bold"] = 1] = "Bold";
    /**
     * Specifies the type of `Italic`.
     * @private
     */
    PdfFontStyle[PdfFontStyle["Italic"] = 2] = "Italic";
    /**
     * Specifies the type of `Underline`.
     * @private
     */
    PdfFontStyle[PdfFontStyle["Underline"] = 4] = "Underline";
    /**
     * Specifies the type of `Strikeout`.
     * @private
     */
    PdfFontStyle[PdfFontStyle["Strikeout"] = 8] = "Strikeout";
})(PdfFontStyle || (PdfFontStyle = {}));
/**
 * Specifies the font family from the standard font.
 * ```typescript
 * // create a new PDF document
 * let document : PdfDocument = new PdfDocument();
 * // add a new page to the document
 * let page1 : PdfPage = document.pages.add();
 * // create new standard font
 * let font : PdfStandardFont = new PdfStandardFont(PdfFontFamily.Helvetica, 20);
 * // create black brush
 * let blackBrush : PdfSolidBrush = new PdfSolidBrush(new PdfColor(0, 0, 0));
 * // draw the text
 * page1.graphics.drawString('Hello World', font, blackBrush, new PointF(0, 0));
 * // save the document
 * document.save('output.pdf');
 * ```
 */
export var PdfFontFamily;
(function (PdfFontFamily) {
    /**
     * Specifies the `Helvetica` font.
     */
    PdfFontFamily[PdfFontFamily["Helvetica"] = 0] = "Helvetica";
    /**
     * Specifies the `Courier` font.
     */
    PdfFontFamily[PdfFontFamily["Courier"] = 1] = "Courier";
    /**
     * Specifies the `TimesRoman` font.
     */
    PdfFontFamily[PdfFontFamily["TimesRoman"] = 2] = "TimesRoman";
    /**
     * Specifies the `Symbol` font.
     */
    PdfFontFamily[PdfFontFamily["Symbol"] = 3] = "Symbol";
    /**
     * Specifies the `ZapfDingbats` font.
     */
    PdfFontFamily[PdfFontFamily["ZapfDingbats"] = 4] = "ZapfDingbats";
})(PdfFontFamily || (PdfFontFamily = {}));
/**
 * public Enum for `PdfFontType`.
 * @private
 */
export var PdfFontType;
(function (PdfFontType) {
    /**
     * Specifies the type of `Standard`.
     * @private
     */
    PdfFontType[PdfFontType["Standard"] = 0] = "Standard";
    /**
     * Specifies the type of `TrueType`.
     * @private
     */
    PdfFontType[PdfFontType["TrueType"] = 1] = "TrueType";
    /**
     * Specifies the type of `TrueTypeEmbedded`.
     * @private
     */
    PdfFontType[PdfFontType["TrueTypeEmbedded"] = 2] = "TrueTypeEmbedded";
})(PdfFontType || (PdfFontType = {}));
/**
 * public Enum for `PdfWordWrapType`.
 * @private
 */
export var PdfWordWrapType;
(function (PdfWordWrapType) {
    /**
     * Specifies the type of `None`.
     * @private
     */
    PdfWordWrapType[PdfWordWrapType["None"] = 0] = "None";
    /**
     * Specifies the type of `Word`.
     * @private
     */
    PdfWordWrapType[PdfWordWrapType["Word"] = 1] = "Word";
    /**
     * Specifies the type of `WordOnly`.
     * @private
     */
    PdfWordWrapType[PdfWordWrapType["WordOnly"] = 2] = "WordOnly";
    /**
     * Specifies the type of `Character`.
     * @private
     */
    PdfWordWrapType[PdfWordWrapType["Character"] = 3] = "Character";
})(PdfWordWrapType || (PdfWordWrapType = {}));
/**
 * public Enum for `PdfSubSuperScript`.
 * @private
 */
export var PdfSubSuperScript;
(function (PdfSubSuperScript) {
    /**
     * Specifies the type of `None`.
     * @private
     */
    PdfSubSuperScript[PdfSubSuperScript["None"] = 0] = "None";
    /**
     * Specifies the type of `SuperScript`.
     * @private
     */
    PdfSubSuperScript[PdfSubSuperScript["SuperScript"] = 1] = "SuperScript";
    /**
     * Specifies the type of `SubScript`.
     * @private
     */
    PdfSubSuperScript[PdfSubSuperScript["SubScript"] = 2] = "SubScript";
})(PdfSubSuperScript || (PdfSubSuperScript = {}));
/**
 * public Enum for `FontEncoding`.
 * @private
 */
export var FontEncoding;
(function (FontEncoding) {
    /**
     * Specifies the type of `Unknown`.
     * @private
     */
    FontEncoding[FontEncoding["Unknown"] = 0] = "Unknown";
    /**
     * Specifies the type of `StandardEncoding`.
     * @private
     */
    FontEncoding[FontEncoding["StandardEncoding"] = 1] = "StandardEncoding";
    /**
     * Specifies the type of `MacRomanEncoding`.
     * @private
     */
    FontEncoding[FontEncoding["MacRomanEncoding"] = 2] = "MacRomanEncoding";
    /**
     * Specifies the type of `MacExpertEncoding`.
     * @private
     */
    FontEncoding[FontEncoding["MacExpertEncoding"] = 3] = "MacExpertEncoding";
    /**
     * Specifies the type of `WinAnsiEncoding`.
     * @private
     */
    FontEncoding[FontEncoding["WinAnsiEncoding"] = 4] = "WinAnsiEncoding";
    /**
     * Specifies the type of `PdfDocEncoding`.
     * @private
     */
    FontEncoding[FontEncoding["PdfDocEncoding"] = 5] = "PdfDocEncoding";
    /**
     * Specifies the type of `IdentityH`.
     * @private
     */
    FontEncoding[FontEncoding["IdentityH"] = 6] = "IdentityH";
})(FontEncoding || (FontEncoding = {}));
/**
 * public Enum for `TtfCmapFormat`.
 * @private
 */
export var TtfCmapFormat;
(function (TtfCmapFormat) {
    /**
     * This is the Apple standard character to glyph index mapping table.
     * @private
     */
    TtfCmapFormat[TtfCmapFormat["Apple"] = 0] = "Apple";
    /**
     * This is the Microsoft standard character to glyph index mapping table.
     * @private
     */
    TtfCmapFormat[TtfCmapFormat["Microsoft"] = 4] = "Microsoft";
    /**
     * Format 6: Trimmed table mapping.
     * @private
     */
    TtfCmapFormat[TtfCmapFormat["Trimmed"] = 6] = "Trimmed";
})(TtfCmapFormat || (TtfCmapFormat = {}));
/**
 * Enumerator that implements CMAP encodings.
 * @private
 */
export var TtfCmapEncoding;
(function (TtfCmapEncoding) {
    /**
     * Unknown encoding.
     * @private
     */
    TtfCmapEncoding[TtfCmapEncoding["Unknown"] = 0] = "Unknown";
    /**
     * When building a symbol font for Windows.
     * @private
     */
    TtfCmapEncoding[TtfCmapEncoding["Symbol"] = 1] = "Symbol";
    /**
     * When building a Unicode font for Windows.
     * @private
     */
    TtfCmapEncoding[TtfCmapEncoding["Unicode"] = 2] = "Unicode";
    /**
     * For font that will be used on a Macintosh.
     * @private
     */
    TtfCmapEncoding[TtfCmapEncoding["Macintosh"] = 3] = "Macintosh";
})(TtfCmapEncoding || (TtfCmapEncoding = {}));
/**
 * Ttf platform ID.
 * @private
 */
export var TtfPlatformID;
(function (TtfPlatformID) {
    /**
     * Apple platform.
     * @private
     */
    TtfPlatformID[TtfPlatformID["AppleUnicode"] = 0] = "AppleUnicode";
    /**
     * Macintosh platform.
     * @private
     */
    TtfPlatformID[TtfPlatformID["Macintosh"] = 1] = "Macintosh";
    /**
     * Iso platform.
     * @private
     */
    TtfPlatformID[TtfPlatformID["Iso"] = 2] = "Iso";
    /**
     * Microsoft platform.
     * @private
     */
    TtfPlatformID[TtfPlatformID["Microsoft"] = 3] = "Microsoft";
})(TtfPlatformID || (TtfPlatformID = {}));
/**
 * Microsoft encoding ID.
 * @private
 */
export var TtfMicrosoftEncodingID;
(function (TtfMicrosoftEncodingID) {
    /**
     * Undefined encoding.
     * @private
     */
    TtfMicrosoftEncodingID[TtfMicrosoftEncodingID["Undefined"] = 0] = "Undefined";
    /**
     * Unicode encoding.
     * @private
     */
    TtfMicrosoftEncodingID[TtfMicrosoftEncodingID["Unicode"] = 1] = "Unicode";
})(TtfMicrosoftEncodingID || (TtfMicrosoftEncodingID = {}));
/**
 * Macintosh encoding ID.
 * @private
 */
export var TtfMacintoshEncodingID;
(function (TtfMacintoshEncodingID) {
    /**
     * Roman encoding.
     * @private
     */
    TtfMacintoshEncodingID[TtfMacintoshEncodingID["Roman"] = 0] = "Roman";
    /**
     * Japanese encoding.
     * @private
     */
    TtfMacintoshEncodingID[TtfMacintoshEncodingID["Japanese"] = 1] = "Japanese";
    /**
     * Chinese encoding.
     * @private
     */
    TtfMacintoshEncodingID[TtfMacintoshEncodingID["Chinese"] = 2] = "Chinese";
})(TtfMacintoshEncodingID || (TtfMacintoshEncodingID = {}));
/**
 * Enumerator that implements font descriptor flags.
 * @private
 */
export var FontDescriptorFlags;
(function (FontDescriptorFlags) {
    /**
     * All glyphs have the same width (as opposed to proportional or variable-pitch fonts, which have different widths).
     * @private
     */
    FontDescriptorFlags[FontDescriptorFlags["FixedPitch"] = 1] = "FixedPitch";
    /**
     * Glyphs have serifs, which are short strokes drawn at an angle on the top and
     * bottom of glyph stems (as opposed to sans serif fonts, which do not).
     * @private
     */
    FontDescriptorFlags[FontDescriptorFlags["Serif"] = 2] = "Serif";
    /**
     * Font contains glyphs outside the Adobe standard Latin character set. The
     * flag and the nonsymbolic flag cannot both be set or both be clear.
     * @private
     */
    FontDescriptorFlags[FontDescriptorFlags["Symbolic"] = 4] = "Symbolic";
    /**
     * Glyphs resemble cursive handwriting.
     * @private
     */
    FontDescriptorFlags[FontDescriptorFlags["Script"] = 8] = "Script";
    /**
     * Font uses the Adobe standard Latin character set or a subset of it.
     * @private
     */
    FontDescriptorFlags[FontDescriptorFlags["Nonsymbolic"] = 32] = "Nonsymbolic";
    /**
     * Glyphs have dominant vertical strokes that are slanted.
     * @private
     */
    FontDescriptorFlags[FontDescriptorFlags["Italic"] = 64] = "Italic";
    /**
     * Bold font.
     * @private
     */
    FontDescriptorFlags[FontDescriptorFlags["ForceBold"] = 262144] = "ForceBold";
})(FontDescriptorFlags || (FontDescriptorFlags = {}));
/**
 * true type font composite glyph flags.
 * @private
 */
export var TtfCompositeGlyphFlags;
(function (TtfCompositeGlyphFlags) {
    /**
     * The Arg1And2AreWords.
     * @private
     */
    TtfCompositeGlyphFlags[TtfCompositeGlyphFlags["Arg1And2AreWords"] = 1] = "Arg1And2AreWords";
    /**
     * The ArgsAreXyValues.
     * @private
     */
    TtfCompositeGlyphFlags[TtfCompositeGlyphFlags["ArgsAreXyValues"] = 2] = "ArgsAreXyValues";
    /**
     * The RoundXyToGrid.
     * @private
     */
    TtfCompositeGlyphFlags[TtfCompositeGlyphFlags["RoundXyToGrid"] = 4] = "RoundXyToGrid";
    /**
     * The WeHaveScale.
     * @private
     */
    TtfCompositeGlyphFlags[TtfCompositeGlyphFlags["WeHaveScale"] = 8] = "WeHaveScale";
    /**
     * The Reserved.
     * @private
     */
    TtfCompositeGlyphFlags[TtfCompositeGlyphFlags["Reserved"] = 16] = "Reserved";
    /**
     * The MoreComponents.
     * @private
     */
    TtfCompositeGlyphFlags[TtfCompositeGlyphFlags["MoreComponents"] = 32] = "MoreComponents";
    /**
     * The WeHaveAnXyScale.
     * @private
     */
    TtfCompositeGlyphFlags[TtfCompositeGlyphFlags["WeHaveAnXyScale"] = 64] = "WeHaveAnXyScale";
    /**
     * The WeHaveTwoByTwo
     */
    TtfCompositeGlyphFlags[TtfCompositeGlyphFlags["WeHaveTwoByTwo"] = 128] = "WeHaveTwoByTwo";
    /**
     * The WeHaveInstructions.
     */
    TtfCompositeGlyphFlags[TtfCompositeGlyphFlags["WeHaveInstructions"] = 256] = "WeHaveInstructions";
    /**
     * The UseMyMetrics.
     */
    TtfCompositeGlyphFlags[TtfCompositeGlyphFlags["UseMyMetrics"] = 512] = "UseMyMetrics";
})(TtfCompositeGlyphFlags || (TtfCompositeGlyphFlags = {}));
