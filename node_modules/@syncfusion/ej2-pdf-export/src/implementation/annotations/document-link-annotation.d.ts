import { PdfLinkAnnotation } from './link-annotation';
import { RectangleF } from './../drawing/pdf-drawing';
import { PdfDestination } from './../general/pdf-destination';
/**
 * `PdfDocumentLinkAnnotation` class represents an annotation object with holds link on another location within a document.
 * ```typescript
 * // create a new PDF document
 * let document : PdfDocument = new PdfDocument();
 * // create new pages
 * let page1 : PdfPage = document.pages.add();
 * let page2 : PdfPage = document.pages.add();
 * // create a new rectangle
 * let bounds : RectangleF = new RectangleF({x : 10, y : 200}, {width : 300, height : 25});
 * //
 * // create a new document link annotation
 * let documentLinkAnnotation : PdfDocumentLinkAnnotation = new PdfDocumentLinkAnnotation(bounds);
 * // set the annotation text
 * documentLinkAnnotation.text = 'Document link annotation';
 * // set the destination
 * documentLinkAnnotation.destination = new PdfDestination(page2);
 * // set the documentlink annotation location
 * documentLinkAnnotation.destination.location = new PointF(10, 0);
 * // add this annotation to a new page
 * page1.annotations.add(documentLinkAnnotation);
 * //
 * // save the document to disk
 * document.save('output.pdf');
 * // destroy the document
 * document.destroy();
 * ```
 */
export declare class PdfDocumentLinkAnnotation extends PdfLinkAnnotation {
    /**
     * `Destination` of the annotation.
     * @default null
     * @private
     */
    private pdfDestination;
    /**
     * Gets or sets the `destination` of the annotation.
     * ```typescript
     * // create a new PDF document
     * let document : PdfDocument = new PdfDocument();
     * // create new pages
     * let page1 : PdfPage = document.pages.add();
     * let page2 : PdfPage = document.pages.add();
     * // create a new rectangle
     * let bounds : RectangleF = new RectangleF({x : 10, y : 200}, {width : 300, height : 25});
     * //
     * // create a new document link annotation
     * let documentLinkAnnotation : PdfDocumentLinkAnnotation = new PdfDocumentLinkAnnotation(bounds);
     * // set the annotation text
     * documentLinkAnnotation.text = 'Document link annotation';
     * // set the destination
     * documentLinkAnnotation.destination = new PdfDestination(page2);
     * // set the documentlink annotation location
     * documentLinkAnnotation.destination.location = new PointF(10, 0);
     * // add this annotation to a new page
     * page1.annotations.add(documentLinkAnnotation);
     * //
     * // save the document to disk
     * document.save('output.pdf');
     * // destroy the document
     * document.destroy();
     * ```
     * @default null
     */
    destination: PdfDestination;
    /**
     * Initializes new `PdfDocumentLinkAnnotation` instance with specified bounds.
     * @private
     */
    constructor(rectangle: RectangleF);
    /**
     * Initializes new `PdfDocumentLinkAnnotation` instance with specified bounds and destination.
     * @private
     */
    constructor(rectangle: RectangleF, destination: PdfDestination);
    /**
     * `Saves` annotation object.
     * @private
     */
    save(): void;
    /**
     * `Clone` the document link annotation.
     * @private
     */
    clone(): PdfDocumentLinkAnnotation;
}
