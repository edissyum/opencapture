/**
 * PdfUriAnnotation.ts class for EJ2-PDF
 */
import { PdfAction } from './../actions/action';
import { RectangleF } from './../drawing/pdf-drawing';
import { PdfActionLinkAnnotation } from './action-link-annotation';
import { PdfUriAction } from './../actions/uri-action';
/**
 * `PdfUriAnnotation` class represents the Uri annotation.
 * @private
 */
export declare class PdfUriAnnotation extends PdfActionLinkAnnotation {
    /**
     * Internal variable to store `acton` for the annotation.
     * @private
     */
    private pdfUriAction;
    /**
     * Get `action` of the annotation.
     * @private
     */
    readonly uriAction: PdfUriAction;
    /**
     * Gets or sets the `Uri` address.
     * @private
     */
    uri: string;
    /**
     * Gets or sets the `action`.
     * @private
     */
    action: PdfAction;
    /**
     * Initializes a new instance of the `PdfUriAnnotation` class with specified bounds.
     * @private
     */
    constructor(rectangle: RectangleF);
    /**
     * Initializes a new instance of the `PdfUriAnnotation` class with specified bounds and URI.
     * @private
     */
    constructor(rectangle: RectangleF, uri: string);
    /**
     * `Initializes` annotation object.
     * @private
     */
    protected initialize(): void;
}
