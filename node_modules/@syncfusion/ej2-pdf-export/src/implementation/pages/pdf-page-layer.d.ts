/**
 * PdfPageLayer.ts class for EJ2-PDF
 */
import { IPdfWrapper } from './../../interfaces/i-pdf-wrapper';
import { IPdfPrimitive } from './../../interfaces/i-pdf-primitives';
import { PdfPageBase } from './pdf-page-base';
import { PdfStream } from './../primitives/pdf-stream';
import { PdfDictionary } from './../primitives/pdf-dictionary';
import { PdfGraphics } from './../graphics/pdf-graphics';
import { PdfPageLayerCollection } from './pdf-page-layer-collection';
import { PdfColorSpace } from './../graphics/enum';
/**
 * The `PdfPageLayer` used to create layers in PDF document.
 * @private
 */
export declare class PdfPageLayer implements IPdfWrapper {
    /**
     * Parent `page` of the layer.
     * @private
     */
    private pdfPage;
    /**
     * `Graphics context` of the layer.
     * @private
     */
    private pdfGraphics;
    /**
     * `Content` of the object.
     * @private
     */
    private content;
    /**
     * Indicates whether the layer should `clip page template` dimensions or not.
     * @private
     */
    private clipPageTemplates;
    /**
     * Local Variable to store the `color space` of the document.
     * @private
     */
    private pdfColorSpace;
    /**
     * Local Variable to store the `layer id`.
     * @private
     */
    private layerid;
    /**
     * Local Variable to store the `name`.
     * @private
     */
    private layerName;
    /**
     * Local Variable to set `visibility`.
     * @default true
     * @private
     */
    private isVisible;
    /**
     * Collection of the `layers` of the page.
     * @private
     */
    private layer;
    /**
     * Indicates if `Sublayer` is present.
     * @default false
     * @private
     */
    sublayer: boolean;
    /**
     * Local variable to store `length` of the graphics.
     * @default 0
     * @private
     */
    contentLength: number;
    /**
     * Stores the `print Option` dictionary.
     * @private
     */
    printOption: PdfDictionary;
    /**
     * Stores the `usage` dictionary.
     * @private
     */
    usage: PdfDictionary;
    /**
     * Instance for `PdfDictionaryProperties` Class.
     * @private
     */
    private dictionaryProperties;
    /**
     * Get or set the `color space`.
     * @private
     */
    colorSpace: PdfColorSpace;
    /**
     * Gets parent `page` of the layer.
     * @private
     */
    readonly page: PdfPageBase;
    /**
     * Gets and Sets the `id of the layer`.
     * @private
     */
    layerId: string;
    /**
     * Gets or sets the `name` of the layer.
     * @private
     */
    name: string;
    /**
     * Gets or sets the `visibility` of the layer.
     * @private
     */
    visible: boolean;
    /**
     * Gets `Graphics` context of the layer, used to draw various graphical content on layer.
     * @private
     */
    readonly graphics: PdfGraphics;
    /**
     * Gets the collection of `PdfPageLayer`, this collection handle by the class 'PdfPageLayerCollection'.
     * @private
     */
    readonly layers: PdfPageLayerCollection;
    /**
     * Initializes a new instance of the `PdfPageLayer` class with specified PDF page.
     * @private
     */
    constructor(page: PdfPageBase);
    /**
     * Initializes a new instance of the `PdfPageLayer` class with specified PDF page and PDF stream.
     * @private
     */
    constructor(page: PdfPageBase, stream: PdfStream);
    /**
     * Initializes a new instance of the `PdfPageLayer` class.
     * @private
     */
    constructor(page: PdfPageBase, clipPageTemplates: boolean);
    /**
     * `Adds` a new PDF Page layer.
     * @private
     */
    add(): PdfPageLayer;
    /**
     * Returns a value indicating the `sign` of a single-precision floating-point number.
     * @private
     */
    private sign;
    /**
     * `Initializes Graphics context` of the layer.
     * @private
     */
    private initializeGraphics;
    /**
     * Gets the wrapped `element`.
     * @private
     */
    readonly element: IPdfPrimitive;
}
