/**
 * Specifies the constant values specifying whether to extend the shading
 * beyond the starting and ending points of the axis.
 */
export var PdfExtend;
(function (PdfExtend) {
    /**
     * Do not extend any point.
     */
    PdfExtend[PdfExtend["None"] = 0] = "None";
    /**
     * Extend start point.
     */
    PdfExtend[PdfExtend["Start"] = 1] = "Start";
    /**
     * Extend end point.
     */
    PdfExtend[PdfExtend["End"] = 2] = "End";
    /**
     * Extend both start and end points.
     */
    PdfExtend[PdfExtend["Both"] = 3] = "Both";
})(PdfExtend || (PdfExtend = {}));
/**
 * Specifies the gradient direction of the linear gradient brush.
 */
export var PdfLinearGradientMode;
(function (PdfLinearGradientMode) {
    /**
     * Specifies a gradient from upper right to lower left.
     */
    PdfLinearGradientMode[PdfLinearGradientMode["BackwardDiagonal"] = 0] = "BackwardDiagonal";
    /**
     * Specifies a gradient from upper left to lower right.
     */
    PdfLinearGradientMode[PdfLinearGradientMode["ForwardDiagonal"] = 1] = "ForwardDiagonal";
    /**
     * Specifies a gradient from left to right.
     */
    PdfLinearGradientMode[PdfLinearGradientMode["Horizontal"] = 2] = "Horizontal";
    /**
     * Specifies a gradient from top to bottom.
     */
    PdfLinearGradientMode[PdfLinearGradientMode["Vertical"] = 3] = "Vertical";
})(PdfLinearGradientMode || (PdfLinearGradientMode = {}));
/**
 * Shading type constants.
 */
export var ShadingType;
(function (ShadingType) {
    /**
     * Function-based shading.
     */
    ShadingType[ShadingType["Function"] = 1] = "Function";
    /**
     * Axial shading.
     */
    ShadingType[ShadingType["Axial"] = 2] = "Axial";
    /**
     * Radial shading.
     */
    ShadingType[ShadingType["Radial"] = 3] = "Radial";
})(ShadingType || (ShadingType = {}));
export var KnownColor;
(function (KnownColor) {
    KnownColor[KnownColor["ActiveBorder"] = 1] = "ActiveBorder";
    KnownColor[KnownColor["ActiveCaption"] = 2] = "ActiveCaption";
    KnownColor[KnownColor["ActiveCaptionText"] = 3] = "ActiveCaptionText";
    KnownColor[KnownColor["AppWorkspace"] = 4] = "AppWorkspace";
    KnownColor[KnownColor["Control"] = 5] = "Control";
    KnownColor[KnownColor["ControlDark"] = 6] = "ControlDark";
    KnownColor[KnownColor["ControlDarkDark"] = 7] = "ControlDarkDark";
    KnownColor[KnownColor["ControlLight"] = 8] = "ControlLight";
    KnownColor[KnownColor["ControlLightLight"] = 9] = "ControlLightLight";
    KnownColor[KnownColor["ControlText"] = 10] = "ControlText";
    KnownColor[KnownColor["Desktop"] = 11] = "Desktop";
    KnownColor[KnownColor["GrayText"] = 12] = "GrayText";
    KnownColor[KnownColor["Highlight"] = 13] = "Highlight";
    KnownColor[KnownColor["HighlightText"] = 14] = "HighlightText";
    KnownColor[KnownColor["HotTrack"] = 15] = "HotTrack";
    KnownColor[KnownColor["InactiveBorder"] = 16] = "InactiveBorder";
    KnownColor[KnownColor["InactiveCaption"] = 17] = "InactiveCaption";
    KnownColor[KnownColor["InactiveCaptionText"] = 18] = "InactiveCaptionText";
    KnownColor[KnownColor["Info"] = 19] = "Info";
    KnownColor[KnownColor["InfoText"] = 20] = "InfoText";
    KnownColor[KnownColor["Menu"] = 21] = "Menu";
    KnownColor[KnownColor["MenuText"] = 22] = "MenuText";
    KnownColor[KnownColor["ScrollBar"] = 23] = "ScrollBar";
    KnownColor[KnownColor["Window"] = 24] = "Window";
    KnownColor[KnownColor["WindowFrame"] = 25] = "WindowFrame";
    KnownColor[KnownColor["WindowText"] = 26] = "WindowText";
    KnownColor[KnownColor["Transparent"] = 27] = "Transparent";
    KnownColor[KnownColor["AliceBlue"] = 28] = "AliceBlue";
    KnownColor[KnownColor["AntiqueWhite"] = 29] = "AntiqueWhite";
    KnownColor[KnownColor["Aqua"] = 30] = "Aqua";
    KnownColor[KnownColor["Aquamarine"] = 31] = "Aquamarine";
    KnownColor[KnownColor["Azure"] = 32] = "Azure";
    KnownColor[KnownColor["Beige"] = 33] = "Beige";
    KnownColor[KnownColor["Bisque"] = 34] = "Bisque";
    KnownColor[KnownColor["Black"] = 35] = "Black";
    KnownColor[KnownColor["BlanchedAlmond"] = 36] = "BlanchedAlmond";
    KnownColor[KnownColor["Blue"] = 37] = "Blue";
    KnownColor[KnownColor["BlueViolet"] = 38] = "BlueViolet";
    KnownColor[KnownColor["Brown"] = 39] = "Brown";
    KnownColor[KnownColor["BurlyWood"] = 40] = "BurlyWood";
    KnownColor[KnownColor["CadetBlue"] = 41] = "CadetBlue";
    KnownColor[KnownColor["Chartreuse"] = 42] = "Chartreuse";
    KnownColor[KnownColor["Chocolate"] = 43] = "Chocolate";
    KnownColor[KnownColor["Coral"] = 44] = "Coral";
    KnownColor[KnownColor["CornflowerBlue"] = 45] = "CornflowerBlue";
    KnownColor[KnownColor["Cornsilk"] = 46] = "Cornsilk";
    KnownColor[KnownColor["Crimson"] = 47] = "Crimson";
    KnownColor[KnownColor["Cyan"] = 48] = "Cyan";
    KnownColor[KnownColor["DarkBlue"] = 49] = "DarkBlue";
    KnownColor[KnownColor["DarkCyan"] = 50] = "DarkCyan";
    KnownColor[KnownColor["DarkGoldenrod"] = 51] = "DarkGoldenrod";
    KnownColor[KnownColor["DarkGray"] = 52] = "DarkGray";
    KnownColor[KnownColor["DarkGreen"] = 53] = "DarkGreen";
    KnownColor[KnownColor["DarkKhaki"] = 54] = "DarkKhaki";
    KnownColor[KnownColor["DarkMagenta"] = 55] = "DarkMagenta";
    KnownColor[KnownColor["DarkOliveGreen"] = 56] = "DarkOliveGreen";
    KnownColor[KnownColor["DarkOrange"] = 57] = "DarkOrange";
    KnownColor[KnownColor["DarkOrchid"] = 58] = "DarkOrchid";
    KnownColor[KnownColor["DarkRed"] = 59] = "DarkRed";
    KnownColor[KnownColor["DarkSalmon"] = 60] = "DarkSalmon";
    KnownColor[KnownColor["DarkSeaGreen"] = 61] = "DarkSeaGreen";
    KnownColor[KnownColor["DarkSlateBlue"] = 62] = "DarkSlateBlue";
    KnownColor[KnownColor["DarkSlateGray"] = 63] = "DarkSlateGray";
    KnownColor[KnownColor["DarkTurquoise"] = 64] = "DarkTurquoise";
    KnownColor[KnownColor["DarkViolet"] = 65] = "DarkViolet";
    KnownColor[KnownColor["DeepPink"] = 66] = "DeepPink";
    KnownColor[KnownColor["DeepSkyBlue"] = 67] = "DeepSkyBlue";
    KnownColor[KnownColor["DimGray"] = 68] = "DimGray";
    KnownColor[KnownColor["DodgerBlue"] = 69] = "DodgerBlue";
    KnownColor[KnownColor["Firebrick"] = 70] = "Firebrick";
    KnownColor[KnownColor["FloralWhite"] = 71] = "FloralWhite";
    KnownColor[KnownColor["ForestGreen"] = 72] = "ForestGreen";
    KnownColor[KnownColor["Fuchsia"] = 73] = "Fuchsia";
    KnownColor[KnownColor["Gainsboro"] = 74] = "Gainsboro";
    KnownColor[KnownColor["GhostWhite"] = 75] = "GhostWhite";
    KnownColor[KnownColor["Gold"] = 76] = "Gold";
    KnownColor[KnownColor["Goldenrod"] = 77] = "Goldenrod";
    KnownColor[KnownColor["Gray"] = 78] = "Gray";
    KnownColor[KnownColor["Green"] = 79] = "Green";
    KnownColor[KnownColor["GreenYellow"] = 80] = "GreenYellow";
    KnownColor[KnownColor["Honeydew"] = 81] = "Honeydew";
    KnownColor[KnownColor["HotPink"] = 82] = "HotPink";
    KnownColor[KnownColor["IndianRed"] = 83] = "IndianRed";
    KnownColor[KnownColor["Indigo"] = 84] = "Indigo";
    KnownColor[KnownColor["Ivory"] = 85] = "Ivory";
    KnownColor[KnownColor["Khaki"] = 86] = "Khaki";
    KnownColor[KnownColor["Lavender"] = 87] = "Lavender";
    KnownColor[KnownColor["LavenderBlush"] = 88] = "LavenderBlush";
    KnownColor[KnownColor["LawnGreen"] = 89] = "LawnGreen";
    KnownColor[KnownColor["LemonChiffon"] = 90] = "LemonChiffon";
    KnownColor[KnownColor["LightBlue"] = 91] = "LightBlue";
    KnownColor[KnownColor["LightCoral"] = 92] = "LightCoral";
    KnownColor[KnownColor["LightCyan"] = 93] = "LightCyan";
    KnownColor[KnownColor["LightGoldenrodYellow"] = 94] = "LightGoldenrodYellow";
    KnownColor[KnownColor["LightGray"] = 95] = "LightGray";
    KnownColor[KnownColor["LightGreen"] = 96] = "LightGreen";
    KnownColor[KnownColor["LightPink"] = 97] = "LightPink";
    KnownColor[KnownColor["LightSalmon"] = 98] = "LightSalmon";
    KnownColor[KnownColor["LightSeaGreen"] = 99] = "LightSeaGreen";
    KnownColor[KnownColor["LightSkyBlue"] = 100] = "LightSkyBlue";
    KnownColor[KnownColor["LightSlateGray"] = 101] = "LightSlateGray";
    KnownColor[KnownColor["LightSteelBlue"] = 102] = "LightSteelBlue";
    KnownColor[KnownColor["LightYellow"] = 103] = "LightYellow";
    KnownColor[KnownColor["Lime"] = 104] = "Lime";
    KnownColor[KnownColor["LimeGreen"] = 105] = "LimeGreen";
    KnownColor[KnownColor["Linen"] = 106] = "Linen";
    KnownColor[KnownColor["Magenta"] = 107] = "Magenta";
    KnownColor[KnownColor["Maroon"] = 108] = "Maroon";
    KnownColor[KnownColor["MediumAquamarine"] = 109] = "MediumAquamarine";
    KnownColor[KnownColor["MediumBlue"] = 110] = "MediumBlue";
    KnownColor[KnownColor["MediumOrchid"] = 111] = "MediumOrchid";
    KnownColor[KnownColor["MediumPurple"] = 112] = "MediumPurple";
    KnownColor[KnownColor["MediumSeaGreen"] = 113] = "MediumSeaGreen";
    KnownColor[KnownColor["MediumSlateBlue"] = 114] = "MediumSlateBlue";
    KnownColor[KnownColor["MediumSpringGreen"] = 115] = "MediumSpringGreen";
    KnownColor[KnownColor["MediumTurquoise"] = 116] = "MediumTurquoise";
    KnownColor[KnownColor["MediumVioletRed"] = 117] = "MediumVioletRed";
    KnownColor[KnownColor["MidnightBlue"] = 118] = "MidnightBlue";
    KnownColor[KnownColor["MintCream"] = 119] = "MintCream";
    KnownColor[KnownColor["MistyRose"] = 120] = "MistyRose";
    KnownColor[KnownColor["Moccasin"] = 121] = "Moccasin";
    KnownColor[KnownColor["NavajoWhite"] = 122] = "NavajoWhite";
    KnownColor[KnownColor["Navy"] = 123] = "Navy";
    KnownColor[KnownColor["OldLace"] = 124] = "OldLace";
    KnownColor[KnownColor["Olive"] = 125] = "Olive";
    KnownColor[KnownColor["OliveDrab"] = 126] = "OliveDrab";
    KnownColor[KnownColor["Orange"] = 127] = "Orange";
    KnownColor[KnownColor["OrangeRed"] = 128] = "OrangeRed";
    KnownColor[KnownColor["Orchid"] = 129] = "Orchid";
    KnownColor[KnownColor["PaleGoldenrod"] = 130] = "PaleGoldenrod";
    KnownColor[KnownColor["PaleGreen"] = 131] = "PaleGreen";
    KnownColor[KnownColor["PaleTurquoise"] = 132] = "PaleTurquoise";
    KnownColor[KnownColor["PaleVioletRed"] = 133] = "PaleVioletRed";
    KnownColor[KnownColor["PapayaWhip"] = 134] = "PapayaWhip";
    KnownColor[KnownColor["PeachPuff"] = 135] = "PeachPuff";
    KnownColor[KnownColor["Peru"] = 136] = "Peru";
    KnownColor[KnownColor["Pink"] = 137] = "Pink";
    KnownColor[KnownColor["Plum"] = 138] = "Plum";
    KnownColor[KnownColor["PowderBlue"] = 139] = "PowderBlue";
    KnownColor[KnownColor["Purple"] = 140] = "Purple";
    KnownColor[KnownColor["Red"] = 141] = "Red";
    KnownColor[KnownColor["RosyBrown"] = 142] = "RosyBrown";
    KnownColor[KnownColor["RoyalBlue"] = 143] = "RoyalBlue";
    KnownColor[KnownColor["SaddleBrown"] = 144] = "SaddleBrown";
    KnownColor[KnownColor["Salmon"] = 145] = "Salmon";
    KnownColor[KnownColor["SandyBrown"] = 146] = "SandyBrown";
    KnownColor[KnownColor["SeaGreen"] = 147] = "SeaGreen";
    KnownColor[KnownColor["SeaShell"] = 148] = "SeaShell";
    KnownColor[KnownColor["Sienna"] = 149] = "Sienna";
    KnownColor[KnownColor["Silver"] = 150] = "Silver";
    KnownColor[KnownColor["SkyBlue"] = 151] = "SkyBlue";
    KnownColor[KnownColor["SlateBlue"] = 152] = "SlateBlue";
    KnownColor[KnownColor["SlateGray"] = 153] = "SlateGray";
    KnownColor[KnownColor["Snow"] = 154] = "Snow";
    KnownColor[KnownColor["SpringGreen"] = 155] = "SpringGreen";
    KnownColor[KnownColor["SteelBlue"] = 156] = "SteelBlue";
    KnownColor[KnownColor["Tan"] = 157] = "Tan";
    KnownColor[KnownColor["Teal"] = 158] = "Teal";
    KnownColor[KnownColor["Thistle"] = 159] = "Thistle";
    KnownColor[KnownColor["Tomato"] = 160] = "Tomato";
    KnownColor[KnownColor["Turquoise"] = 161] = "Turquoise";
    KnownColor[KnownColor["Violet"] = 162] = "Violet";
    KnownColor[KnownColor["Wheat"] = 163] = "Wheat";
    KnownColor[KnownColor["White"] = 164] = "White";
    KnownColor[KnownColor["WhiteSmoke"] = 165] = "WhiteSmoke";
    KnownColor[KnownColor["Yellow"] = 166] = "Yellow";
    KnownColor[KnownColor["YellowGreen"] = 167] = "YellowGreen";
    KnownColor[KnownColor["ButtonFace"] = 168] = "ButtonFace";
    KnownColor[KnownColor["ButtonHighlight"] = 169] = "ButtonHighlight";
    KnownColor[KnownColor["ButtonShadow"] = 170] = "ButtonShadow";
    KnownColor[KnownColor["GradientActiveCaption"] = 171] = "GradientActiveCaption";
    KnownColor[KnownColor["GradientInactiveCaption"] = 172] = "GradientInactiveCaption";
    KnownColor[KnownColor["MenuBar"] = 173] = "MenuBar";
    KnownColor[KnownColor["MenuHighlight"] = 174] = "MenuHighlight";
})(KnownColor || (KnownColor = {}));
