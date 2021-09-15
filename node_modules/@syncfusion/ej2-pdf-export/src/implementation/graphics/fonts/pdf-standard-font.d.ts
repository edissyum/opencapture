import { PdfFontFamily, PdfFontStyle } from './enum';
import { PdfFont } from './pdf-font';
import { PdfStringFormat } from './pdf-string-format';
/**
 * Represents one of the 14 standard fonts.
 * It's used to create a standard PDF font to draw the text in to the PDF.
 * ```typescript
 * // create a new PDF document
 * let document : PdfDocument = new PdfDocument();
 * // add a new page to the document
 * let page1 : PdfPage = document.pages.add();
 * //
 * // create new standard font
 * let font : PdfStandardFont = new PdfStandardFont(PdfFontFamily.Helvetica, 20);
 * //
 * // create black brush
 * let blackBrush : PdfSolidBrush = new PdfSolidBrush(new PdfColor(0, 0, 0));
 * // draw the text
 * page1.graphics.drawString('Hello World', font, blackBrush, new PointF(0, 0));
 * // save the document
 * document.save('output.pdf');
 * // destroy the document
 * document.destroy();
 * ```
 */
export declare class PdfStandardFont extends PdfFont {
    /**
     * First character `position`.
     * @private
     */
    private static readonly charOffset;
    /**
     * `FontFamily` of the font.
     * @private
     */
    private pdfFontFamily;
    /**
     * Gets `ascent` of the font.
     * @private
     */
    private dictionaryProperties;
    /**
     * Gets `encodings` for internal class use.
     * @hidden
     * @private
     */
    private encodings;
    /**
     * Initializes a new instance of the `PdfStandardFont` class with font family and it`s size.
     * ```typescript
     * // create a new PDF document
     * let document : PdfDocument = new PdfDocument();
     * // add a new page to the document
     * let page1 : PdfPage = document.pages.add();
     * // create black brush
     * let blackBrush : PdfSolidBrush = new PdfSolidBrush(new PdfColor(0, 0, 0));
     * // set the font with the font family and font size
     * let font : PdfStandardFont = new PdfStandardFont(PdfFontFamily.Helvetica, 20);
     * // draw the text
     * page1.graphics.drawString('Hello World', font, blackBrush, new PointF(0, 0));
     * // save the document
     * document.save('output.pdf');
     * // destroy the document
     * document.destroy();
     * ```
     * @param fontFamily Represents the font family to be used.
     * @param size Represents the size of the font.
     */
    constructor(fontFamily: PdfFontFamily, size: number);
    /**
     * Initializes a new instance of the `PdfStandardFont` class with font family, size and font style.
     * ```typescript
     * // create a new PDF document
     * let document : PdfDocument = new PdfDocument();
     * // add a pages to the document
     * let page1 : PdfPage = document.pages.add();
     * // set font
     * let font : PdfStandardFont = new PdfStandardFont(PdfFontFamily.Helvetica, 20, PdfFontStyle.Bold);
     * // set brush
     * let blackBrush : PdfSolidBrush = new PdfSolidBrush(new PdfColor(0, 0, 0));
     * // draw the text
     * page1.graphics.drawString('Hello World', font, blackBrush, new PointF(10, 10));
     * // save the document
     * document.save('output.pdf');
     * // destroy the document
     * document.destroy();
     * ```
     * @param fontFamily Represents the font family to be used.
     * @param size Represents the size of the font.
     * @param style Represents the font style.
     */
    constructor(fontFamily: PdfFontFamily, size: number, style: PdfFontStyle);
    /**
     * Initializes a new instance of the `PdfStandardFont` class with `PdfStandardFont` as prototype and font size.
     * @private
     */
    constructor(prototype: PdfStandardFont, size: number);
    /**
     * Initializes a new instance of the `PdfStandardFont` class with `PdfStandardFont` as prototype,font size and font style.
     * @private
     */
    constructor(prototype: PdfStandardFont, size: number, style: PdfFontStyle);
    /**
     * Gets the `FontFamily`.
     * @private
     */
    readonly fontFamily: PdfFontFamily;
    /**
     * Checks font `style` of the font.
     * @private
     */
    private checkStyle;
    /**
     * Returns `width` of the line.
     * @public
     */
    getLineWidth(line: string, format: PdfStringFormat): number;
    /**
     * Checks whether fonts are `equals`.
     * @private
     */
    protected equalsToFont(font: PdfFont): boolean;
    /**
     * `Initializes` font internals..
     * @private
     */
    private initializeInternals;
    /**
     * `Creates` font`s dictionary.
     * @private
     */
    private createInternals;
    /**
     * Returns `width` of the char. This methods doesn`t takes into consideration font`s size.
     * @private
     */
    private getCharWidthInternal;
    /**
     * `Converts` the specified text.
     * @private
     */
    static convert(text: string): string;
}
