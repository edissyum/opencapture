import { PdfPageBase } from './pdf-page-base';
import { PdfDocument } from './../document/pdf-document';
import { PdfSection } from './pdf-section';
import { PdfCrossTable } from './../input-output/pdf-cross-table';
import { SizeF, PointF } from './../drawing/pdf-drawing';
import { PdfAnnotationCollection } from './../annotations/annotation-collection';
import { PdfGraphics } from './../graphics/pdf-graphics';
/**
 * Provides methods and properties to create pages and its elements.
 * `PdfPage` class inherited from the `PdfPageBase` class.
 * ```typescript
 * // create a new PDF document
 * let document : PdfDocument = new PdfDocument();
 * //
 * // add a new page to the document
 * let page1 : PdfPage = document.pages.add();
 * //
 * // set the font
 * let font : PdfStandardFont = new PdfStandardFont(PdfFontFamily.Helvetica, 20);
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
export declare class PdfPage extends PdfPageBase {
    /**
     * Checks whether the `progress is on`.
     * @hidden
     * @private
     */
    private isProgressOn;
    /**
     * Stores the instance of `PdfAnnotationCollection` class.
     * @hidden
     * @default null
     * @private
     */
    private annotationCollection;
    /**
     * Stores the instance of `PageBeginSave` event for Page Number Field.
     * @default null
     * @private
     */
    beginSave: Function;
    /**
     * Initialize the new instance for `PdfPage` class.
     * @private
     */
    constructor();
    /**
     * Gets current `document`.
     * @private
     */
    readonly document: PdfDocument;
    /**
     * Get the current `graphics`.
     * ```typescript
     * // create a new PDF document
     * let document : PdfDocument = new PdfDocument();
     * // add a new page to the document
     * let page1 : PdfPage = document.pages.add();
     * //
     * // get graphics
     * let graphics : PdfGraphics = page1.graphics;
     * //
     * // set the font
     * let font : PdfStandardFont = new PdfStandardFont(PdfFontFamily.Helvetica, 20);
     * // create black brush
     * let blackBrush : PdfSolidBrush = new PdfSolidBrush(new PdfColor(0, 0, 0));
     * // draw the text
     * graphics.drawString('Hello World', font, blackBrush, new PointF(0, 0));
     * // save the document
     * document.save('output.pdf');
     * // destroy the document
     * document.destroy();
     * ```
     */
    readonly graphics: PdfGraphics;
    /**
     * Gets the `cross table`.
     * @private
     */
    readonly crossTable: PdfCrossTable;
    /**
     * Gets the size of the PDF page- Read only.
     * @public
     */
    readonly size: SizeF;
    /**
     * Gets the `origin` of the page.
     * @private
     */
    readonly origin: PointF;
    /**
     * Gets a collection of the `annotations` of the page- Read only.
     * @private
     */
    readonly annotations: PdfAnnotationCollection;
    /**
     * `Initializes` a page.
     * @private
     */
    private initialize;
    /**
     * Sets parent `section` to the page.
     * @private
     */
    setSection(section: PdfSection): void;
    /**
     * `Resets the progress`.
     * @private
     */
    resetProgress(): void;
    /**
     * Get the page size reduced by page margins and page template dimensions.
     * ```typescript
     * // create a new PDF document
     * let document : PdfDocument = new PdfDocument();
     * // add a pages to the document
     * let page1 : PdfPage = document.pages.add();
     * // create new standard font
     * let font : PdfStandardFont = new PdfStandardFont(PdfFontFamily.Helvetica, 20);
     * // set brush
     * let blackBrush : PdfSolidBrush = new PdfSolidBrush(new PdfColor(0, 0, 0));
     * //
     * // set the specified point using `getClientSize` method
     * let point : PointF = new PointF(page1.getClientSize().width - 200, page1.getClientSize().height - 200);
     * // draw the text
     * page1.graphics.drawString('Hello World', font, blackBrush, point);
     * //
     * // save the document
     * document.save('output.pdf');
     * // destroy the document
     * document.destroy();
     * ```
     */
    getClientSize(): SizeF;
    /**
     * Helper method to retrive the instance of `PageBeginSave` event for header and footer elements.
     * @private
     */
    pageBeginSave(): void;
    /**
     * Helper method to draw template elements.
     * @private
     */
    private drawPageTemplates;
}
