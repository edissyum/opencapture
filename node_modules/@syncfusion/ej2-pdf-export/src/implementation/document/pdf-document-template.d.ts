/**
 * PdfDocumentTemplate.ts class for EJ2-PDF
 */
import { PdfPage } from './../pages/pdf-page';
import { PdfPageTemplateElement } from './../pages/pdf-page-template-element';
/**
 * `PdfDocumentTemplate` class encapsulates a page template for all the pages in the document.
 * @private
 */
export declare class PdfDocumentTemplate {
    /**
     * `Left` page template object.
     * @private
     */
    private leftTemplate;
    /**
     * `Top` page template object.
     * @private
     */
    private topTemplate;
    /**
     * `Right` page template object.
     * @private
     */
    private rightTemplate;
    /**
     * `Bottom` page template object.
     * @private
     */
    private bottomTemplate;
    /**
     * `EvenLeft` page template object.
     * @private
     */
    private evenLeft;
    /**
     * `EvenTop` page template object.
     * @private
     */
    private evenTop;
    /**
     * `EvenRight` page template object.
     * @private
     */
    private evenRight;
    /**
     * `EventBottom` page template object.
     * @private
     */
    private evenBottom;
    /**
     * `OddLeft` page template object.
     * @private
     */
    private oddLeft;
    /**
     * `OddTop` page template object.
     * @private
     */
    private oddTop;
    /**
     * `OddRight` page template object.
     * @private
     */
    private oddRight;
    /**
     * `OddBottom` page template object.
     * @private
     */
    private oddBottom;
    /**
     * `Left` page template object.
     * @public
     */
    left: PdfPageTemplateElement;
    /**
     * `Top` page template object.
     * @public
     */
    top: PdfPageTemplateElement;
    /**
     * `Right` page template object.
     * @public
     */
    right: PdfPageTemplateElement;
    /**
     * `Bottom` page template object.
     * @public
     */
    bottom: PdfPageTemplateElement;
    /**
     * `EvenLeft` page template object.
     * @public
     */
    EvenLeft: PdfPageTemplateElement;
    /**
     * `EvenTop` page template object.
     * @public
     */
    EvenTop: PdfPageTemplateElement;
    /**
     * `EvenRight` page template object.
     * @public
     */
    EvenRight: PdfPageTemplateElement;
    /**
     * `EvenBottom` page template object.
     * @public
     */
    EvenBottom: PdfPageTemplateElement;
    /**
     * `OddLeft` page template object.
     * @public
     */
    OddLeft: PdfPageTemplateElement;
    /**
     * `OddTop` page template object.
     * @public
     */
    OddTop: PdfPageTemplateElement;
    /**
     * `OddRight` page template object.
     * @public
     */
    OddRight: PdfPageTemplateElement;
    /**
     * `OddBottom` page template object.
     * @public
     */
    OddBottom: PdfPageTemplateElement;
    /**
     * Initializes a new instance of the `PdfDocumentTemplate` class.
     * @public
     */
    constructor();
    /**
     * Returns `left` template.
     * @public
     */
    getLeft(page: PdfPage): PdfPageTemplateElement;
    /**
     * Returns `top` template.
     * @public
     */
    getTop(page: PdfPage): PdfPageTemplateElement;
    /**
     * Returns `right` template.
     * @public
     */
    getRight(page: PdfPage): PdfPageTemplateElement;
    /**
     * Returns `bottom` template.
     * @public
     */
    getBottom(page: PdfPage): PdfPageTemplateElement;
    /**
     * Checks whether the page `is even`.
     * @private
     */
    private isEven;
    /**
     * Checks a `template element`.
     * @private
     */
    private checkElement;
}
