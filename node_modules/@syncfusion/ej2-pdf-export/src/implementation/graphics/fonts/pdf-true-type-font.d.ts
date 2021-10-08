/**
 * PdfTrueTypeFont.ts class for EJ2-PDF
 */
import { UnicodeTrueTypeFont } from './unicode-true-type-font';
import { PdfFont } from './pdf-font';
import { PdfStringFormat } from './pdf-string-format';
import { PdfFontStyle } from './enum';
export declare class PdfTrueTypeFont extends PdfFont {
    /**
     * Internal font object.
     * @private
     */
    fontInternal: UnicodeTrueTypeFont;
    /**
     * Indicates whether the font is embedded or not.
     * @private
     */
    isEmbedFont: boolean;
    /**
     * Indicates whether the font is unicoded or not.
     * @private
     */
    isUnicode: boolean;
    /**
     * Initializes a new instance of the `PdfTrueTypeFont` class.
     * @private
     */
    constructor(base64String: string, size: number);
    constructor(base64String: string, size: number, style: PdfFontStyle);
    protected equalsToFont(font: PdfFont): boolean;
    getLineWidth(line: string, format: PdfStringFormat): number;
    /**
     * Returns width of the char.
     */
    getCharWidth(charCode: string, format: PdfStringFormat): number;
    createFontInternal(base64String: string, style: PdfFontStyle): void;
    private calculateStyle;
    private initializeInternals;
    /**
     * Stores used symbols.
     */
    setSymbols(text: string): void;
    /**
     * Property
     *
     */
    readonly Unicode: boolean;
    private getUnicodeLineWidth;
}
