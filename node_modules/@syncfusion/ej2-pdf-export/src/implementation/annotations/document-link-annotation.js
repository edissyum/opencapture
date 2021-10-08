var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
import { PdfLinkAnnotation } from './link-annotation';
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
var PdfDocumentLinkAnnotation = /** @class */ (function (_super) {
    __extends(PdfDocumentLinkAnnotation, _super);
    function PdfDocumentLinkAnnotation(rectangle, destination) {
        var _this = _super.call(this, rectangle) || this;
        // Fields
        /**
         * `Destination` of the annotation.
         * @default null
         * @private
         */
        _this.pdfDestination = null;
        if (typeof destination !== 'undefined') {
            _this.destination = destination;
        }
        return _this;
    }
    Object.defineProperty(PdfDocumentLinkAnnotation.prototype, "destination", {
        // Properties
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
        get: function () {
            return this.pdfDestination;
        },
        set: function (value) {
            // if (this.pdfDestination !== value) {
            this.pdfDestination = value;
            // }
        },
        enumerable: true,
        configurable: true
    });
    // Implementation
    /**
     * `Saves` annotation object.
     * @private
     */
    PdfDocumentLinkAnnotation.prototype.save = function () {
        _super.prototype.save.call(this);
        if (this.pdfDestination != null) {
            this.dictionary.items.setValue(this.dictionaryProperties.dest, this.pdfDestination.element);
        }
    };
    /**
     * `Clone` the document link annotation.
     * @private
     */
    PdfDocumentLinkAnnotation.prototype.clone = function () {
        var annot = new PdfDocumentLinkAnnotation(this.bounds, this.destination);
        annot.color = this.color;
        annot.brush = this.brush;
        annot.destination = this.destination;
        annot.font = this.font;
        return annot;
    };
    return PdfDocumentLinkAnnotation;
}(PdfLinkAnnotation));
export { PdfDocumentLinkAnnotation };
