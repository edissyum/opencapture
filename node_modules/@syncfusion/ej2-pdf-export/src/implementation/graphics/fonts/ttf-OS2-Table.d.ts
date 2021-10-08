/**
 * TtfOS2Table.ts class for EJ2-PDF
 * The OS/2 table consists of a set of metrics that are required by Windows and OS/2.
 */
export declare class TtfOS2Table {
    /**
     * Structure field.
     */
    version: number;
    /**
     * The Average Character Width parameter specifies
     * the arithmetic average of the escapement (width)
     * of all of the 26 lowercase letters a through z of the Latin alphabet
     * and the space character. If any of the 26 lowercase letters are not present,
     * this parameter should equal the weighted average of all glyphs in the font.
     * For non - U G L (platform 3, encoding 0) fonts, use the unweighted average.
     */
    xAvgCharWidth: number;
    /**
     * Indicates the visual weight (degree of blackness or thickness of strokes)
     * of the characters in the font.
     */
    usWeightClass: number;
    /**
     * Indicates a relative change from the normal aspect ratio (width to height ratio)
     * as specified by a font designer for the glyphs in a font.
     */
    usWidthClass: number;
    /**
     * Indicates font embedding licensing rights for the font.
     * Embeddable fonts may be stored in a document.
     * When a document with embedded fonts is opened on a system that does not have the font installed
     * (the remote system), the embedded font may be loaded for temporary (and in some cases, permanent)
     * use on that system by an embedding-aware application.
     * Embedding licensing rights are granted by the vendor of the font.
     */
    fsType: number;
    /**
     * The recommended horizontal size in font design units for subscripts for this font.
     */
    ySubscriptXSize: number;
    /**
     * The recommended vertical size in font design units for subscripts for this font.
     */
    ySubscriptYSize: number;
    /**
     * The recommended horizontal offset in font design units for subscripts for this font.
     */
    ySubscriptXOffset: number;
    /**
     * The recommended vertical offset in font design units from the baseline for subscripts for this font.
     */
    ySubscriptYOffset: number;
    /**
     * The recommended horizontal size in font design units for superscripts for this font.
     */
    ySuperscriptXSize: number;
    /**
     * The recommended vertical size in font design units for superscripts for this font.
     */
    ySuperscriptYSize: number;
    /**
     * The recommended horizontal offset in font design units for superscripts for this font.
     */
    ySuperscriptXOffset: number;
    /**
     * The recommended vertical offset in font design units from the baseline for superscripts for this font.
     */
    ySuperscriptYOffset: number;
    /**
     * Width of the strikeout stroke in font design units.
     */
    yStrikeoutSize: number;
    /**
     * The position of the strikeout stroke relative to the baseline in font design units.
     */
    yStrikeoutPosition: number;
    /**
     * This parameter is a classification of font-family design.
     */
    sFamilyClass: number;
    /**
     * This 10 byte series of numbers are used to describe the visual characteristics
     * of a given typeface.  These characteristics are then used to associate the font with
     * other fonts of similar appearance having different names. The variables for each digit are listed below.
     * The specifications for each variable can be obtained in the specification
     * PANOSE v2.0 Numerical Evaluation from Microsoft Corporation.
     */
    panose: number[];
    /**
     * Structure field.
     */
    ulUnicodeRange1: number;
    /**
     * Structure field.
     */
    ulUnicodeRange2: number;
    /**
     * Structure field.
     */
    ulUnicodeRange3: number;
    /**
     * Structure field.
     */
    ulUnicodeRange4: number;
    /**
     * The four character identifier for the vendor of the given type face.
     */
    vendorIdentifier: number[];
    /**
     * Information concerning the nature of the font patterns.
     */
    fsSelection: number;
    /**
     * The minimum Unicode index (character code) in this font,
     * according to the cmap subtable for platform ID 3 and encoding ID 0 or 1.
     * For most fonts supporting Win-ANSI or other character sets, this value would be 0x0020.
     */
    usFirstCharIndex: number;
    /**
     * usLastCharIndex: The maximum Unicode index (character code) in this font,
     * according to the cmap subtable for platform ID 3 and encoding ID 0 or 1.
     * This value depends on which character sets the font supports.
     */
    usLastCharIndex: number;
    /**
     * The typographic ascender for this font.
     * Remember that this is not the same as the Ascender value in the 'h h e a' table,
     * which Apple defines in a far different manner.
     * DEF_TABLE_OFFSET good source for usTypoAscender is the Ascender value from an A F M file.
     */
    sTypoAscender: number;
    /**
     * The typographic descender for this font.
     * Remember that this is not the same as the Descender value in the 'h h e a' table,
     * which Apple defines in a far different manner.
     * DEF_TABLE_OFFSET good source for usTypoDescender is the Descender value from an A F M file.
     */
    sTypoDescender: number;
    /**
     * The typographic line gap for this font.
     * Remember that this is not the same as the LineGap value in the 'h h e a' table,
     * which Apple defines in a far different manner.
     */
    sTypoLineGap: number;
    /**
     * The ascender metric for Windows.
     * This too is distinct from Apple's Ascender value and from the usTypoAscender values.
     * usWinAscent is computed as the yMax for all characters in the Windows ANSI character set.
     * usTypoAscent is used to compute the Windows font height and default line spacing.
     * For platform 3 encoding 0 fonts, it is the same as yMax.
     */
    usWinAscent: number;
    /**
     * The descender metric for Windows.
     * This too is distinct from Apple's Descender value and from the usTypoDescender values.
     * usWinDescent is computed as the -yMin for all characters in the Windows ANSI character set.
     * usTypoAscent is used to compute the Windows font height and default line spacing.
     * For platform 3 encoding 0 fonts, it is the same as -yMin.
     */
    usWinDescent: number;
    /**
     * This field is used to specify the code pages encompassed
     * by the font file in the 'cmap' subtable for platform 3, encoding ID 1 (Microsoft platform).
     * If the font file is encoding ID 0, then the Symbol Character Set bit should be set.
     * If the bit is set (1) then the code page is considered functional.
     * If the bit is clear (0) then the code page is not considered functional.
     * Each of the bits is treated as an independent flag and the bits can be set in any combination.
     * The determination of "functional" is left up to the font designer,
     * although character set selection should attempt to be functional by code pages if at all possible.
     */
    ulCodePageRange1: number;
    /**
     * This field is used to specify the code pages encompassed
     * by the font file in the 'cmap' subtable for platform 3, encoding ID 1 (Microsoft platform).
     * If the font file is encoding ID 0, then the Symbol Character Set bit should be set.
     * If the bit is set (1) then the code page is considered functional.
     * If the bit is clear (0) then the code page is not considered functional.
     * Each of the bits is treated as an independent flag and the bits can be set in any combination.
     * The determination of "functional" is left up to the font designer,
     * although character set selection should attempt to be functional by code pages if at all possible.
     */
    ulCodePageRange2: number;
    /**
     * Structure field.
     */
    sxHeight: number;
    /**
     * Structure field.
     */
    sCapHeight: number;
    /**
     * Structure field.
     */
    usDefaultChar: number;
    /**
     * Structure field.
     */
    usBreakChar: number;
    /**
     * Structure field.
     */
    usMaxContext: number;
}
