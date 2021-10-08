/**
 * public Enum for `PdfFontStyle`.
 * @private
 */
export declare enum PdfFontStyle {
    /**
     * Specifies the type of `Regular`.
     * @private
     */
    Regular = 0,
    /**
     * Specifies the type of `Bold`.
     * @private
     */
    Bold = 1,
    /**
     * Specifies the type of `Italic`.
     * @private
     */
    Italic = 2,
    /**
     * Specifies the type of `Underline`.
     * @private
     */
    Underline = 4,
    /**
     * Specifies the type of `Strikeout`.
     * @private
     */
    Strikeout = 8
}
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
export declare enum PdfFontFamily {
    /**
     * Specifies the `Helvetica` font.
     */
    Helvetica = 0,
    /**
     * Specifies the `Courier` font.
     */
    Courier = 1,
    /**
     * Specifies the `TimesRoman` font.
     */
    TimesRoman = 2,
    /**
     * Specifies the `Symbol` font.
     */
    Symbol = 3,
    /**
     * Specifies the `ZapfDingbats` font.
     */
    ZapfDingbats = 4
}
/**
 * public Enum for `PdfFontType`.
 * @private
 */
export declare enum PdfFontType {
    /**
     * Specifies the type of `Standard`.
     * @private
     */
    Standard = 0,
    /**
     * Specifies the type of `TrueType`.
     * @private
     */
    TrueType = 1,
    /**
     * Specifies the type of `TrueTypeEmbedded`.
     * @private
     */
    TrueTypeEmbedded = 2
}
/**
 * public Enum for `PdfWordWrapType`.
 * @private
 */
export declare enum PdfWordWrapType {
    /**
     * Specifies the type of `None`.
     * @private
     */
    None = 0,
    /**
     * Specifies the type of `Word`.
     * @private
     */
    Word = 1,
    /**
     * Specifies the type of `WordOnly`.
     * @private
     */
    WordOnly = 2,
    /**
     * Specifies the type of `Character`.
     * @private
     */
    Character = 3
}
/**
 * public Enum for `PdfSubSuperScript`.
 * @private
 */
export declare enum PdfSubSuperScript {
    /**
     * Specifies the type of `None`.
     * @private
     */
    None = 0,
    /**
     * Specifies the type of `SuperScript`.
     * @private
     */
    SuperScript = 1,
    /**
     * Specifies the type of `SubScript`.
     * @private
     */
    SubScript = 2
}
/**
 * public Enum for `FontEncoding`.
 * @private
 */
export declare enum FontEncoding {
    /**
     * Specifies the type of `Unknown`.
     * @private
     */
    Unknown = 0,
    /**
     * Specifies the type of `StandardEncoding`.
     * @private
     */
    StandardEncoding = 1,
    /**
     * Specifies the type of `MacRomanEncoding`.
     * @private
     */
    MacRomanEncoding = 2,
    /**
     * Specifies the type of `MacExpertEncoding`.
     * @private
     */
    MacExpertEncoding = 3,
    /**
     * Specifies the type of `WinAnsiEncoding`.
     * @private
     */
    WinAnsiEncoding = 4,
    /**
     * Specifies the type of `PdfDocEncoding`.
     * @private
     */
    PdfDocEncoding = 5,
    /**
     * Specifies the type of `IdentityH`.
     * @private
     */
    IdentityH = 6
}
/**
 * public Enum for `TtfCmapFormat`.
 * @private
 */
export declare enum TtfCmapFormat {
    /**
     * This is the Apple standard character to glyph index mapping table.
     * @private
     */
    Apple = 0,
    /**
     * This is the Microsoft standard character to glyph index mapping table.
     * @private
     */
    Microsoft = 4,
    /**
     * Format 6: Trimmed table mapping.
     * @private
     */
    Trimmed = 6
}
/**
 * Enumerator that implements CMAP encodings.
 * @private
 */
export declare enum TtfCmapEncoding {
    /**
     * Unknown encoding.
     * @private
     */
    Unknown = 0,
    /**
     * When building a symbol font for Windows.
     * @private
     */
    Symbol = 1,
    /**
     * When building a Unicode font for Windows.
     * @private
     */
    Unicode = 2,
    /**
     * For font that will be used on a Macintosh.
     * @private
     */
    Macintosh = 3
}
/**
 * Ttf platform ID.
 * @private
 */
export declare enum TtfPlatformID {
    /**
     * Apple platform.
     * @private
     */
    AppleUnicode = 0,
    /**
     * Macintosh platform.
     * @private
     */
    Macintosh = 1,
    /**
     * Iso platform.
     * @private
     */
    Iso = 2,
    /**
     * Microsoft platform.
     * @private
     */
    Microsoft = 3
}
/**
 * Microsoft encoding ID.
 * @private
 */
export declare enum TtfMicrosoftEncodingID {
    /**
     * Undefined encoding.
     * @private
     */
    Undefined = 0,
    /**
     * Unicode encoding.
     * @private
     */
    Unicode = 1
}
/**
 * Macintosh encoding ID.
 * @private
 */
export declare enum TtfMacintoshEncodingID {
    /**
     * Roman encoding.
     * @private
     */
    Roman = 0,
    /**
     * Japanese encoding.
     * @private
     */
    Japanese = 1,
    /**
     * Chinese encoding.
     * @private
     */
    Chinese = 2
}
/**
 * Enumerator that implements font descriptor flags.
 * @private
 */
export declare enum FontDescriptorFlags {
    /**
     * All glyphs have the same width (as opposed to proportional or variable-pitch fonts, which have different widths).
     * @private
     */
    FixedPitch = 1,
    /**
     * Glyphs have serifs, which are short strokes drawn at an angle on the top and
     * bottom of glyph stems (as opposed to sans serif fonts, which do not).
     * @private
     */
    Serif = 2,
    /**
     * Font contains glyphs outside the Adobe standard Latin character set. The
     * flag and the nonsymbolic flag cannot both be set or both be clear.
     * @private
     */
    Symbolic = 4,
    /**
     * Glyphs resemble cursive handwriting.
     * @private
     */
    Script = 8,
    /**
     * Font uses the Adobe standard Latin character set or a subset of it.
     * @private
     */
    Nonsymbolic = 32,
    /**
     * Glyphs have dominant vertical strokes that are slanted.
     * @private
     */
    Italic = 64,
    /**
     * Bold font.
     * @private
     */
    ForceBold = 262144
}
/**
 * true type font composite glyph flags.
 * @private
 */
export declare enum TtfCompositeGlyphFlags {
    /**
     * The Arg1And2AreWords.
     * @private
     */
    Arg1And2AreWords = 1,
    /**
     * The ArgsAreXyValues.
     * @private
     */
    ArgsAreXyValues = 2,
    /**
     * The RoundXyToGrid.
     * @private
     */
    RoundXyToGrid = 4,
    /**
     * The WeHaveScale.
     * @private
     */
    WeHaveScale = 8,
    /**
     * The Reserved.
     * @private
     */
    Reserved = 16,
    /**
     * The MoreComponents.
     * @private
     */
    MoreComponents = 32,
    /**
     * The WeHaveAnXyScale.
     * @private
     */
    WeHaveAnXyScale = 64,
    /**
     * The WeHaveTwoByTwo
     */
    WeHaveTwoByTwo = 128,
    /**
     * The WeHaveInstructions.
     */
    WeHaveInstructions = 256,
    /**
     * The UseMyMetrics.
     */
    UseMyMetrics = 512
}
