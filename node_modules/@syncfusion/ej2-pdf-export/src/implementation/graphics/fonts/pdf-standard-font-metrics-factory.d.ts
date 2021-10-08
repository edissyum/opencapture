/**
 * PdfStandardFontMetricsFactory.ts class for EJ2-PDF
 */
import { PdfFontStyle, PdfFontFamily } from './enum';
import { PdfFontMetrics } from './pdf-font-metrics';
/**
 * @private
 * `Factory of the standard fonts metrics`.
 */
export declare class PdfStandardFontMetricsFactory {
    /**
     * `Multiplier` os subscript superscript.
     * @private
     */
    private static readonly subSuperScriptFactor;
    /**
     * `Ascender` value for the font.
     * @private
     */
    private static readonly helveticaAscent;
    /**
     * `Ascender` value for the font.
     * @private
     */
    private static readonly helveticaDescent;
    /**
     * `Font type`.
     * @private
     */
    private static readonly helveticaName;
    /**
     * `Ascender` value for the font.
     * @private
     */
    private static readonly helveticaBoldAscent;
    /**
     * `Ascender` value for the font.
     * @private
     */
    private static readonly helveticaBoldDescent;
    /**
     * `Font type`.
     * @private
     */
    private static readonly helveticaBoldName;
    /**
     * `Ascender` value for the font.
     * @private
     */
    private static readonly helveticaItalicAscent;
    /**
     * `Ascender` value for the font.
     * @private
     */
    private static readonly helveticaItalicDescent;
    /**
     * `Font type`.
     * @private
     */
    private static readonly helveticaItalicName;
    /**
     * `Ascender` value for the font.
     * @private
     */
    private static readonly helveticaBoldItalicAscent;
    /**
     * `Ascender` value for the font.
     * @private
     */
    private static readonly helveticaBoldItalicDescent;
    /**
     * `Font type`.
     * @private
     */
    private static readonly helveticaBoldItalicName;
    /**
     * `Ascender` value for the font.
     * @private
     */
    private static readonly courierAscent;
    /**
     * `Ascender` value for the font.
     * @private
     */
    private static readonly courierDescent;
    /**
     * `Font type`.
     * @private
     */
    private static readonly courierName;
    /**
     * `Ascender` value for the font.
     * @private
     */
    private static readonly courierBoldAscent;
    /**
     * `Ascender` value for the font.
     * @private
     */
    private static readonly courierBoldDescent;
    /**
     * `Font type`.
     * @private
     */
    private static readonly courierBoldName;
    /**
     * `Ascender` value for the font.
     * @private
     */
    private static readonly courierItalicAscent;
    /**
     * `Ascender` value for the font.
     * @private
     */
    private static readonly courierItalicDescent;
    /**
     * `Font type`.
     * @private
     */
    private static readonly courierItalicName;
    /**
     * `Ascender` value for the font.
     * @private
     */
    private static readonly courierBoldItalicAscent;
    /**
     * `Ascender` value for the font.
     * @private
     */
    private static readonly courierBoldItalicDescent;
    /**
     * `Font type`.
     * @private
     */
    private static readonly courierBoldItalicName;
    /**
     * `Ascender` value for the font.
     * @private
     */
    private static readonly timesAscent;
    /**
     * `Ascender` value for the font.
     * @private
     */
    private static readonly timesDescent;
    /**
     * `Font type`.
     * @private
     */
    private static readonly timesName;
    /**
     * `Ascender` value for the font.
     * @private
     */
    private static readonly timesBoldAscent;
    /**
     * `Ascender` value for the font.
     * @private
     */
    private static readonly timesBoldDescent;
    /**
     * `Font type`.
     * @private
     */
    private static readonly timesBoldName;
    /**
     * `Ascender` value for the font.
     * @private
     */
    private static readonly timesItalicAscent;
    /**
     * `Ascender` value for the font.
     * @private
     */
    private static readonly timesItalicDescent;
    /**
     * `Font type`.
     * @private
     */
    private static readonly timesItalicName;
    /**
     * `Ascender` value for the font.
     * @private
     */
    private static readonly timesBoldItalicAscent;
    /**
     * `Ascender` value for the font.
     * @private
     */
    private static readonly timesBoldItalicDescent;
    /**
     * `Font type`.
     * @private
     */
    private static readonly timesBoldItalicName;
    /**
     * `Ascender` value for the font.
     * @private
     */
    private static readonly symbolAscent;
    /**
     * `Ascender` value for the font.
     * @private
     */
    private static readonly symbolDescent;
    /**
     * `Font type`.
     * @private
     */
    private static readonly symbolName;
    /**
     * `Ascender` value for the font.
     * @private
     */
    private static readonly zapfDingbatsAscent;
    /**
     * `Ascender` value for the font.
     * @private
     */
    private static readonly zapfDingbatsDescent;
    /**
     * `Font type`.
     * @private
     */
    private static readonly zapfDingbatsName;
    /**
     * `Arial` widths table.
     * @private
     */
    private static arialWidth;
    /**
     * `Arial bold` widths table.
     * @private
     */
    private static arialBoldWidth;
    /**
     * `Fixed` widths table.
     * @private
     */
    private static fixedWidth;
    /**
     * `Times` widths table.
     * @private
     */
    private static timesRomanWidth;
    /**
     * `Times bold` widths table.
     * @private
     */
    private static timesRomanBoldWidth;
    /**
     * `Times italic` widths table.
     * @private
     */
    private static timesRomanItalicWidth;
    /**
     * `Times bold italic` widths table.
     * @private
     */
    static timesRomanBoldItalicWidths: number[];
    /**
     * `Symbol` widths table.
     * @private
     */
    private static symbolWidth;
    /**
     * `Zip dingbats` widths table.
     * @private
     */
    private static zapfDingbatsWidth;
    /**
     * Returns `metrics` of the font.
     * @private
     */
    static getMetrics(fontFamily: PdfFontFamily, fontStyle: PdfFontStyle, size: number): PdfFontMetrics;
    /**
     * Creates `Helvetica font metrics`.
     * @private
     */
    private static getHelveticaMetrics;
    /**
     * Creates `Courier font metrics`.
     * @private
     */
    private static getCourierMetrics;
    /**
     * Creates `Times font metrics`.
     * @private
     */
    private static getTimesMetrics;
    /**
     * Creates `Symbol font metrics`.
     * @private
     */
    private static getSymbolMetrics;
    /**
     * Creates `ZapfDingbats font metrics`.
     * @private
     */
    private static getZapfDingbatsMetrics;
}
