import { PointF, RectangleF } from './../drawing/pdf-drawing';
import { PdfArray } from './../primitives/pdf-array';
import { PdfPageRotateAngle } from './../pages/enum';
import { PdfDestinationMode } from './../general/enum';
import { PdfReferenceHolder } from './../primitives/pdf-reference';
import { PdfName } from './../primitives/pdf-name';
import { PdfNumber } from './../primitives/pdf-number';
import { DictionaryProperties } from './../input-output/pdf-dictionary-properties';
/**
 * `PdfDestination` class represents an anchor in the document
 * where bookmarks or annotations can direct when clicked.
 */
var PdfDestination = /** @class */ (function () {
    function PdfDestination(arg1, arg2) {
        // Fields
        /**
         * Internal variable for accessing fields from `DictionryProperties` class.
         * @private
         */
        this.dictionaryProperties = new DictionaryProperties();
        /**
         * Type of the `destination`.
         * @private
         */
        this.destinationMode = PdfDestinationMode.Location;
        /**
         * `Zoom` factor.
         * @private
         * @default 0
         */
        this.zoomFactor = 0;
        /**
         * `Location` of the destination.
         * @default new PointF() with 0 ,0 as co-ordinates
         * @private
         */
        this.destinationLocation = new PointF(0, 0);
        /**
         * `Bounds` of the destination as RectangleF.
         * @default RectangleF.Empty
         * @private
         */
        this.bounds = new RectangleF();
        /**
         * Pdf primitive representing `this` object.
         * @private
         */
        this.array = new PdfArray();
        var angle = PdfPageRotateAngle.RotateAngle0;
        this.destinationLocation = new PointF(0, this.destinationLocation.y);
        this.pdfPage = arg1;
        if (arg2 instanceof PointF) {
            this.destinationLocation = arg2;
        }
        else {
            this.bounds = arg2;
        }
    }
    Object.defineProperty(PdfDestination.prototype, "zoom", {
        // Properties
        /**
         * Gets and Sets the `zoom` factor.
         * @private
         */
        get: function () {
            return this.zoomFactor;
        },
        set: function (value) {
            this.zoomFactor = value;
            this.initializePrimitive();
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PdfDestination.prototype, "page", {
        /**
         * Gets and Sets the `page` object.
         * @private
         */
        get: function () {
            return this.pdfPage;
        },
        set: function (value) {
            this.pdfPage = value;
            this.initializePrimitive();
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PdfDestination.prototype, "mode", {
        /**
         * Gets and Sets the destination `mode`.
         * @private
         */
        get: function () {
            return this.destinationMode;
        },
        set: function (value) {
            this.destinationMode = value;
            this.initializePrimitive();
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PdfDestination.prototype, "location", {
        /**
         * Gets and Sets the `location`.
         * @private
         */
        get: function () {
            return this.destinationLocation;
        },
        set: function (value) {
            this.destinationLocation = value;
            this.initializePrimitive();
        },
        enumerable: true,
        configurable: true
    });
    /**
     * `Translates` co-ordinates to PDF co-ordinate system (lower/left).
     * @private
     */
    PdfDestination.prototype.pointToNativePdf = function (page, point) {
        var section = page.section;
        return section.pointToNativePdf(page, point);
    };
    /**
     * `In fills` array by correct values.
     * @private
     */
    PdfDestination.prototype.initializePrimitive = function () {
        this.array.clear();
        this.array.add(new PdfReferenceHolder(this.pdfPage));
        switch (this.destinationMode) {
            case PdfDestinationMode.Location:
                var simplePage = this.pdfPage;
                var point = new PointF();
                point = this.pointToNativePdf(simplePage, this.destinationLocation);
                this.array.add(new PdfName(this.dictionaryProperties.xyz));
                this.array.add(new PdfNumber(point.x));
                this.array.add(new PdfNumber(point.y));
                this.array.add(new PdfNumber(this.zoomFactor));
                break;
            case PdfDestinationMode.FitToPage:
                this.array.add(new PdfName(this.dictionaryProperties.fit));
                break;
        }
    };
    Object.defineProperty(PdfDestination.prototype, "element", {
        /**
         * Gets the `element` representing this object.
         * @private
         */
        get: function () {
            this.initializePrimitive();
            return this.array;
        },
        enumerable: true,
        configurable: true
    });
    return PdfDestination;
}());
export { PdfDestination };
