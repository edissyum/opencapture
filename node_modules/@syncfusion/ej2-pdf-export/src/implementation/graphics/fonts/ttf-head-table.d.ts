/**
 * TtfHeadTable.ts class for EJ2-PDF
 */
export declare class TtfHeadTable {
    /**
     * Modified: International date (8-byte field).
     */
    modified: number;
    /**
     * Created: International date (8-byte field).
     */
    created: number;
    /**
     * MagicNumber: Set to 0x5F0F3CF5.
     */
    magicNumber: number;
    /**
     * CheckSumAdjustment: To compute: set it to 0, sum the entire font as U Long,
     * then store 0x B 1 B 0 A F B A - sum.
     */
    checkSumAdjustment: number;
    /**
     * FontRevision: Set by font manufacturer.
     */
    fontRevision: number;
    /**
     * Table version number: 0x00010000 for version 1.0.
     */
    version: number;
    /**
     * Minimum x for all glyph bounding boxes.
     */
    xMin: number;
    /**
     * Minimum y for all glyph bounding boxes.
     */
    yMin: number;
    /**
     * Valid range is from 16 to 16384.
     */
    unitsPerEm: number;
    /**
     * Maximum y for all glyph bounding boxes.
     */
    yMax: number;
    /**
     * Maximum x for all glyph bounding boxes.
     */
    xMax: number;
    /**
     * Regular: 0
     * Bold: 1
     * Italic: 2
     * Bold Italic: 3
     * Bit 0 - bold (if set to 1)
     * Bit 1 - italic (if set to 1)
     * Bits 2-15 - reserved (set to 0)
     * NOTE:
     * Note that macStyle bits must agree with the 'OS/2' table fsSelection bits.
     * The fsSelection bits are used over the macStyle bits in Microsoft Windows.
     * The PANOSE values and 'post' table values are ignored for determining bold or italic fonts.
     */
    macStyle: number;
    /**
     * Bit 0 - baseline for font at y=0
     * Bit 1 - left SideBearing at x=0
     * Bit 2 - instructions may depend on point size
     * Bit 3 - force p p e m to integer values for all private scaler math; may use fractional p p e m sizes if this bit is clean
     * Bit 4 - instructions may alter advance width (the advance widths might not scale linearly)
     * Note: All other bits must be zero.
     */
    flags: number;
    /**
     * lowestReadableSize: Smallest readable size in pixels.
     */
    lowestReadableSize: number;
    /**
     * FontDirectionHint:
     * 0   Fully mixed directional glyphs
     * 1   Only strongly left to right
     * 2   Like 1 but also contains neutrals
     * -1   Only strongly right to left
     * -2   Like -1 but also contains neutrals.
     */
    fontDirectionHint: number;
    /**
     * 0 for short offsets, 1 for long.
     */
    indexToLocalFormat: number;
    /**
     * 0 for current format.
     */
    glyphDataFormat: number;
}
