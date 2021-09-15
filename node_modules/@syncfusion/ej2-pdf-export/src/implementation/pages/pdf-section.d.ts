/**
 * PdfSection.ts class for EJ2-PDF
 */
import { PdfDocument } from './../document/pdf-document';
import { PdfDocumentBase } from './../document/pdf-document-base';
import { PdfPageSettings } from './pdf-page-settings';
import { PdfPage } from './pdf-page';
import { PageAddedEventArgs } from './page-added-event-arguments';
import { PdfPageBase } from './pdf-page-base';
import { PdfPageOrientation, PdfPageRotateAngle } from './enum';
import { PdfArray } from './../primitives/pdf-array';
import { IPdfWrapper } from './../../interfaces/i-pdf-wrapper';
import { IPdfPrimitive } from './../../interfaces/i-pdf-primitives';
import { IPdfWriter } from './../../interfaces/i-pdf-writer';
import { PdfSectionCollection } from './pdf-section-collection';
import { PdfSectionPageCollection } from './pdf-section-page-collection';
import { PointF, RectangleF, SizeF } from './../drawing/pdf-drawing';
import { PdfSectionTemplate } from './pdf-section-templates';
import { PdfPageLayer } from './pdf-page-layer';
/**
 * Represents a `section` entity. A section it's a set of the pages with similar page settings.
 */
export declare class PdfSection implements IPdfWrapper {
    /**
     * @hidden
     * @private
     */
    private pageAdded;
    /**
     * the parent `document`.
     * @private
     */
    private pdfDocument;
    /**
     * Page `settings` of the pages in the section.
     * @private
     */
    private settings;
    /**
     * Internal variable to store `initial page settings`.
     * @private
     */
    initialSettings: PdfPageSettings;
    /**
     * @hidden
     * @private
     */
    pagesReferences: PdfArray;
    /**
     * @hidden
     * @private
     */
    private section;
    /**
     * @hidden
     * @private
     */
    private pageCount;
    /**
     * @hidden
     * @private
     */
    private sectionCollection;
    /**
     * @hidden
     * @private
     */
    private pdfPages;
    /**
     * Indicates if the `progress is turned on`.
     * @private
     */
    private isProgressOn;
    /**
     * Page `template` for the section.
     * @private
     */
    private pageTemplate;
    /**
     * @hidden
     * @private
     */
    private dictionaryProperties;
    /**
     * A virtual `collection of pages`.
     * @private
     */
    private pagesCollection;
    /**
     * Stores the information about the page settings of the current section.
     * @private
     */
    private state;
    /**
     * Initializes a new instance of the `PdfSection` class.
     * @private
     */
    constructor(document: PdfDocument);
    /**
     * Initializes a new instance of the `PdfSection` class.
     * @private
     */
    constructor(document: PdfDocument, pageSettings: PdfPageSettings);
    /**
     * Gets or sets the `parent`.
     * @private
     */
    parent: PdfSectionCollection;
    /**
     * Gets the `parent document`.
     * @private
     */
    readonly parentDocument: PdfDocumentBase;
    /**
     * Gets or sets the `page settings` of the section.
     * @private
     */
    pageSettings: PdfPageSettings;
    /**
     * Gets the wrapped `element`.
     * @private
     */
    readonly element: IPdfPrimitive;
    /**
     * Gets the `count` of the pages in the section.
     * @private
     */
    readonly count: number;
    /**
     * Gets or sets a `template` for the pages in the section.
     * @private
     */
    template: PdfSectionTemplate;
    /**
     * Gets the `document`.
     * @private
     */
    readonly document: PdfDocument;
    /**
     * Gets the collection of `pages` in a section (Read only)
     * @private
     */
    readonly pages: PdfSectionPageCollection;
    /**
     * `Return the page collection` of current section.
     * @private
     */
    getPages(): PdfPageBase[];
    /**
     * `Translates` point into native coordinates of the page.
     * @private
     */
    pointToNativePdf(page: PdfPage, point: PointF): PointF;
    /**
     * Sets the page setting of the current section.
     * @public
     * @param settings Instance of `PdfPageSettings`
     */
    setPageSettings(settings: PdfPageSettings): void;
    /**
     * `Initializes` the object.
     * @private
     */
    private initialize;
    /**
     * Checks whether any template should be printed on this layer.
     * @private
     * @param document The parent document.
     * @param page The parent page.
     * @param foreground Layer z-order.
     * @returns True - if some content should be printed on the layer, False otherwise.
     */
    containsTemplates(document: PdfDocument, page: PdfPage, foreground: boolean): boolean;
    /**
     * Returns array of the document templates.
     * @private
     * @param document The parent document.
     * @param page The parent page.
     * @param foreground If true - return foreground templates, if false - return background templates.
     * @returns Returns array of the document templates.
     */
    private getDocumentTemplates;
    /**
     * Returns array of the section templates.
     * @private
     * @param page The parent page.
     * @param foreground If true - return foreground templates, if false - return background templates.
     * @returns Returns array of the section templates.
     */
    private getSectionTemplates;
    /**
     * `Adds` the specified page.
     * @private
     */
    add(page?: PdfPage): void | PdfPage;
    /**
     * `Checks the presence`.
     * @private
     */
    private checkPresence;
    /**
     * `Determines` whether the page in within the section.
     * @private
     */
    contains(page: PdfPage): boolean;
    /**
     * Get the `index of` the page.
     * @private
     */
    indexOf(page: PdfPage): number;
    /**
     * Call two event's methods.
     * @hidden
     * @private
     */
    private pageAddedMethod;
    /**
     * Called when the page has been added.
     * @hidden
     * @private
     */
    protected onPageAdded(args: PageAddedEventArgs): void;
    /**
     * Calculates actual `bounds` of the page.
     * @private
     */
    getActualBounds(page: PdfPage, includeMargins: boolean): RectangleF;
    /**
     * Calculates actual `bounds` of the page.
     * @private
     */
    getActualBounds(document: PdfDocument, page: PdfPage, includeMargins: boolean): RectangleF;
    /**
     * Calculates width of the `left indent`.
     * @private
     */
    getLeftIndentWidth(document: PdfDocument, page: PdfPage, includeMargins: boolean): number;
    /**
     * Calculates `Height` of the top indent.
     * @private
     */
    getTopIndentHeight(document: PdfDocument, page: PdfPage, includeMargins: boolean): number;
    /**
     * Calculates `width` of the right indent.
     * @private
     */
    getRightIndentWidth(document: PdfDocument, page: PdfPage, includeMargins: boolean): number;
    /**
     * Calculates `Height` of the bottom indent.
     * @private
     */
    getBottomIndentHeight(document: PdfDocument, page: PdfPage, includeMargins: boolean): number;
    /**
     * `Removes` the page from the section.
     * @private
     */
    remove(page: PdfPage): void;
    /**
     * In fills dictionary by the data from `Page settings`.
     * @private
     */
    private applyPageSettings;
    /**
     * Catches the Save event of the dictionary.
     * @hidden
     * @private
     */
    beginSave(state: PageSettingsState, writer: IPdfWriter): void;
    /**
     * Draws page templates on the page.
     * @private
     */
    drawTemplates(page: PdfPage, layer: PdfPageLayer, document: PdfDocument, foreground: boolean): void;
    /**
     * Draws page templates on the page.
     * @private
     */
    private drawTemplatesHelper;
}
export declare class PageSettingsState {
    /**
     * @hidden
     * @private
     */
    private pageOrientation;
    /**
     * @hidden
     * @private
     */
    private pageRotate;
    /**
     * @hidden
     * @private
     */
    private pageSize;
    /**
     * @hidden
     * @private
     */
    private pageOrigin;
    /**
     * @hidden
     * @private
     */
    orientation: PdfPageOrientation;
    /**
     * @hidden
     * @private
     */
    rotate: PdfPageRotateAngle;
    /**
     * @hidden
     * @private
     */
    size: SizeF;
    /**
     * @hidden
     * @private
     */
    origin: PointF;
    /**
     * New instance to store the `PageSettings`.
     * @private
     */
    constructor(document: PdfDocument);
}
