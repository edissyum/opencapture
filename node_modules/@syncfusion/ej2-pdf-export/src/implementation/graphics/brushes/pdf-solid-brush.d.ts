import { PdfColor } from './../pdf-color';
import { PdfStreamWriter } from './../../input-output/pdf-stream-writer';
import { GetResourceEventHandler } from './../pdf-graphics';
import { PdfColorSpace } from './../enum';
import { PdfBrush } from './pdf-brush';
/**
 * Represents a brush that fills any object with a solid color.
 * ```typescript
 * // create a new PDF document
 * let document : PdfDocument = new PdfDocument();
 * // add a pages to the document
 * let page1 : PdfPage = document.pages.add();
 * // set font
 * let font : PdfStandardFont = new PdfStandardFont(PdfFontFamily.Helvetica, 20);
 * // set brush
 * let blackBrush : PdfSolidBrush = new PdfSolidBrush(new PdfColor(0, 0, 0));
 * // draw the text
 * page1.graphics.drawString('Hello World', font, blackBrush, new PointF(10, 10));
 * // save the document
 * document.save('output.pdf');
 * // destroy the document
 * document.destroy();
 * ```
 */
export declare class PdfSolidBrush extends PdfBrush {
    /**
     * The `colour` of the brush.
     * @private
     */
    pdfColor: PdfColor;
    /**
     * Indicates if the brush is `immutable`.
     * @private
     */
    private bImmutable;
    /**
     * The `color space` of the brush.
     * @private
     */
    private colorSpace;
    /**
     * Initializes a new instance of the `PdfSolidBrush` class.
     * ```typescript
     * // create a new PDF document
     * let document : PdfDocument = new PdfDocument();
     * // add a pages to the document
     * let page1 : PdfPage = document.pages.add();
     * // set font
     * let font : PdfStandardFont = new PdfStandardFont(PdfFontFamily.Helvetica, 20);
     * // set brush
     * let blackBrush : PdfSolidBrush = new PdfSolidBrush(new PdfColor(0, 0, 0));
     * // draw the text
     * page1.graphics.drawString('Hello World', font, blackBrush, new PointF(10, 10));
     * // save the document
     * document.save('output.pdf');
     * // destroy the document
     * document.destroy();
     * ```
     * @param color color of the brush
     */
    constructor(color: PdfColor);
    /**
     * Gets or sets the `color` of the brush.
     * @private
     */
    color: PdfColor;
    /**
     * `Monitors` the changes of the brush and modify PDF state respectively.
     * @private
     */
    monitorChanges(brush: PdfBrush, streamWriter: PdfStreamWriter, getResources: GetResourceEventHandler, saveChanges: boolean, currentColorSpace: PdfColorSpace): boolean;
    /**
     * `Resets` the changes, which were made by the brush.
     * @private
     */
    resetChanges(streamWriter: PdfStreamWriter): void;
}
