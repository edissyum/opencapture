/**
 * PdfFontMetrics.ts class for EJ2-PDF
 */
import { PdfStringFormat } from './pdf-string-format';
import { PdfArray } from './../../primitives/pdf-array';
/**
 * `Metrics` of the font.
 * @private
 */
export declare class PdfFontMetrics {
    /**
     * Gets `ascent` of the font.
     * @private
     */
    ascent: number;
    /**
     * Gets `descent` of the font.
     * @private
     */
    descent: number;
    /**
     * `Name` of the font.
     * @private
     */
    name: string;
    /**
     * Gets `PostScript` Name of the  font.
     * @private
     */
    postScriptName: string;
    /**
     * Gets `size` of the font.
     * @private
     */
    size: number;
    /**
     * Gets `height` of the font.
     * @private
     */
    height: number;
    /**
     * `First char` of the font.
     * @private
     */
    firstChar: number;
    /**
     * `Last char` of the font.
     * @private
     */
    lastChar: number;
    /**
     * `Line gap`.
     * @private
     */
    lineGap: number;
    /**
     * `Subscript` size factor.
     * @private
     */
    subScriptSizeFactor: number;
    /**
     * `Superscript` size factor.
     * @private
     */
    superscriptSizeFactor: number;
    /**
     * Gets `table` of glyphs` width.
     * @private
     */
    internalWidthTable: WidthTable;
    /**
     * Checks whether is it `unicode font` or not.
     * @private
     */
    isUnicodeFont: boolean;
    /**
     * Indicate whether the true type font reader font has bold style.
     */
    isBold: boolean;
    /**
     * Returns `ascent` taking into consideration font`s size.
     * @private
     */
    getAscent(format: PdfStringFormat): number;
    /**
     * Returns `descent` taking into consideration font`s size.
     * @private
     */
    getDescent(format: PdfStringFormat): number;
    /**
     * Returns `Line gap` taking into consideration font`s size.
     * @private
     */
    getLineGap(format: PdfStringFormat): number;
    /**
     * Returns `height` taking into consideration font`s size.
     * @private
     */
    getHeight(format: PdfStringFormat): number;
    /**
     * Calculates `size` of the font depending on the subscript/superscript value.
     * @private
     */
    getSize(format: PdfStringFormat): number;
    /**
     * `Clones` the metrics.
     * @private
     */
    clone(): PdfFontMetrics;
    /**
     * Gets or sets the `width table`.
     * @private
     */
    widthTable: WidthTable;
}
export declare abstract class WidthTable {
    /**
     * Returns the `width` of the specific index.
     * @private
     */
    abstract items(index: number): number;
    /**
     * `Clones` this instance of the WidthTable class.
     * @private
     */
    abstract clone(): WidthTable;
    /**
     * Static `clones` this instance of the WidthTable class.
     * @private
     */
    static clone(): WidthTable;
}
export declare class StandardWidthTable extends WidthTable {
    /**
     * The `widths` of the supported characters.
     * @private
     */
    private widths;
    /**
     * Gets the `32 bit number` at the specified index.
     * @private
     */
    items(index: number): number;
    /**
     * Gets the `length` of the internal array.
     * @private
     */
    readonly length: number;
    /**
     * Initializes a new instance of the `StandardWidthTable` class.
     * @private
     */
    constructor(widths: number[]);
    /**
     * `Clones` this instance of the WidthTable class.
     * @private
     */
    clone(): WidthTable;
    /**
     * Converts width table to a `PDF array`.
     * @private
     */
    toArray(): PdfArray;
}
