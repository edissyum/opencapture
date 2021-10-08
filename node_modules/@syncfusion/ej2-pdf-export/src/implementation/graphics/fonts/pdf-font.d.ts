/**
 * PdfFont.ts class for EJ2-PDF
 */
import { PdfFontStyle } from './enum';
import { IPdfWrapper } from './../../../interfaces/i-pdf-wrapper';
import { IPdfPrimitive } from './../../../interfaces/i-pdf-primitives';
import { IPdfCache } from './../../../interfaces/i-pdf-cache';
import { SizeF } from './../../drawing/pdf-drawing';
import { PdfStringFormat } from './pdf-string-format';
import { PdfFontMetrics } from './pdf-font-metrics';
/**
 * Defines a particular format for text, including font face, size, and style attributes.
 * @private
 */
export declare abstract class PdfFont implements IPdfWrapper, IPdfCache {
    /**
     * `Multiplier` of the symbol width.
     * @default 0.001
     * @private
     */
    static readonly charSizeMultiplier: number;
    /**
     * `Synchronization` object.
     * @private
     */
    protected static syncObject: Object;
    /**
     * `Size` of the font.
     * @private
     */
    private fontSize;
    /**
     * `Style` of the font.
     * @private
     */
    private fontStyle;
    /**
     * `Metrics` of the font.
     * @private
     */
    private fontMetrics;
    /**
     * PDf `primitive` of the font.
     * @private
     */
    private pdfFontInternals;
    /**
     * Initializes a new instance of the `PdfFont` class.
     * @private
     */
    protected constructor(size: number);
    /**
     * Initializes a new instance of the `PdfFont` class.
     * @private
     */
    protected constructor(size: number, style: PdfFontStyle);
    /**
     * Gets the face name of this Font.
     * @private
     */
    readonly name: string;
    /**
     * Gets the size of this font.
     * @private
     */
    readonly size: number;
    /**
     * Gets the height of the font in points.
     * @private
     */
    readonly height: number;
    /**
     * Gets the style information for this font.
     * @private
     */
    style: PdfFontStyle;
    /**
     * Gets a value indicating whether this `PdfFont` is `bold`.
     * @private
     */
    readonly bold: boolean;
    /**
     * Gets a value indicating whether this `PdfFont` has the `italic` style applied.
     * @private
     */
    readonly italic: boolean;
    /**
     * Gets a value indicating whether this `PdfFont` is `strikeout`.
     * @private
     */
    readonly strikeout: boolean;
    /**
     * Gets a value indicating whether this `PdfFont` is `underline`.
     * @private
     */
    readonly underline: boolean;
    /**
     * Gets or sets the `metrics` for this font.
     * @private
     */
    metrics: PdfFontMetrics;
    /**
     * Gets the `element` representing the font.
     * @private
     */
    readonly element: IPdfPrimitive;
    /**
     * `Measures` a string by using this font.
     * @private
     */
    measureString(text: string): SizeF;
    /**
     * `Measures` a string by using this font.
     * @private
     */
    measureString(text: string, format: PdfStringFormat): SizeF;
    /**
     * `Measures` a string by using this font.
     * @private
     */
    measureString(text: string, format: PdfStringFormat, charactersFitted: number, linesFilled: number): SizeF;
    /**
     * `Measures` a string by using this font.
     * @private
     */
    measureString(text: string, width: number): SizeF;
    /**
     * `Measures` a string by using this font.
     * @private
     */
    measureString(text: string, width: number, format: PdfStringFormat): SizeF;
    /**
     * `Measures` a string by using this font.
     * @private
     */
    measureString(text: string, width: number, format: PdfStringFormat, charactersFitted: number, linesFilled: number): SizeF;
    /**
     * `Measures` a string by using this font.
     * @private
     */
    measureString(text: string, layoutArea: SizeF): SizeF;
    /**
     * `Measures` a string by using this font.
     * @private
     */
    measureString(text: string, layoutArea: SizeF, format: PdfStringFormat): SizeF;
    /**
     * `Measures` a string by using this font.
     * @private
     */
    measureString(text: string, layoutArea: SizeF, format: PdfStringFormat, charactersFitted: number, linesFilled: number): SizeF;
    /**
     * `Checks` whether the object is similar to another object.
     * @private
     */
    equalsTo(obj: IPdfCache): boolean;
    /**
     * Returns `internals` of the object.
     * @private
     */
    getInternals(): IPdfPrimitive;
    /**
     * Sets `internals` to the object.
     * @private
     */
    setInternals(internals: IPdfPrimitive): void;
    /**
     * `Checks` whether fonts are equals.
     * @private
     */
    protected abstract equalsToFont(font: PdfFont): boolean;
    /**
     * Returns `width` of the line.
     * @private
     */
    abstract getLineWidth(line: string, format: PdfStringFormat): number;
    /**
     * Sets the `style` of the font.
     * @private
     */
    protected setStyle(style: PdfFontStyle): void;
    /**
     * Applies `settings` to the default line width.
     * @private
     */
    protected applyFormatSettings(line: string, format: PdfStringFormat, width: number): number;
}
