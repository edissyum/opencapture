import { TtfReader } from './ttf-reader';
import { TtfMetrics } from './ttf-metrics';
import { PdfArray } from './../../primitives/pdf-array';
import { PdfFontMetrics } from './pdf-font-metrics';
import { IPdfPrimitive } from './../../../interfaces/i-pdf-primitives';
export declare class UnicodeTrueTypeFont {
    private readonly nameString;
    /**
     * Name of the font subset.
     */
    private subsetName;
    /**
     * `Size` of the true type font.
     * @private
     */
    private fontSize;
    /**
     * `Base64 string` of the true type font.
     * @private
     */
    private fontString;
    /**
     * `font data` of the true type font.
     * @private
     */
    private fontData;
    /**
     * `true type font` reader object.
     * @private
     */
    ttfReader: TtfReader;
    /**
     * metrics of true type font.
     * @private
     */
    ttfMetrics: TtfMetrics;
    /**
     * Indicates whether the font is embedded or not.
     * @private
     */
    isEmbed: boolean;
    /**
     * Pdf primitive describing the font.
     */
    private fontDictionary;
    /**
     * Descendant font.
     */
    private descendantFont;
    /**
     * font descripter.
     */
    private fontDescriptor;
    /**
     * Font program.
     */
    private fontProgram;
    /**
     * Cmap stream.
     */
    private cmap;
    /**
     * C i d stream.
     */
    private cidStream;
    /**
     * Font metrics.
     */
    metrics: PdfFontMetrics;
    /**
     * Specifies the Internal variable to store fields of `PdfDictionaryProperties`.
     * @private
     */
    private dictionaryProperties;
    /**
     * Array of used chars.
     * @private
     */
    private usedChars;
    /**
     * Indicates whether the font program is compressed or not.
     * @private
     */
    private isCompress;
    /**
     * Indicates whether the font is embedded or not.
     */
    private isEmbedFont;
    /**
     * Cmap table's start prefix.
     */
    private readonly cmapPrefix;
    /**
     * Cmap table's start suffix.
     */
    private readonly cmapEndCodespaceRange;
    /**
     * Cmap's begin range marker.
     */
    private readonly cmapBeginRange;
    /**
     * Cmap's end range marker.
     */
    private readonly cmapEndRange;
    /**
     * Cmap table's end
     */
    private readonly cmapSuffix;
    /**
     * Initializes a new instance of the `PdfTrueTypeFont` class.
     * @private
     */
    constructor(base64String: string, size: number);
    /**
     * Returns width of the char symbol.
     */
    getCharWidth(charCode: string): number;
    /**
     * Returns width of the text line.
     */
    getLineWidth(line: string): number;
    /**
     * Initializes a new instance of the `PdfTrueTypeFont` class.
     * @private
     */
    private Initialize;
    createInternals(): void;
    getInternals(): IPdfPrimitive;
    /**
     * Initializes metrics.
     */
    private initializeMetrics;
    /**
     * Gets random string.
     */
    private getFontName;
    /**
     * Generates name of the font.
     */
    private formatName;
    /**
     * Creates descendant font.
     */
    private createDescendantFont;
    /**
     * Creates font descriptor.
     */
    private createFontDescriptor;
    /**
     * Generates cmap.
     * @private
     */
    private createCmap;
    /**
     * Generates font dictionary.
     */
    private createFontDictionary;
    /**
     * Creates font program.
     */
    private createFontProgram;
    /**
     * Creates system info dictionary for CID font.
     * @private
     */
    private createSystemInfo;
    /**
     * Runs before font Dictionary will be saved.
     */
    descendantFontBeginSave(): void;
    /**
     * Runs before font Dictionary will be saved.
     */
    cmapBeginSave(): void;
    /**
     * Runs before font Dictionary will be saved.
     */
    fontDictionaryBeginSave(): void;
    /**
     * Runs before font program stream save.
     */
    fontProgramBeginSave(): void;
    /**
     * Gets width description pad array for c i d font.
     */
    getDescendantWidth(): PdfArray;
    /**
     * Creates cmap.
     */
    private generateCmap;
    /**
     * Generates font program.
     */
    private generateFontProgram;
    /**
     * Calculates flags for the font descriptor.
     * @private
     */
    getDescriptorFlags(): number;
    /**
     * Calculates BoundBox of the descriptor.
     * @private
     */
    private getBoundBox;
    /**
     * Converts integer of decimal system to hex integer.
     */
    private toHexString;
    /**
     * Stores used symbols.
     */
    setSymbols(text: string): void;
}
