/**
 * PdfSectionTemplate.ts class for EJ2-PDF
 */
import { PdfDocumentTemplate } from './../document/pdf-document-template';
/**
 * Represents a `page template` for all the pages in the section.
 */
export declare class PdfSectionTemplate extends PdfDocumentTemplate {
    /**
     * `Left` settings.
     * @private
     */
    private leftValue;
    /**
     * `Top` settings.
     * @private
     */
    private topValue;
    /**
     * `Right` settings.
     * @private
     */
    private rightValue;
    /**
     * `Bottom` settings.
     * @private
     */
    private bottomValue;
    /**
     * `Other templates settings`.
     * @private
     */
    private stampValue;
    /**
     * Gets or sets value indicating whether parent `Left page template should be used or not`.
     * @private
     */
    applyDocumentLeftTemplate: boolean;
    /**
     * Gets or sets value indicating whether parent `Top page template should be used or not`.
     * @private
     */
    applyDocumentTopTemplate: boolean;
    /**
     * Gets or sets value indicating whether parent `Right page template should be used or not`.
     * @private
     */
    applyDocumentRightTemplate: boolean;
    /**
     * Gets or sets value indicating whether parent `Bottom page template should be used or not`.
     * @private
     */
    applyDocumentBottomTemplate: boolean;
    /**
     * Gets or sets value indicating whether the `stamp value` is true or not.
     * @private
     */
    applyDocumentStamps: boolean;
    /**
     * `Creates a new object`.
     * @private
     */
    constructor();
}
