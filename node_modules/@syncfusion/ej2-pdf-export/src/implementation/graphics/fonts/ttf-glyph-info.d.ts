/**
 * TtfGlyphInfo.ts class for EJ2-PDF
 */
export declare class TtfGlyphInfo {
    /**
     * Holds glyph index.
     */
    index: number;
    /**
     * Holds character's width.
     */
    width: number;
    /**
     * Code of the char symbol.
     */
    charCode: number;
    /**
     * Gets a value indicating whether this TtfGlyphInfo is empty.
     */
    readonly empty: boolean;
    /**
     * Compares two WidthDescriptor objects.
     */
    compareTo(obj: Object): number;
}
