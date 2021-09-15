/**
 * TtfMetrics.ts class for EJ2-PDF
 */
import { Rectangle } from './../../drawing/pdf-drawing';
export declare class TtfMetrics {
    /**
     * Typographic line gap.
     * Negative LineGap values are treated as DEF_TABLE_CHECKSUM.
     */
    lineGap: number;
    /**
     * Gets or sets contains C F F.
     */
    contains: boolean;
    /**
     * Gets or sets value indicating if Symbol font is used.
     */
    isSymbol: boolean;
    /**
     * Gets or sets description font item.
     */
    fontBox: Rectangle;
    /**
     * Gets or sets description font item.
     */
    isFixedPitch: boolean;
    /**
     * Gets or sets description font item.
     */
    italicAngle: number;
    /**
     * Gets or sets post-script font name.
     */
    postScriptName: string;
    /**
     * Gets or sets font family name.
     */
    fontFamily: string;
    /**
     * Gets or sets description font item.
     */
    capHeight: number;
    /**
     * Gets or sets description font item.
     */
    leading: number;
    /**
     * Gets or sets description font item.
     */
    macAscent: number;
    /**
     * Gets or sets description font item.
     */
    macDescent: number;
    /**
     * Gets or sets description font item.
     */
    winDescent: number;
    /**
     * Gets or sets description font item.
     */
    winAscent: number;
    /**
     * Gets or sets description font item.
     */
    stemV: number;
    /**
     * Gets or sets widths table for the font.
     */
    widthTable: number[];
    /**
     * Regular: 0
     * Bold: 1
     * Italic: 2
     * Bold Italic: 3
     * Bit 0- bold (if set to 1)
     * Bit 1- italic (if set to 1)
     * Bits 2-15- reserved (set to 0).
     * NOTE:
     * Note that macStyle bits must agree with the 'OS/2' table fsSelection bits.
     * The fsSelection bits are used over the macStyle bits in Microsoft Windows.
     * The PANOSE values and 'post' table values are ignored for determining bold or italic fonts.
     */
    macStyle: number;
    /**
     * Subscript size factor.
     */
    subScriptSizeFactor: number;
    /**
     * Superscript size factor.
     */
    superscriptSizeFactor: number;
    /**
     * Gets a value indicating whether this instance is italic.
     */
    readonly isItalic: boolean;
    /**
     * Gets a value indicating whether this instance is bold.
     */
    readonly isBold: boolean;
}
