import { PdfBrush } from './pdf-brush';
/**
 * `PdfBrushes` class provides objects used to fill the interiors of graphical shapes such as rectangles,
 * ellipses, pies, polygons, and paths.
 * @private
 */
export declare class PdfBrushes {
    /**
     * Local variable to store the brushes.
     */
    private static sBrushes;
    /**
     * Gets the AliceBlue brush.
     * @public
     */
    static readonly AliceBlue: PdfBrush;
    /**
     * Gets the antique white brush.
     * @public
     */
    static readonly AntiqueWhite: PdfBrush;
    /**
     * Gets the Aqua default brush.
     * @public
     */
    static readonly Aqua: PdfBrush;
    /**
     * Gets the Aquamarine default brush.
     * @public
     */
    static readonly Aquamarine: PdfBrush;
    /**
     * Gets the Azure default brush.
     * @public
     */
    static readonly Azure: PdfBrush;
    /**
     * Gets the Beige default brush.
     * @public
     */
    static readonly Beige: PdfBrush;
    /**
     * Gets the Bisque default brush.
     * @public
     */
    static readonly Bisque: PdfBrush;
    /**
     * Gets the Black default brush.
     * @public
     */
    static readonly Black: PdfBrush;
    /**
     * Gets the BlanchedAlmond default brush.
     * @public
     */
    static readonly BlanchedAlmond: PdfBrush;
    /**
     * Gets the Blue default brush.
     * @public
     */
    static readonly Blue: PdfBrush;
    /**
     * Gets the BlueViolet default brush.
     * @public
     */
    static readonly BlueViolet: PdfBrush;
    /**
     * Gets the Brown default brush.
     * @public
     */
    static readonly Brown: PdfBrush;
    /**
     * Gets the BurlyWood default brush.
     * @public
     */
    static readonly BurlyWood: PdfBrush;
    /**
     * Gets the CadetBlue default brush.
     * @public
     */
    static readonly CadetBlue: PdfBrush;
    /**
     * Gets the Chartreuse default brush.
     * @public
     */
    static readonly Chartreuse: PdfBrush;
    /**
     * Gets the Chocolate default brush.
     * @public
     */
    static readonly Chocolate: PdfBrush;
    /**
     * Gets the Coral default brush.
     * @public
     */
    static readonly Coral: PdfBrush;
    /**
     * Gets the CornflowerBlue default brush.
     * @public
     */
    static readonly CornflowerBlue: PdfBrush;
    /**
     * Gets the Corn silk default brush.
     * @public
     */
    static readonly Cornsilk: PdfBrush;
    /**
     *  Gets the Crimson default brush.
     * @public
     */
    static readonly Crimson: PdfBrush;
    /**
     * Gets the Cyan default brush.
     * @public
     */
    static readonly Cyan: PdfBrush;
    /**
     * Gets the DarkBlue default brush.
     * @public
     */
    static readonly DarkBlue: PdfBrush;
    /**
     * Gets the DarkCyan default brush.
     * @public
     */
    static readonly DarkCyan: PdfBrush;
    /**
     * Gets the DarkGoldenrod default brush.
     * @public
     */
    static readonly DarkGoldenrod: PdfBrush;
    /**
     * Gets the DarkGray default brush.
     * @public
     */
    static readonly DarkGray: PdfBrush;
    /**
     * Gets the DarkGreen default brush.
     * @public
     */
    static readonly DarkGreen: PdfBrush;
    /**
     * Gets the DarkKhaki default brush.
     * @public
     */
    static readonly DarkKhaki: PdfBrush;
    /**
     * Gets the DarkMagenta default brush.
     * @public
     */
    static readonly DarkMagenta: PdfBrush;
    /**
     * Gets the DarkOliveGreen default brush.
     * @public
     */
    static readonly DarkOliveGreen: PdfBrush;
    /**
     * Gets the DarkOrange default brush.
     * @public
     */
    static readonly DarkOrange: PdfBrush;
    /**
     * Gets the DarkOrchid default brush.
     * @public
     */
    static readonly DarkOrchid: PdfBrush;
    /**
     * Gets the DarkRed default brush.
     * @public
     */
    static readonly DarkRed: PdfBrush;
    /**
     * Gets the DarkSalmon default brush.
     * @public
     */
    static readonly DarkSalmon: PdfBrush;
    /**
     * Gets the DarkSeaGreen default brush.
     * @public
     */
    static readonly DarkSeaGreen: PdfBrush;
    /**
     * Gets the DarkSlateBlue default brush.
     * @public
     */
    static readonly DarkSlateBlue: PdfBrush;
    /**
     * Gets the DarkSlateGray default brush.
     * @public
     */
    static readonly DarkSlateGray: PdfBrush;
    /**
     * Gets the DarkTurquoise default brush.
     * @public
     */
    static readonly DarkTurquoise: PdfBrush;
    /**
     * Gets the DarkViolet default brush.
     * @public
     */
    static readonly DarkViolet: PdfBrush;
    /**
     * Gets the DeepPink default brush.
     * @public
     */
    static readonly DeepPink: PdfBrush;
    /**
     * Gets the DeepSkyBlue default brush.
     * @public
     */
    static readonly DeepSkyBlue: PdfBrush;
    /**
     * Gets the DimGray default brush.
     * @public
     */
    static readonly DimGray: PdfBrush;
    /**
     * Gets the DodgerBlue default brush.
     * @public
     */
    static readonly DodgerBlue: PdfBrush;
    /**
     * Gets the Firebrick default brush.
     * @public
     */
    static readonly Firebrick: PdfBrush;
    /**
     * Gets the FloralWhite default brush.
     * @public
     */
    static readonly FloralWhite: PdfBrush;
    /**
     * Gets the ForestGreen default brush.
     * @public
     */
    static readonly ForestGreen: PdfBrush;
    /**
     * Gets the Fuchsia default brush.
     * @public
     */
    static readonly Fuchsia: PdfBrush;
    /**
     * Gets the Gainsborough default brush.
     * @public
     */
    static readonly Gainsboro: PdfBrush;
    /**
     * Gets the GhostWhite default brush.
     * @public
     */
    static readonly GhostWhite: PdfBrush;
    /**
     * Gets the Gold default brush.
     * @public
     */
    static readonly Gold: PdfBrush;
    /**
     * Gets the Goldenrod default brush.
     * @public
     */
    static readonly Goldenrod: PdfBrush;
    /**
     * Gets the Gray default brush.
     * @public
     */
    static readonly Gray: PdfBrush;
    /**
     * Gets the Green default brush.
     * @public
     */
    static readonly Green: PdfBrush;
    /**
     * Gets the GreenYellow default brush.
     * @public
     */
    static readonly GreenYellow: PdfBrush;
    /**
     * Gets the Honeydew default brush.
     * @public
     */
    static readonly Honeydew: PdfBrush;
    /**
     * Gets the HotPink default brush.
     * @public
     */
    static readonly HotPink: PdfBrush;
    /**
     * Gets the IndianRed default brush.
     * @public
     */
    static readonly IndianRed: PdfBrush;
    /**
     * Gets the Indigo default brush.
     * @public
     */
    static readonly Indigo: PdfBrush;
    /**
     * Gets the Ivory default brush.
     * @public
     */
    static readonly Ivory: PdfBrush;
    /**
     * Gets the Khaki default brush.
     * @public
     */
    static readonly Khaki: PdfBrush;
    /**
     * Gets the Lavender default brush.
     * @public
     */
    static readonly Lavender: PdfBrush;
    /**
     * Gets the LavenderBlush default brush.
     * @public
     */
    static readonly LavenderBlush: PdfBrush;
    /**
     * Gets the LawnGreen default brush.
     * @public
     */
    static readonly LawnGreen: PdfBrush;
    /**
     * Gets the LemonChiffon default brush.
     * @public
     */
    static readonly LemonChiffon: PdfBrush;
    /**
     * Gets the LightBlue default brush.
     * @public
     */
    static readonly LightBlue: PdfBrush;
    /**
     * Gets the LightCoral default brush.
     * @public
     */
    static readonly LightCoral: PdfBrush;
    /**
     * Gets the LightCyan default brush.
     * @public
     */
    static readonly LightCyan: PdfBrush;
    /**
     * Gets the LightGoldenrodYellow default brush.
     * @public
     */
    static readonly LightGoldenrodYellow: PdfBrush;
    /**
     * Gets the LightGray default brush.
     * @public
     */
    static readonly LightGray: PdfBrush;
    /**
     * Gets the LightGreen default brush.
     * @public
     */
    static readonly LightGreen: PdfBrush;
    /**
     * Gets the LightPink default brush.
     * @public
     */
    static readonly LightPink: PdfBrush;
    /**
     * Gets the LightSalmon default brush.
     * @public
     */
    static readonly LightSalmon: PdfBrush;
    /**
     * Gets the LightSeaGreen default brush.
     * @public
     */
    static readonly LightSeaGreen: PdfBrush;
    /**
     * Gets the LightSkyBlue default brush.
     * @public
     */
    static readonly LightSkyBlue: PdfBrush;
    /**
     * Gets the LightSlateGray default brush.
     * @public
     */
    static readonly LightSlateGray: PdfBrush;
    /**
     * Gets the LightSteelBlue default brush.
     * @public
     */
    static readonly LightSteelBlue: PdfBrush;
    /**
     * Gets the LightYellow default brush.
     * @public
     */
    static readonly LightYellow: PdfBrush;
    /**
     * Gets the Lime default brush.
     * @public
     */
    static readonly Lime: PdfBrush;
    /**
     * Gets the LimeGreen default brush.
     * @public
     */
    static readonly LimeGreen: PdfBrush;
    /**
     * Gets the Linen default brush.
     * @public
     */
    static readonly Linen: PdfBrush;
    /**
     * Gets the Magenta default brush.
     * @public
     */
    static readonly Magenta: PdfBrush;
    /**
     * Gets the Maroon default brush.
     * @public
     */
    static readonly Maroon: PdfBrush;
    /**
     * Gets the MediumAquamarine default brush.
     * @public
     */
    static readonly MediumAquamarine: PdfBrush;
    /**
     * Gets the MediumBlue default brush.
     * @public
     */
    static readonly MediumBlue: PdfBrush;
    /**
     * Gets the MediumOrchid default brush.
     * @public
     */
    static readonly MediumOrchid: PdfBrush;
    /**
     * Gets the MediumPurple default brush.
     * @public
     */
    static readonly MediumPurple: PdfBrush;
    /**
     * Gets the MediumSeaGreen default brush.
     * @public
     */
    static readonly MediumSeaGreen: PdfBrush;
    /**
     * Gets the MediumSlateBlue default brush.
     * @public
     */
    static readonly MediumSlateBlue: PdfBrush;
    /**
     * Gets the MediumSpringGreen default brush.
     * @public
     */
    static readonly MediumSpringGreen: PdfBrush;
    /**
     * Gets the MediumTurquoise default brush.
     * @public
     */
    static readonly MediumTurquoise: PdfBrush;
    /**
     * Gets the MediumVioletRed default brush.
     * @public
     */
    static readonly MediumVioletRed: PdfBrush;
    /**
     * Gets the MidnightBlue default brush.
     * @public
     */
    static readonly MidnightBlue: PdfBrush;
    /**
     * Gets the MintCream default brush.
     * @public
     */
    static readonly MintCream: PdfBrush;
    /**
     * Gets the MistyRose default brush.
     * @public
     */
    static readonly MistyRose: PdfBrush;
    /**
     * Gets the Moccasin default brush.
     * @public
     */
    static readonly Moccasin: PdfBrush;
    /**
     * Gets the NavajoWhite default brush.
     * @public
     */
    static readonly NavajoWhite: PdfBrush;
    /**
     * Gets the Navy default brush.
     * @public
     */
    static readonly Navy: PdfBrush;
    /**
     * Gets the OldLace default brush.
     * @public
     */
    static readonly OldLace: PdfBrush;
    /**
     * Gets the Olive default brush.
     * @public
     */
    static readonly Olive: PdfBrush;
    /**
     * Gets the OliveDrab default brush.
     * @public
     */
    static readonly OliveDrab: PdfBrush;
    /**
     * Gets the Orange default brush.
     * @public
     */
    static readonly Orange: PdfBrush;
    /**
     * Gets the OrangeRed default brush.
     * @public
     */
    static readonly OrangeRed: PdfBrush;
    /**
     * Gets the Orchid default brush.
     * @public
     */
    static readonly Orchid: PdfBrush;
    /**
     * Gets the PaleGoldenrod default brush.
     * @public
     */
    static readonly PaleGoldenrod: PdfBrush;
    /**
     * Gets the PaleGreen default brush.
     * @public
     */
    static readonly PaleGreen: PdfBrush;
    /**
     * Gets the PaleTurquoise default brush.
     * @public
     */
    static readonly PaleTurquoise: PdfBrush;
    /**
     * Gets the PaleVioletRed default brush.
     * @public
     */
    static readonly PaleVioletRed: PdfBrush;
    /**
     * Gets the PapayaWhip default brush.
     * @public
     */
    static readonly PapayaWhip: PdfBrush;
    /**
     * Gets the PeachPuff default brush.
     * @public
     */
    static readonly PeachPuff: PdfBrush;
    /**
     * Gets the Peru default brush.
     * @public
     */
    static readonly Peru: PdfBrush;
    /**
     * Gets the Pink default brush.
     * @public
     */
    static readonly Pink: PdfBrush;
    /**
     * Gets the Plum default brush.
     * @public
     */
    static readonly Plum: PdfBrush;
    /**
     * Gets the PowderBlue default brush.
     * @public
     */
    static readonly PowderBlue: PdfBrush;
    /**
     * Gets the Purple default brush.
     * @public
     */
    static readonly Purple: PdfBrush;
    /**
     * Gets the Red default brush.
     * @public
     */
    static readonly Red: PdfBrush;
    /**
     * Gets the RosyBrown default brush.
     * @public
     */
    static readonly RosyBrown: PdfBrush;
    /**
     * Gets the RoyalBlue default brush.
     * @public
     */
    static readonly RoyalBlue: PdfBrush;
    /**
     * Gets the SaddleBrown default brush.
     * @public
     */
    static readonly SaddleBrown: PdfBrush;
    /**
     * Gets the Salmon default brush.
     * @public
     */
    static readonly Salmon: PdfBrush;
    /**
     * Gets the SandyBrown default brush.
     * @public
     */
    static readonly SandyBrown: PdfBrush;
    /**
     * Gets the SeaGreen default brush.
     * @public
     */
    static readonly SeaGreen: PdfBrush;
    /**
     * Gets the SeaShell default brush.
     * @public
     */
    static readonly SeaShell: PdfBrush;
    /**
     * Gets the Sienna default brush.
     * @public
     */
    static readonly Sienna: PdfBrush;
    /**
     * Gets the Silver default brush.
     * @public
     */
    static readonly Silver: PdfBrush;
    /**
     * Gets the SkyBlue default brush.
     * @public
     */
    static readonly SkyBlue: PdfBrush;
    /**
     * Gets the SlateBlue default brush.
     * @public
     */
    static readonly SlateBlue: PdfBrush;
    /**
     * Gets the SlateGray default brush.
     * @public
     */
    static readonly SlateGray: PdfBrush;
    /**
     * Gets the Snow default brush.
     * @public
     */
    static readonly Snow: PdfBrush;
    /**
     * Gets the SpringGreen default brush.
     * @public
     */
    static readonly SpringGreen: PdfBrush;
    /**
     * Gets the SteelBlue default brush.
     * @public
     */
    static readonly SteelBlue: PdfBrush;
    /**
     * Gets the Tan default brush.
     * @public
     */
    static readonly Tan: PdfBrush;
    /**
     * Gets the Teal default brush.
     * @public
     */
    static readonly Teal: PdfBrush;
    /**
     * Gets the Thistle default brush.
     * @public
     */
    static readonly Thistle: PdfBrush;
    /**
     * Gets the Tomato default brush.
     * @public
     */
    static readonly Tomato: PdfBrush;
    /**
     * Gets the Transparent default brush.
     * @public
     */
    static readonly Transparent: PdfBrush;
    /**
     * Gets the Turquoise default brush.
     * @public
     */
    static readonly Turquoise: PdfBrush;
    /**
     * Gets the Violet default brush.
     * @public
     */
    static readonly Violet: PdfBrush;
    /**
     * Gets the Wheat default brush.
     * @public
     */
    static readonly Wheat: PdfBrush;
    /**
     * Gets the White default brush.
     * @public
     */
    static readonly White: PdfBrush;
    /**
     * Gets the WhiteSmoke default brush.
     * @public
     */
    static readonly WhiteSmoke: PdfBrush;
    /**
     * Gets the Yellow default brush.
     * @public
     */
    static readonly Yellow: PdfBrush;
    /**
     * Gets the YellowGreen default brush.
     * @public
     */
    static readonly YellowGreen: PdfBrush;
    /**
     * Get the brush.
     */
    private static getBrush;
    /**
     * Get the color value.
     * @param colorName The KnownColor name.
     */
    private static getColorValue;
}
