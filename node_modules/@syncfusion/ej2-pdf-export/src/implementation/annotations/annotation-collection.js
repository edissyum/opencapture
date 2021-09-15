import { PdfArray } from './../primitives/pdf-array';
import { PdfReferenceHolder } from './../primitives/pdf-reference';
import { DictionaryProperties } from './../input-output/pdf-dictionary-properties';
import { SizeF, RectangleF, PointF } from './../drawing/pdf-drawing';
import { PdfStringLayouter } from './../graphics/fonts/string-layouter';
import { PdfColorSpace } from './../graphics/enum';
/**
 * `PdfAnnotationCollection` class represents the collection of 'PdfAnnotation' objects.
 * @private
 */
var PdfAnnotationCollection = /** @class */ (function () {
    function PdfAnnotationCollection(page) {
        // Constants
        /**
         * `Error` constant message.
         * @private
         */
        this.alreadyExistsAnnotationError = 'This annotatation had been already added to page';
        /**
         * `Error` constant message.
         * @private
         */
        this.missingAnnotationException = 'Annotation is not contained in collection.';
        /**
         * Specifies the Internal variable to store fields of `PdfDictionaryProperties`.
         * @private
         */
        this.dictionaryProperties = new DictionaryProperties();
        /**
         * Array of the `annotations`.
         * @private
         */
        this.internalAnnotations = new PdfArray();
        /**
         * privte `list` for the annotations.
         * @private
         */
        this.lists = [];
        if (typeof page !== 'undefined') {
            this.page = page;
        }
    }
    Object.defineProperty(PdfAnnotationCollection.prototype, "annotations", {
        /**
         * Gets the `PdfAnnotation` object at the specified index. Read-Only.
         * @private
         */
        get: function () {
            return this.internalAnnotations;
        },
        set: function (value) {
            this.internalAnnotations = value;
        },
        enumerable: true,
        configurable: true
    });
    // Public methods
    /**
     * `Adds` a new annotation to the collection.
     * @private
     */
    PdfAnnotationCollection.prototype.add = function (annotation) {
        // this.SetPrint(annotation);
        this.doAdd(annotation);
    };
    /**
     * `Adds` a Annotation to collection.
     * @private
     */
    /* tslint:disable */
    PdfAnnotationCollection.prototype.doAdd = function (annotation) {
        if (typeof annotation.destination !== 'undefined') {
            var layout = new PdfStringLayouter();
            var layoutResult = layout.layout(annotation.text, annotation.font, annotation.stringFormat, new SizeF((annotation.bounds.width), 0), false, new SizeF(0, 0));
            var lastPosition = annotation.bounds.y;
            if (layoutResult.lines.length === 1) {
                var size = annotation.font.measureString(layoutResult.lines[0].text);
                annotation.bounds = new RectangleF(new PointF(annotation.bounds.x, lastPosition), size);
                annotation.text = layoutResult.lines[0].text;
                //Draw Annotation Text.
                this.page.graphics.drawString(annotation.text, annotation.font, null, annotation.brush, annotation.bounds.x, annotation.bounds.y, annotation.bounds.width, annotation.bounds.height, null);
                //Add annotation to dictionary.
                annotation.setPage(this.page);
                this.setColor(annotation);
                this.internalAnnotations.add(new PdfReferenceHolder(annotation));
                this.lists.push(annotation);
            }
            else {
                for (var i = 0; i < layoutResult.lines.length; i++) {
                    var size = annotation.font.measureString(layoutResult.lines[i].text);
                    if (i === 0) {
                        annotation.bounds = new RectangleF(annotation.bounds.x, lastPosition, size.width, size.height);
                        annotation.text = layoutResult.lines[i].text;
                        //Draw Annotation Text.
                        this.page.graphics.drawString(annotation.text, annotation.font, null, annotation.brush, annotation.bounds.x, lastPosition, size.width, size.height, null);
                        //Add annotation to dictionary.
                        annotation.setPage(this.page);
                        this.setColor(annotation);
                        this.internalAnnotations.add(new PdfReferenceHolder(annotation));
                        this.lists.push(annotation);
                        //Update y for drawing next line of the text.
                        lastPosition += annotation.bounds.height;
                    }
                    else {
                        var annot = annotation.clone();
                        annot.bounds = new RectangleF(new PointF(annotation.bounds.x, lastPosition), size);
                        annot.text = layoutResult.lines[i].text;
                        //Draw Annotation Text.
                        this.page.graphics.drawString(annot.text, annot.font, null, annot.brush, annot.bounds.x, annot.bounds.y, annot.bounds.width, annot.bounds.height, null);
                        //Add annotation to dictionary.
                        annot.setPage(this.page);
                        this.setColor(annot);
                        this.internalAnnotations.add(new PdfReferenceHolder(annot));
                        this.lists.push(annot);
                        //Update y for drawing next line of the text.
                        lastPosition += annot.bounds.height;
                    }
                }
            }
        }
        else {
            annotation.setPage(this.page);
            this.internalAnnotations.add(new PdfReferenceHolder(annotation));
            return this.lists.push(annotation);
        }
    };
    /* tslint:enable */
    /**
     * `Set a color of an annotation`.
     * @private
     */
    PdfAnnotationCollection.prototype.setColor = function (annotation) {
        var cs = PdfColorSpace.Rgb;
        var colours = annotation.color.toArray(cs);
        annotation.dictionary.items.setValue(this.dictionaryProperties.c, colours);
    };
    Object.defineProperty(PdfAnnotationCollection.prototype, "element", {
        // IPdfWrapper Members
        /**
         * Gets the `Element` representing this object.
         * @private
         */
        get: function () {
            return this.internalAnnotations;
        },
        enumerable: true,
        configurable: true
    });
    return PdfAnnotationCollection;
}());
export { PdfAnnotationCollection };
