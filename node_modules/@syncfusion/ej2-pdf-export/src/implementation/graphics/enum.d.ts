/**
 * public Enum for `PdfHorizontalAlignment`.
 * @private
 */
export declare enum PdfHorizontalAlignment {
    /**
     * Specifies the type of `Left`.
     * @private
     */
    Left = 0,
    /**
     * Specifies the type of `Center`.
     * @private
     */
    Center = 1,
    /**
     * Specifies the type of `Right`.
     * @private
     */
    Right = 2
}
/**
 * public Enum for `PdfVerticalAlignment`.
 * @private
 */
export declare enum PdfVerticalAlignment {
    /**
     * Specifies the type of `Top`.
     * @private
     */
    Top = 0,
    /**
     * Specifies the type of `Middle`.
     * @private
     */
    Middle = 1,
    /**
     * Specifies the type of `Bottom`.
     * @private
     */
    Bottom = 2
}
/**
 * public Enum for `public`.
 * @private
 */
export declare enum PdfTextAlignment {
    /**
     * Specifies the type of `Left`.
     * @private
     */
    Left = 0,
    /**
     * Specifies the type of `Center`.
     * @private
     */
    Center = 1,
    /**
     * Specifies the type of `Right`.
     * @private
     */
    Right = 2,
    /**
     * Specifies the type of `Justify`.
     * @private
     */
    Justify = 3
}
/**
 * public Enum for `TextRenderingMode`.
 * @private
 */
export declare enum TextRenderingMode {
    /**
     * Specifies the type of `Fill`.
     * @private
     */
    Fill = 0,
    /**
     * Specifies the type of `Stroke`.
     * @private
     */
    Stroke = 1,
    /**
     * Specifies the type of `FillStroke`.
     * @private
     */
    FillStroke = 2,
    /**
     * Specifies the type of `None`.
     * @private
     */
    None = 3,
    /**
     * Specifies the type of `ClipFlag`.
     * @private
     */
    ClipFlag = 4,
    /**
     * Specifies the type of `ClipFill`.
     * @private
     */
    ClipFill = 4,
    /**
     * Specifies the type of `ClipStroke`.
     * @private
     */
    ClipStroke = 5,
    /**
     * Specifies the type of `ClipFillStroke`.
     * @private
     */
    ClipFillStroke = 6,
    /**
     * Specifies the type of `Clip`.
     * @private
     */
    Clip = 7
}
/**
 * public Enum for `PdfLineJoin`.
 * @private
 */
export declare enum PdfLineJoin {
    /**
     * Specifies the type of `Miter`.
     * @private
     */
    Miter = 0,
    /**
     * Specifies the type of `Round`.
     * @private
     */
    Round = 1,
    /**
     * Specifies the type of `Bevel`.
     * @private
     */
    Bevel = 2
}
/**
 * public Enum for `PdfLineCap`.
 * @private
 */
export declare enum PdfLineCap {
    /**
     * Specifies the type of `Flat`.
     * @private
     */
    Flat = 0,
    /**
     * Specifies the type of `Round`.
     * @private
     */
    Round = 1,
    /**
     * Specifies the type of `Square`.
     * @private
     */
    Square = 2
}
/**
 * public Enum for `PdfDashStyle`.
 * @private
 */
export declare enum PdfDashStyle {
    /**
     * Specifies the type of `Solid`.
     * @private
     */
    Solid = 0,
    /**
     * Specifies the type of `Dash`.
     * @private
     */
    Dash = 1,
    /**
     * Specifies the type of `Dot`.
     * @private
     */
    Dot = 2,
    /**
     * Specifies the type of `DashDot`.
     * @private
     */
    DashDot = 3,
    /**
     * Specifies the type of `DashDotDot`.
     * @private
     */
    DashDotDot = 4,
    /**
     * Specifies the type of `Custom`.
     * @private
     */
    Custom = 5
}
/**
 * public Enum for `PdfFillMode`.
 * @private
 */
export declare enum PdfFillMode {
    /**
     * Specifies the type of `Winding`.
     * @private
     */
    Winding = 0,
    /**
     * Specifies the type of `Alternate`.
     * @private
     */
    Alternate = 1
}
/**
 * public Enum for `PdfColorSpace`.
 * @private
 */
export declare enum PdfColorSpace {
    /**
     * Specifies the type of `Rgb`.
     * @private
     */
    Rgb = 0,
    /**
     * Specifies the type of `Cmyk`.
     * @private
     */
    Cmyk = 1,
    /**
     * Specifies the type of `GrayScale`.
     * @private
     */
    GrayScale = 2,
    /**
     * Specifies the type of `Indexed`.
     * @private
     */
    Indexed = 3
}
/**
 * public Enum for `PdfBlendMode`.
 * @private
 */
export declare enum PdfBlendMode {
    /**
     * Specifies the type of `Normal`.
     * @private
     */
    Normal = 0,
    /**
     * Specifies the type of `Multiply`.
     * @private
     */
    Multiply = 1,
    /**
     * Specifies the type of `Screen`.
     * @private
     */
    Screen = 2,
    /**
     * Specifies the type of `Overlay`.
     * @private
     */
    Overlay = 3,
    /**
     * Specifies the type of `Darken`.
     * @private
     */
    Darken = 4,
    /**
     * Specifies the type of `Lighten`.
     * @private
     */
    Lighten = 5,
    /**
     * Specifies the type of `ColorDodge`.
     * @private
     */
    ColorDodge = 6,
    /**
     * Specifies the type of `ColorBurn`.
     * @private
     */
    ColorBurn = 7,
    /**
     * Specifies the type of `HardLight`.
     * @private
     */
    HardLight = 8,
    /**
     * Specifies the type of `SoftLight`.
     * @private
     */
    SoftLight = 9,
    /**
     * Specifies the type of `Difference`.
     * @private
     */
    Difference = 10,
    /**
     * Specifies the type of `Exclusion`.
     * @private
     */
    Exclusion = 11,
    /**
     * Specifies the type of `Hue`.
     * @private
     */
    Hue = 12,
    /**
     * Specifies the type of `Saturation`.
     * @private
     */
    Saturation = 13,
    /**
     * Specifies the type of `Color`.
     * @private
     */
    Color = 14,
    /**
     * Specifies the type of `Luminosity`.
     * @private
     */
    Luminosity = 15
}
/**
 * public Enum for `PdfGraphicsUnit`.
 * @private
 */
export declare enum PdfGraphicsUnit {
    /**
     * Specifies the type of `Centimeter`.
     * @private
     */
    Centimeter = 0,
    /**
     * Specifies the type of `Pica`.
     * @private
     */
    Pica = 1,
    /**
     * Specifies the type of `Pixel`.
     * @private
     */
    Pixel = 2,
    /**
     * Specifies the type of `Point`.
     * @private
     */
    Point = 3,
    /**
     * Specifies the type of `Inch`.
     * @private
     */
    Inch = 4,
    /**
     * Specifies the type of `Document`.
     * @private
     */
    Document = 5,
    /**
     * Specifies the type of `Millimeter`.
     * @private
     */
    Millimeter = 6
}
/**
 * public Enum for `PdfGridImagePosition`.
 * @private
 */
export declare enum PdfGridImagePosition {
    /**
     * Specifies the type of `Fit`.
     * @private
     */
    Fit = 0,
    /**
     * Specifies the type of `Center`.
     * @private
     */
    Center = 1,
    /**
     * Specifies the type of `Stretch`.
     * @private
     */
    Stretch = 2,
    /**
     * Specifies the type of `Tile`.
     * @private
     */
    Tile = 3
}
/**
 * public Enum for `the text rendering direction`.
 * @private
 */
export declare enum PdfTextDirection {
    /**
     * Specifies the type of `None`.
     * @private
     */
    None = 0,
    /**
     * Specifies the type of `LeftToRight`.
     * @private
     */
    LeftToRight = 1,
    /**
     * Specifies the type of `RightToLeft`.
     * @private
     */
    RightToLeft = 2
}
