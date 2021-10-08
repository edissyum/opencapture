import { PdfDictionary } from './../primitives/pdf-dictionary';
import { IPdfWrapper } from './../../interfaces/i-pdf-wrapper';
import { IPdfPrimitive } from './../../interfaces/i-pdf-primitives';
import { PdfArray } from './../primitives/pdf-array';
import { PointF, SizeF } from './../drawing/pdf-drawing';
import { PdfPageLayerCollection } from './pdf-page-layer-collection';
import { PdfPageLayer } from './pdf-page-layer';
import { DictionaryProperties } from './../input-output/pdf-dictionary-properties';
import { PdfResources } from './../graphics/pdf-resources';
import { PdfSection } from './pdf-section';
/**
 * The abstract base class for all pages,
 * `PdfPageBase` class provides methods and properties to create PDF pages and its elements.
 * @private
 */
export declare abstract class PdfPageBase implements IPdfWrapper {
    /**
     * Collection of the `layers` of the page.
     * @private
     */
    private layerCollection;
    /**
     * Stores the instance of `PdfDictionary` class.
     * @private
     */
    private pageDictionary;
    /**
     * `Index` of the default layer.
     * @default -1.
     * @private
     */
    private defLayerIndex;
    /**
     * Local variable to store if page `updated`.
     * @default false.
     * @private
     */
    private modified;
    /**
     * Stores the instance of `PdfResources`.
     * @hidden
     * @private
     */
    private resources;
    /**
     * Instance of `DictionaryProperties` class.
     * @hidden
     * @private
     */
    protected dictionaryProperties: DictionaryProperties;
    /**
     * Specifies the current `section`.
     * @hidden
     * @private
     */
    private pdfSection;
    /**
     * Gets the `section` of a page.
     * @private
     */
    section: PdfSection;
    /**
     * Gets the page `dictionary`.
     * @private
     */
    readonly dictionary: PdfDictionary;
    /**
     * Gets the wrapped `element`.
     * @private
     */
    readonly element: IPdfPrimitive;
    /**
     * Gets the `default layer` of the page (Read only).
     * @private
     */
    readonly defaultLayer: PdfPageLayer;
    /**
     * Gets or sets `index of the default layer`.
     * @private
     */
    /**
    * Gets or sets` index of the default layer`.
    * @private
    */
    defaultLayerIndex: number;
    /**
     * Gets the collection of the page's `layers` (Read only).
     * @private
     */
    readonly layers: PdfPageLayerCollection;
    /**
     * Return an instance of `PdfResources` class.
     * @private
     */
    getResources(): PdfResources;
    /**
     * Gets `array of page's content`.
     * @private
     */
    readonly contents: PdfArray;
    /**
     * Sets the `resources`.
     * @private
     */
    setResources(res: PdfResources): void;
    /**
     * Gets the `size of the page` (Read only).
     * @private
     */
    abstract readonly size: SizeF;
    /**
     * Gets the `origin of the page`.
     * @private
     */
    abstract readonly origin: PointF;
    /**
     * Initializes a new instance of the `PdfPageBase` class.
     * @private
     */
    constructor(dictionary: PdfDictionary);
}
