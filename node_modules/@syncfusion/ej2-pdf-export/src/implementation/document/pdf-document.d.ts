import { StreamWriter } from '@syncfusion/ej2-file-utils';
import { PdfDocumentBase } from './pdf-document-base';
import { PdfPageSettings } from './../pages/pdf-page-settings';
import { PdfSectionCollection } from './../pages/pdf-section-collection';
import { PdfDocumentPageCollection } from './../pages/pdf-document-page-collection';
import { PdfCacheCollection } from './../general/pdf-cache-collection';
import { PdfColorSpace } from './../graphics/enum';
import { PdfDocumentTemplate } from './pdf-document-template';
import { PdfFont } from './../graphics/fonts/pdf-font';
/**
 * Represents a PDF document and can be used to create a new PDF document from the scratch.
 * ```typescript
 * // create a new PDF document
 * let document : PdfDocument = new PdfDocument();
 * // add a new page to the document
 * let page1 : PdfPage = document.pages.add();
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
export declare class PdfDocument extends PdfDocumentBase {
    /**
     * `Cache` of the objects.
     * @private
     */
    private static cacheCollection;
    /**
     * Default `margin` value.
     * @default 40.0
     * @private
     */
    readonly defaultMargin: number;
    /**
     * Default page `settings`.
     * @private
     */
    private settings;
    /**
     * Internal variable to store document`s collection of `sections`.
     * @private
     */
    private sectionCollection;
    /**
     * Internal variable to store document`s collection of `pages`.
     * @private
     */
    private documentPageCollection;
    /**
     * Internal variable to store instance of `StreamWriter` classes..
     * @default null
     * @private
     */
    streamWriter: StreamWriter;
    /**
     * Defines the `color space` of the document
     * @private
     */
    private pdfColorSpace;
    /**
     * Internal variable to store `template` which is applied to each page of the document.
     * @private
     */
    private pageTemplate;
    /**
     * `Font` used in complex objects to draw strings and text when it is not defined explicitly.
     * @default null
     * @private
     */
    private static defaultStandardFont;
    /**
     * Indicates whether enable cache or not
     * @default true
     * @private
     */
    private static isCacheEnabled;
    /**
     * Initializes a new instance of the `PdfDocument` class.
     * @public
     */
    constructor();
    /**
     * Initializes a new instance of the `PdfDocument` class.
     * @private
     */
    constructor(isMerging: boolean);
    /**
     * Gets the `default font`. It is used for complex objects when font is not explicitly defined.
     * @private
     */
    static readonly defaultFont: PdfFont;
    /**
     * Gets the collection of the `sections` in the document.
     * @private
     */
    readonly sections: PdfSectionCollection;
    /**
     * Gets the document's page setting.
     * @public
     */
    /**
    * Sets the document's page setting.
    * ```typescript
    * // create a new PDF document
    * let document : PdfDocument = new PdfDocument();
    *
    * // sets the right margin of the page
    * document.pageSettings.margins.right = 0;
    * // set the page size.
    * document.pageSettings.size = new SizeF(500, 500);
    * // change the page orientation to landscape
    * document.pageSettings.orientation = PdfPageOrientation.Landscape;
    * // apply 90 degree rotation on the page
    * document.pageSettings.rotate = PdfPageRotateAngle.RotateAngle90;
    *
    * // add a pages to the document
    * let page1 : PdfPage = document.pages.add();
    * // set font
    * let font : PdfStandardFont = new PdfStandardFont(PdfFontFamily.Helvetica, 20);
    * // set brush
    * let blackBrush : PdfSolidBrush = new PdfSolidBrush(new PdfColor(0, 0, 0));
    * // set the specified Point
    * let point : PointF = new PointF(page1.getClientSize().width - 200, page1.getClientSize().height - 200);
    * // draw the text
    * page1.graphics.drawString('Hello World', font, blackBrush, point);
    * // save the document
    * document.save('output.pdf');
    * // destroy the document
    * document.destroy();
    * ```
    */
    pageSettings: PdfPageSettings;
    /**
     * Represents the collection of pages in the PDF document.
     * ```typescript
     * // create a new PDF document
     * let document : PdfDocument = new PdfDocument();
     * //
     * // get the collection of pages in the document
     * let pageCollection : PdfDocumentPageCollection  = document.pages;
     * //
     * // add pages
     * let page1 : PdfPage = pageCollection.add();
     * // save the document
     * document.save('output.pdf');
     * // destroy the document
     * document.destroy();
     * ```
     */
    readonly pages: PdfDocumentPageCollection;
    /**
     * Gets collection of the `cached objects`.
     * @private
     */
    /**
    * Sets collection of the `cached objects`.
    * @private
    */
    static cache: PdfCacheCollection;
    /**
     * Gets the value of enable cache.
     * @private
     */
    /**
    * Sets thie value of enable cache.
    * @private
    */
    static enableCache: boolean;
    /**
     * Gets or sets the `color space` of the document. This property can be used to create PDF document in RGB, Gray scale or CMYK color spaces.
     * @private
     */
    colorSpace: PdfColorSpace;
    /**
     * Gets or sets a `template` to all pages in the document.
     * @private
     */
    template: PdfDocumentTemplate;
    /**
     * Saves the document to the specified output stream and return the stream as Blob.
     * @private
     */
    docSave(stream: StreamWriter, isBase: boolean): Blob;
    /**
     * Saves the document to the specified output stream.
     * @private
     */
    docSave(stream: StreamWriter, filename: string, isBase: boolean): void;
    /**
     * Checks the pages `presence`.
     * @private
     */
    private checkPagesPresence;
    /**
     * disposes the current instance of `PdfDocument` class.
     * ```typescript
     * // create a new PDF document
     * let document : PdfDocument = new PdfDocument();
     * // add a new page to the document
     * let page1 : PdfPage = document.pages.add();
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
    destroy(): void;
}
