import { SizeF } from './../../drawing/pdf-drawing';
import { PdfGraphicsUnit } from './../enum';
import { PdfUnitConverter } from './../unit-convertor';
/**
 * `PdfImage` class represents the base class for images and provides functionality for the 'PdfBitmap' class.
 * @private
 */
var PdfImage = /** @class */ (function () {
    function PdfImage() {
    }
    Object.defineProperty(PdfImage.prototype, "width", {
        /**
         * Gets and Sets the `width` of an image.
         * @private
         */
        get: function () {
            return this.imageWidth;
        },
        set: function (value) {
            this.imageWidth = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PdfImage.prototype, "height", {
        /**
         * Gets and Sets the `height` of an image.
         * @private
         */
        get: function () {
            return this.imageHeight;
        },
        set: function (value) {
            this.imageHeight = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PdfImage.prototype, "size", {
        /**
         * Gets or sets the size of the image.
         * @private
         */
        set: function (value) {
            this.width = value.width;
            this.height = value.height;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PdfImage.prototype, "physicalDimension", {
        /**
         * Gets the `physical dimension` of an image.
         * @private
         */
        get: function () {
            this.imagePhysicalDimension = this.getPointSize(this.width, this.height, this.horizontalResolution, this.verticalResolution);
            return new SizeF(this.width, this.height);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PdfImage.prototype, "element", {
        // /**
        //  * Gets the `image stream as string`.
        //  * @private
        //  */
        // public static fromString(string : string) : PdfImage {
        //     let image : PdfImage = new PdfBitmap(string);
        //     return image;
        // }
        /**
         * Gets the `element` image stream.
         * @private
         */
        get: function () {
            return this.imageStream;
        },
        enumerable: true,
        configurable: true
    });
    PdfImage.prototype.getPointSize = function (width, height, horizontalResolution, verticalResolution) {
        if (typeof horizontalResolution === 'undefined') {
            var dpiX = PdfUnitConverter.horizontalResolution;
            var dpiY = PdfUnitConverter.verticalResolution;
            var size = this.getPointSize(width, height, dpiX, dpiY);
            return size;
        }
        else {
            var ucX = new PdfUnitConverter(horizontalResolution);
            var ucY = new PdfUnitConverter(verticalResolution);
            var ptWidth = ucX.convertUnits(width, PdfGraphicsUnit.Pixel, PdfGraphicsUnit.Point);
            var ptHeight = ucY.convertUnits(height, PdfGraphicsUnit.Pixel, PdfGraphicsUnit.Point);
            var size = new SizeF(ptWidth, ptHeight);
            return size;
        }
    };
    return PdfImage;
}());
export { PdfImage };
