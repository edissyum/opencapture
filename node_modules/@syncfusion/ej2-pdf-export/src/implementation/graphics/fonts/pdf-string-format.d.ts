/**
 * PdfStringFormat.ts class for EJ2-PDF
 */
import { PdfTextAlignment, PdfVerticalAlignment, PdfTextDirection } from './../../graphics/enum';
import { PdfSubSuperScript, PdfWordWrapType } from './../../graphics/fonts/enum';
/**
 * `PdfStringFormat` class represents the text layout information on PDF.
 * ```typescript
 * // create a new PDF document
 * let document : PdfDocument = new PdfDocument();
 * // add a pages to the document
 * let page1 : PdfPage = document.pages.add();
 * // set font
 * let font : PdfStandardFont = new PdfStandardFont(PdfFontFamily.Helvetica, 20);
 * // set brush
 * let blackBrush : PdfSolidBrush = new PdfSolidBrush(new PdfColor(0, 0, 0));
 * //
 * // set the format for string
 * let stringFormat : PdfStringFormat = new PdfStringFormat();
 * // set the text alignment
 * stringFormat.alignment = PdfTextAlignment.Center;
 * // set the vertical alignment
 * stringFormat.lineAlignment = PdfVerticalAlignment.Middle;
 * //
 * // draw the text
 * page1.graphics.drawString('Hello World', font, blackBrush, new PointF(10, 10), stringFormat);
 * // save the document
 * document.save('output.pdf');
 * // destroy the document
 * document.destroy();
 * ```
 */
export declare class PdfStringFormat {
    /**
     * `Horizontal text alignment`.
     * @private
     */
    private textAlignment;
    /**
     * `Vertical text alignment`.
     * @private
     */
    private verticalAlignment;
    /**
     * Indicates whether `RTL` should be checked.
     * @private
     */
    private isRightToLeft;
    /**
     * `Character spacing` value.
     * @private
     */
    private internalCharacterSpacing;
    /**
     * `Word spacing` value.
     * @private
     */
    private internalWordSpacing;
    /**
     * Text `leading`.
     * @private
     */
    private leading;
    /**
     * Shows if the text should be a part of the current `clipping` path.
     * @private
     */
    private clip;
    /**
     * Indicates whether the text is in `subscript or superscript` mode.
     * @private
     */
    private pdfSubSuperScript;
    /**
     * The `scaling factor` of the text being drawn.
     * @private
     */
    private scalingFactor;
    /**
     * Indent of the `first line` in the text.
     * @private
     */
    private initialLineIndent;
    /**
     * Indent of the `first line` in the paragraph.
     * @private
     */
    private internalParagraphIndent;
    /**
     * Indicates whether entire lines are laid out in the formatting rectangle only or not[`line limit`].
     * @private
     */
    private internalLineLimit;
    /**
     * Indicates whether spaces at the end of the line should be left or removed[`measure trailing spaces`].
     * @private
     */
    private trailingSpaces;
    /**
     * Indicates whether the text region should be `clipped` or not.
     * @private
     */
    private isNoClip;
    /**
     * Indicates text `wrapping` type.
     * @private
     */
    wordWrapType: PdfWordWrapType;
    private direction;
    /**
     * Initializes a new instance of the `PdfStringFormat` class.
     * @private
     */
    constructor();
    /**
     * Initializes a new instance of the `PdfStringFormat` class with horizontal alignment of a text.
     * @private
     */
    constructor(alignment: PdfTextAlignment);
    /**
     * Initializes a new instance of the `PdfStringFormat` class with column format.
     * @private
     */
    constructor(columnFormat: string);
    /**
     * Initializes a new instance of the `PdfStringFormat` class with horizontal and vertical alignment.
     * @private
     */
    constructor(alignment: PdfTextAlignment, lineAlignment: PdfVerticalAlignment);
    /**
     * Gets or sets the `horizontal` text alignment
     * ```typescript
     * // create a new PDF document
     * let document : PdfDocument = new PdfDocument();
     * // add a pages to the document
     * let page1 : PdfPage = document.pages.add();
     * // set font
     * let font : PdfStandardFont = new PdfStandardFont(PdfFontFamily.Helvetica, 20);
     * // set brush
     * let blackBrush : PdfSolidBrush = new PdfSolidBrush(new PdfColor(0, 0, 0));
     * //
     * // set the format for string
     * let stringFormat : PdfStringFormat = new PdfStringFormat();
     * // set the text alignment
     * stringFormat.alignment = PdfTextAlignment.Center;
     * //
     * // draw the text
     * page1.graphics.drawString('Hello World', font, blackBrush, new PointF(10, 10), stringFormat);
     * // save the document
     * document.save('output.pdf');
     * // destroy the document
     * document.destroy();
     * ```
     */
    alignment: PdfTextAlignment;
    textDirection: PdfTextDirection;
    /**
     * Gets or sets the `vertical` text alignment.
     * ```typescript
     * // create a new PDF document
     * let document : PdfDocument = new PdfDocument();
     * // add a pages to the document
     * let page1 : PdfPage = document.pages.add();
     * // set font
     * let font : PdfStandardFont = new PdfStandardFont(PdfFontFamily.Helvetica, 20);
     * // set brush
     * let blackBrush : PdfSolidBrush = new PdfSolidBrush(new PdfColor(0, 0, 0));
     * //
     * // set the format for string
     * let stringFormat : PdfStringFormat = new PdfStringFormat();
     * // set the vertical alignment
     * stringFormat.lineAlignment = PdfVerticalAlignment.Middle;
     * //
     * // draw the text
     * page1.graphics.drawString('Hello World', font, blackBrush, new PointF(10, 10), stringFormat);
     * // save the document
     * document.save('output.pdf');
     * // destroy the document
     * document.destroy();
     * ```
     */
    lineAlignment: PdfVerticalAlignment;
    /**
     * Gets or sets the value that indicates text `direction` mode.
     * @private
     */
    rightToLeft: boolean;
    /**
     * Gets or sets value that indicates a `size` among the characters in the text.
     * ```typescript
     * // create a new PDF document
     * let document : PdfDocument = new PdfDocument();
     * // add a pages to the document
     * let page1 : PdfPage = document.pages.add();
     * // set font
     * let font : PdfStandardFont = new PdfStandardFont(PdfFontFamily.Helvetica, 20);
     * // set brush
     * let blackBrush : PdfSolidBrush = new PdfSolidBrush(new PdfColor(0, 0, 0));
     * //
     * // set the format for string
     * let stringFormat : PdfStringFormat = new PdfStringFormat();
     * // set character spacing
     * stringFormat.characterSpacing = 10;
     * //
     * // draw the text
     * page1.graphics.drawString('Hello World', font, blackBrush, new PointF(10, 10), stringFormat);
     * // save the document
     * document.save('output.pdf');
     * // destroy the document
     * document.destroy();
     * ```
     */
    characterSpacing: number;
    /**
     * Gets or sets value that indicates a `size` among the words in the text.
     * ```typescript
     * // create a new PDF document
     * let document : PdfDocument = new PdfDocument();
     * // add a pages to the document
     * let page1 : PdfPage = document.pages.add();
     * // set font
     * let font : PdfStandardFont = new PdfStandardFont(PdfFontFamily.Helvetica, 20);
     * // set brush
     * let blackBrush : PdfSolidBrush = new PdfSolidBrush(new PdfColor(0, 0, 0));
     * //
     * // set the format for string
     * let stringFormat : PdfStringFormat = new PdfStringFormat();
     * // set word spacing
     * stringFormat.wordSpacing = 10;
     * //
     * // draw the text
     * page1.graphics.drawString('Hello World', font, blackBrush, new PointF(10, 10), stringFormat);
     * // save the document
     * document.save('output.pdf');
     * // destroy the document
     * document.destroy();
     * ```
     */
    wordSpacing: number;
    /**
     * Gets or sets value that indicates the `vertical distance` between the baselines of adjacent lines of text.
     * ```typescript
     * // create a new PDF document
     * let document : PdfDocument = new PdfDocument();
     * // add a pages to the document
     * let page1 : PdfPage = document.pages.add();
     * // set font
     * let font : PdfStandardFont = new PdfStandardFont(PdfFontFamily.Helvetica, 20);
     * // set brush
     * let blackBrush : PdfSolidBrush = new PdfSolidBrush(new PdfColor(0, 0, 0));
     * // set string
     * let text : string = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor
     * incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitati';
     * // set rectangle bounds
     * let rectangle : RectangleF = new RectangleF({x : 0, y : 0}, {width : 300, height : 100})
     * //
     * // set the format for string
     * let stringFormat : PdfStringFormat = new PdfStringFormat();
     * // set line spacing
     * stringFormat.lineSpacing = 10;
     * //
     * // draw the text
     * page1.graphics.drawString(text, font, blackBrush, rectangle, stringFormat);
     * // save the document
     * document.save('output.pdf');
     * // destroy the document
     * document.destroy();
     * ```
     */
    lineSpacing: number;
    /**
     * Gets or sets a value indicating whether the text is `clipped` or not.
     * @private
     */
    clipPath: boolean;
    /**
     * Gets or sets value indicating whether the text is in `subscript or superscript` mode.
     * @private
     */
    subSuperScript: PdfSubSuperScript;
    /**
     * Gets or sets the `indent` of the first line in the paragraph.
     * @private
     */
    paragraphIndent: number;
    /**
     * Gets or sets a value indicating whether [`line limit`].
     * @private
     */
    lineLimit: boolean;
    /**
     * Gets or sets a value indicating whether [`measure trailing spaces`].
     * @private
     */
    measureTrailingSpaces: boolean;
    /**
     * Gets or sets a value indicating whether [`no clip`].
     * @private
     */
    noClip: boolean;
    /**
     * Gets or sets value indicating type of the text `wrapping`.
     * @private
     */
    wordWrap: PdfWordWrapType;
    /**
     * Gets or sets the `scaling factor`.
     * @private
     */
    horizontalScalingFactor: number;
    /**
     * Gets or sets the `indent` of the first line in the text.
     * @private
     */
    firstLineIndent: number;
    /**
     * `Clones` the object.
     * @private
     */
    clone(): Object;
}
