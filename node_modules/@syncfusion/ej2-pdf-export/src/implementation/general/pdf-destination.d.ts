/**
 * PdfDestination.ts class for EJ2-PDF
 */
import { IPdfWrapper } from './../../interfaces/i-pdf-wrapper';
import { IPdfPrimitive } from './../../interfaces/i-pdf-primitives';
import { PointF, RectangleF } from './../drawing/pdf-drawing';
import { PdfPageBase } from './../pages/pdf-page-base';
import { PdfDestinationMode } from './../general/enum';
import { DictionaryProperties } from './../input-output/pdf-dictionary-properties';
/**
 * `PdfDestination` class represents an anchor in the document
 * where bookmarks or annotations can direct when clicked.
 */
export declare class PdfDestination implements IPdfWrapper {
    /**
     * Internal variable for accessing fields from `DictionryProperties` class.
     * @private
     */
    protected dictionaryProperties: DictionaryProperties;
    /**
     * Type of the `destination`.
     * @private
     */
    private destinationMode;
    /**
     * `Zoom` factor.
     * @private
     * @default 0
     */
    private zoomFactor;
    /**
     * `Location` of the destination.
     * @default new PointF() with 0 ,0 as co-ordinates
     * @private
     */
    private destinationLocation;
    /**
     * `Bounds` of the destination as RectangleF.
     * @default RectangleF.Empty
     * @private
     */
    private bounds;
    /**
     * Parent `page` reference.
     * @private
     */
    private pdfPage;
    /**
     * Pdf primitive representing `this` object.
     * @private
     */
    private array;
    /**
     * Initializes a new instance of the `PdfDestination` class with page object.
     * @private
     */
    constructor(page: PdfPageBase);
    /**
     * Initializes a new instance of the `PdfDestination` class with page object and location.
     * @private
     */
    constructor(page: PdfPageBase, location: PointF);
    /**
     * Initializes a new instance of the `PdfDestination` class with page object and bounds.
     * @private
     */
    constructor(page: PdfPageBase, rectangle: RectangleF);
    /**
     * Gets and Sets the `zoom` factor.
     * @private
     */
    zoom: number;
    /**
     * Gets and Sets the `page` object.
     * @private
     */
    page: PdfPageBase;
    /**
     * Gets and Sets the destination `mode`.
     * @private
     */
    mode: PdfDestinationMode;
    /**
     * Gets and Sets the `location`.
     * @private
     */
    location: PointF;
    /**
     * `Translates` co-ordinates to PDF co-ordinate system (lower/left).
     * @private
     */
    private pointToNativePdf;
    /**
     * `In fills` array by correct values.
     * @private
     */
    private initializePrimitive;
    /**
     * Gets the `element` representing this object.
     * @private
     */
    readonly element: IPdfPrimitive;
}
