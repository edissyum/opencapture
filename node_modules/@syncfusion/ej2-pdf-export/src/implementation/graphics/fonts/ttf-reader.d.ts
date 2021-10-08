/**
 * TtfReader.ts class for EJ2-PDF
 */
import { TtfTableInfo } from './ttf-table-info';
import { Dictionary } from './../../collections/dictionary';
import { TtfMetrics } from './ttf-metrics';
import { TtfGlyphInfo } from './ttf-glyph-info';
export declare class TtfReader {
    private fontData;
    private readonly int32Size;
    private offset;
    tableDirectory: Dictionary<string, TtfTableInfo>;
    private isTtcFont;
    private isMacTtf;
    private lowestPosition;
    private metricsName;
    metrics: TtfMetrics;
    private maxMacIndex;
    private isFontPresent;
    private isMacTTF;
    private missedGlyphs;
    private tableNames;
    private entrySelectors;
    /**
     * Width table.
     */
    private width;
    /**
     * Indicates whether loca table is short.
     */
    bIsLocaShort: boolean;
    /**
     * Glyphs for Macintosh or Symbol fonts.
     */
    private macintoshDictionary;
    /**
     * Glyphs for Microsoft or Symbol fonts.
     */
    private microsoftDictionary;
    /**
     * Glyphs for Macintosh or Symbol fonts (glyph index - key, glyph - value).
     */
    private internalMacintoshGlyphs;
    /**
     * Glyphs for Microsoft or Symbol fonts (glyph index - key, glyph - value).
     */
    private internalMicrosoftGlyphs;
    /**
     * Gets glyphs for Macintosh or Symbol fonts (char - key, glyph - value).
     */
    private readonly macintosh;
    /**
     * Gets glyphs for Microsoft or Symbol fonts (char - key, glyph - value).
     */
    private readonly microsoft;
    /**
     * Gets glyphs for Macintosh or Symbol fonts (glyph index - key, glyph - value).
     */
    private readonly macintoshGlyphs;
    /**
     * Gets glyphs for Microsoft Unicode fonts (glyph index - key, glyph - value).
     */
    private readonly microsoftGlyphs;
    constructor(fontData: Uint8Array);
    private initialize;
    private readFontDictionary;
    private fixOffsets;
    private checkPreambula;
    private readNameTable;
    private readHeadTable;
    private readHorizontalHeaderTable;
    private readOS2Table;
    private readPostTable;
    /**
     * Reads Width of the glyphs.
     */
    private readWidthTable;
    /**
     * Reads the cmap table.
     */
    private readCmapTable;
    /**
     * Reads the cmap sub table.
     */
    private readCmapSubTable;
    /**
     * Reads Symbol cmap table.
     */
    private readAppleCmapTable;
    /**
     * Reads Symbol cmap table.
     */
    private readMicrosoftCmapTable;
    /**
     * Reads Trimed cmap table.
     */
    private readTrimmedCmapTable;
    private initializeFontName;
    private getTable;
    /**
     * Returns width of the glyph.
     */
    private getWidth;
    /**
     * Gets CMAP encoding based on platform ID and encoding ID.
     */
    private getCmapEncoding;
    /**
     * Adds glyph to the collection.
     */
    private addGlyph;
    /**
     * Initializes metrics.
     */
    private initializeMetrics;
    /**
     * Updates chars structure which is used in the case of ansi encoding (256 bytes).
     */
    private updateWidth;
    /**
     * Returns default glyph.
     */
    private getDefaultGlyph;
    /**
     * Reads unicode string from byte array.
     */
    private getString;
    /**
     * Reads loca table.
     */
    private readLocaTable;
    /**
     * Updates hash table of used glyphs.
     */
    private updateGlyphChars;
    /**
     * Checks if glyph is composite or not.
     */
    private processCompositeGlyph;
    /**
     * Creates new glyph tables based on chars that are used for output.
     */
    private generateGlyphTable;
    /**
     * Updates new Loca table.
     */
    private updateLocaTable;
    /**
     * Aligns number to be divisible on 4.
     */
    private align;
    /**
     * Returns font program data.
     */
    private getFontProgram;
    private getFontProgramLength;
    /**
     * Writing to destination buffer - checksums and sizes of used tables.
     */
    private writeCheckSums;
    /**
     * Gets checksum from source buffer.
     */
    private calculateCheckSum;
    /**
     * Writing to destination buffer - used glyphs.
     */
    private writeGlyphs;
    /**
     * Sets position value of font data.
     */
    setOffset(offset: number): void;
    /**
     * Creates font Internals
     * @private
     */
    createInternals(): void;
    /**
     * Gets glyph's info by char code.
     */
    getGlyph(charCode: string): TtfGlyphInfo;
    getGlyph(charCode: number): TtfGlyphInfo;
    /**
     * Gets hash table with chars indexed by glyph index.
     */
    getGlyphChars(chars: Dictionary<string, string>): Dictionary<number, number>;
    /**
     * Gets all glyphs.
     */
    getAllGlyphs(): TtfGlyphInfo[];
    /**
     * Reads a font's program.
     * @private
     */
    readFontProgram(chars: Dictionary<string, string>): number[];
    /**
     * Reconverts string to be in proper format saved into PDF file.
     */
    convertString(text: string): string;
    /**
     * Gets char width.
     */
    getCharWidth(code: string): number;
    private readString;
    private readFixed;
    private readInt32;
    private readUInt32;
    private readInt16;
    private readInt64;
    private readUInt16;
    /**
     * Reads ushort array.
     */
    private readUshortArray;
    private readBytes;
    private readByte;
    /**
     * Reads bytes to array in BigEndian order.
     * @private
     */
    read(buffer: number[], index: number, count: number): {
        buffer: number[];
        written: number;
    };
}
