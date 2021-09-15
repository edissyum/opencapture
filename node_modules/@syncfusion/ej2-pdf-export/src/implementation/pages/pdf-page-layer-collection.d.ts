/**
 * PdfPageLayerCollection.ts class for EJ2-PDF
 */
import { PdfPageBase } from './pdf-page-base';
import { PdfDictionary } from './../primitives/pdf-dictionary';
import { PdfPageLayer } from './pdf-page-layer';
import { PdfCollection } from './../general/pdf-collection';
/**
 * The class provides methods and properties to handle the collections of `PdfPageLayer`.
 */
export declare class PdfPageLayerCollection extends PdfCollection {
    /**
     * Parent `page`.
     * @private
     */
    private page;
    /**
     * Stores the `number of first level layers` in the document.
     * @default 0
     * @private
     */
    private parentLayerCount;
    /**
     * Indicates if `Sublayer` is present.
     * @default false
     * @private
     */
    sublayer: boolean;
    /**
     * Stores the `optional content dictionary`.
     * @private
     */
    optionalContent: PdfDictionary;
    /**
     * Return the `PdfLayer` from the layer collection by index.
     * @private
     */
    items(index: number): PdfPageLayer;
    /**
     * Stores the `layer` into layer collection with specified index.
     * @private
     */
    items(index: number, value: PdfPageLayer): void;
    /**
     * Initializes a new instance of the `PdfPageLayerCollection` class
     * @private
     */
    constructor();
    /**
     * Initializes a new instance of the `PdfPageLayerCollection` class
     * @private
     */
    constructor(page: PdfPageBase);
    /**
     * Creates a new `PdfPageLayer` and adds it to the end of the collection.
     * @private
     */
    add(): PdfPageLayer;
    /**
     * Creates a new `PdfPageLayer` and adds it to the end of the collection.
     * @private
     */
    add(layerName: string, visible: boolean): PdfPageLayer;
    /**
     * Creates a new `PdfPageLayer` and adds it to the end of the collection.
     * @private
     */
    add(layerName: string): PdfPageLayer;
    /**
     * Creates a new `PdfPageLayer` and adds it to the end of the collection.
     * @private
     */
    add(layer: PdfPageLayer): number;
    /**
     * Registers `layer` at the page.
     * @private
     */
    private addLayer;
    /**
     * Inserts `PdfPageLayer` into the collection at specified index.
     * @private
     */
    insert(index: number, layer: PdfPageLayer): void;
    /**
     * Registers layer at the page.
     * @private
     */
    private insertLayer;
    /**
     * `Parses the layers`.
     * @private
     */
    private parseLayers;
    /**
     * Returns `index of` the `PdfPageLayer` in the collection if exists, -1 otherwise.
     * @private
     */
    indexOf(layer: PdfPageLayer): number;
}
