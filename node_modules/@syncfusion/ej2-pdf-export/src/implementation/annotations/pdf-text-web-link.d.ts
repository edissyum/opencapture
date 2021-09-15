import { PdfPage } from './../pages/pdf-page';
import { PdfGraphics } from './../graphics/pdf-graphics';
import { PointF, RectangleF } from './../drawing/pdf-drawing';
import { PdfTextElement } from './../graphics/figures/text-element';
import { PdfLayoutResult } from './../graphics/figures/base/element-layouter';
/**
 * `PdfTextWebLink` class represents the class for text web link annotation.
 * ```typescript
 * // create a new PDF document.
 * let document : PdfDocument = new PdfDocument();
 * // add a page to the document.
 * let page1 : PdfPage = document.pages.add();
 * // create the font
 * let font : PdfFont = new PdfStandardFont(PdfFontFamily.Helvetica, 12);
 * //
 * // create the Text Web Link
 * let textLink : PdfTextWebLink = new PdfTextWebLink();
 * // set the hyperlink
 * textLink.url = 'http://www.google.com';
 * // set the link text
 * textLink.text = 'Google';
 * // set the font
 * textLink.font = font;
 * // draw the hyperlink in PDF page
 * textLink.draw(page1, new PointF(10, 40));
 * //
 * // save the document.
 * document.save('output.pdf');
 * // destroy the document
 * document.destroy();
 * ```
 */
export declare class PdfTextWebLink extends PdfTextElement {
    /**
     * Internal variable to store `Url`.
     * @default ''
     * @private
     */
    private uniformResourceLocator;
    /**
     * Internal variable to store `Uri Annotation` object.
     * @default null
     * @private
     */
    private uriAnnotation;
    /**
     * Checks whether the drawTextWebLink method with `PointF` overload is called or not.
     * If it set as true, then the start position of each lines excluding firest line is changed as (0, Y).
     * @private
     * @hidden
     */
    private recalculateBounds;
    private defaultBorder;
    /**
     * Gets or sets the `Uri address`.
     * ```typescript
     * // create a new PDF document.
     * let document : PdfDocument = new PdfDocument();
     * // add a page to the document.
     * let page1 : PdfPage = document.pages.add();
     * // create the font
     * let font : PdfFont = new PdfStandardFont(PdfFontFamily.Helvetica, 12);
     * // create the Text Web Link
     * let textLink : PdfTextWebLink = new PdfTextWebLink();
     * //
     * // set the hyperlink
     * textLink.url = 'http://www.google.com';
     * //
     * // set the link text
     * textLink.text = 'Google';
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
    url: string;
    /**
     * Initializes a new instance of the `PdfTextWebLink` class.
     * @private
     */
    constructor();
    /**
     * `Draws` a Text Web Link on the Page with the specified location.
     * @private
     */
    draw(page: PdfPage, location: PointF): PdfLayoutResult;
    /**
     * `Draws` a Text Web Link on the Page with the specified bounds.
     * @private
     */
    draw(page: PdfPage, bounds: RectangleF): PdfLayoutResult;
    /**
     * `Draw` a Text Web Link on the Graphics with the specified location.
     * @private
     */
    draw(graphics: PdfGraphics, location: PointF): PdfLayoutResult;
    /**
     * `Draw` a Text Web Link on the Graphics with the specified bounds.
     * @private
     */
    draw(graphics: PdfGraphics, bounds: RectangleF): PdfLayoutResult;
    /**
     * Helper method `Draw` a Multiple Line Text Web Link on the Graphics with the specified location.
     * @private
     */
    private drawMultipleLineWithPoint;
    /**
     * Helper method `Draw` a Multiple Line Text Web Link on the Graphics with the specified bounds.
     * @private
     */
    private drawMultipleLineWithBounds;
    private calculateBounds;
}
