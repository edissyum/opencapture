/**
 * PdfTextElement.ts class for EJ2-PDF
 */
import { PdfLayoutElement } from './../figures/layout-element';
import { PdfBrush } from './../brushes/pdf-brush';
import { PdfFont } from './../fonts/pdf-font';
import { PdfPen } from './../pdf-pen';
import { PdfStringFormat } from './../fonts/pdf-string-format';
import { PdfLayoutParams, PdfLayoutResult } from './../figures/base/element-layouter';
import { RectangleF, PointF } from './../../drawing/pdf-drawing';
import { PdfPage } from './../../pages/pdf-page';
import { PdfLayoutFormat } from './base/element-layouter';
/**
 * `PdfTextElement` class represents the text area with the ability to span several pages
 * and inherited from the 'PdfLayoutElement' class.
 * @private
 */
export declare class PdfTextElement extends PdfLayoutElement {
    /**
     * `Text` data.
     * @private
     */
    private content;
    /**
     * `Value` of text data.
     * @private
     */
    private elementValue;
    /**
     * `Pen` for text drawing.
     * @private
     */
    private pdfPen;
    /**
     * `Brush` for text drawing.
     * @private
     */
    private pdfBrush;
    /**
     * `Font` for text drawing.
     * @private
     */
    private pdfFont;
    /**
     * Text `format`.
     * @private
     */
    private format;
    /**
     * indicate whether the drawText with PointF overload is called or not.
     * @default false
     * @private
     */
    private hasPointOverload;
    /**
     * indicate whether the PdfGridCell value is `PdfTextElement`
     * @default false
     * @private
     */
    isPdfTextElement: boolean;
    /**
     * Initializes a new instance of the `PdfTextElement` class.
     * @private
     */
    constructor();
    /**
     * Initializes a new instance of the `PdfTextElement` class with text to draw into the PDF.
     * @private
     */
    constructor(text: string);
    /**
     * Initializes a new instance of the `PdfTextElement` class with the text and `PdfFont`.
     * @private
     */
    constructor(text: string, font: PdfFont);
    /**
     * Initializes a new instance of the `PdfTextElement` class with text,`PdfFont` and `PdfPen`.
     * @private
     */
    constructor(text: string, font: PdfFont, pen: PdfPen);
    /**
     * Initializes a new instance of the `PdfTextElement` class with text,`PdfFont` and `PdfBrush`.
     * @private
     */
    constructor(text: string, font: PdfFont, brush: PdfBrush);
    /**
     * Initializes a new instance of the `PdfTextElement` class with text,`PdfFont`,`PdfPen`,`PdfBrush` and `PdfStringFormat`.
     * @private
     */
    constructor(text: string, font: PdfFont, pen: PdfPen, brush: PdfBrush, format: PdfStringFormat);
    /**
     * Gets or sets a value indicating the `text` that should be printed.
     * ```typescript
     * // create a new PDF document.
     * let document : PdfDocument = new PdfDocument();
     * // add a page to the document.
     * let page1 : PdfPage = document.pages.add();
     * // create the font
     * let font : PdfFont = new PdfStandardFont(PdfFontFamily.Helvetica, 12);
     * // create the Text Web Link
     * let textLink : PdfTextWebLink = new PdfTextWebLink();
     * // set the hyperlink
     * textLink.url = 'http://www.google.com';
     * //
     * // set the link text
     * textLink.text = 'Google';
     * //
     * // set the font
     * textLink.font = font;
     * // draw the hyperlink in PDF page
     * textLink.draw(page1, new PointF(10, 40));
     * // save the document.
     * document.save('output.pdf');
     * // destroy the document
     * document.destroy();
     * ```
     */
    text: string;
    /**
     * Gets or sets a `value` indicating the text that should be printed.
     * @private
     */
    readonly value: string;
    /**
     * Gets or sets a `PdfPen` that determines the color, width, and style of the text
     * @private
     */
    pen: PdfPen;
    /**
     * Gets or sets the `PdfBrush` that will be used to draw the text with color and texture.
     * @private
     */
    brush: PdfBrush;
    /**
     * Gets or sets a `PdfFont` that defines the text format.
     * ```typescript
     * // create a new PDF document.
     * let document : PdfDocument = new PdfDocument();
     * // add a page to the document.
     * let page1 : PdfPage = document.pages.add();
     * // create the font
     * let font : PdfFont = new PdfStandardFont(PdfFontFamily.Helvetica, 12);
     * // create the Text Web Link
     * let textLink : PdfTextWebLink = new PdfTextWebLink();
     * // set the hyperlink
     * textLink.url = 'http://www.google.com';
     * // set the link text
     * textLink.text = 'Google';
     * //
     * // set the font
     * textLink.font = font;
     * //
     * // draw the hyperlink in PDF page
     * textLink.draw(page1, new PointF(10, 40));
     * // save the document.
     * document.save('output.pdf');
     * // destroy the document
     * document.destroy();
     * ```
     */
    font: PdfFont;
    /**
     * Gets or sets the `PdfStringFormat` that will be used to set the string format
     * @private
     */
    stringFormat: PdfStringFormat;
    /**
     * Gets a `brush` for drawing.
     * @private
     */
    getBrush(): PdfBrush;
    /**
     * `Layouts` the element.
     * @private
     */
    protected layout(param: PdfLayoutParams): PdfLayoutResult;
    /**
     * `Draws` the element on the page with the specified page and "PointF" class
     * @private
     */
    drawText(page: PdfPage, location: PointF): PdfLayoutResult;
    /**
     * `Draws` the element on the page with the specified page and pair of coordinates
     * @private
     */
    drawText(page: PdfPage, x: number, y: number): PdfLayoutResult;
    /**
     * `Draws` the element on the page with the specified page and "RectangleF" class
     * @private
     */
    drawText(page: PdfPage, layoutRectangle: RectangleF): PdfLayoutResult;
    /**
     * `Draws` the element on the page with the specified page, "PointF" class and layout format
     * @private
     */
    drawText(page: PdfPage, location: PointF, format: PdfLayoutFormat): PdfLayoutResult;
    /**
     * `Draws` the element on the page with the specified page, pair of coordinates and layout format
     * @private
     */
    drawText(page: PdfPage, x: number, y: number, format: PdfLayoutFormat): PdfLayoutResult;
    /**
     * `Draws` the element on the page.
     * @private
     */
    drawText(page: PdfPage, layoutRectangle: RectangleF, embedFonts: boolean): PdfLayoutResult;
    /**
     * `Draws` the element on the page with the specified page, "RectangleF" class and layout format
     * @private
     */
    drawText(page: PdfPage, layoutRectangle: RectangleF, format: PdfLayoutFormat): PdfLayoutResult;
    private calculateResultBounds;
}
