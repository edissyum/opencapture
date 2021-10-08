/**
 * PdfCatalog.ts class for EJ2-PDF
 */
import { PdfDictionary } from './../primitives/pdf-dictionary';
import { PdfSectionCollection } from './../pages/pdf-section-collection';
/**
 * `PdfCatalog` class represents internal catalog of the Pdf document.
 * @private
 */
export declare class PdfCatalog extends PdfDictionary {
    /**
     * Internal variable to store collection of `sections`.
     * @default null
     * @private
     */
    private sections;
    /**
     * Internal variable for accessing fields from `DictionryProperties` class.
     * @private
     */
    private tempDictionaryProperties;
    /**
     * Initializes a new instance of the `PdfCatalog` class.
     * @private
     */
    constructor();
    /**
     * Gets or sets the sections, which contain `pages`.
     * @private
     */
    pages: PdfSectionCollection;
}
