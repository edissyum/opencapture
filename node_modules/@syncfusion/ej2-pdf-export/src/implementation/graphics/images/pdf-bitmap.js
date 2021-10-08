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
/**
 * PdfBitmap.ts class for EJ2-PDF
 */
import { ImageDecoder } from './../../graphics/images/image-decoder';
import { ByteArray } from './../../graphics/images/byte-array';
import { DictionaryProperties } from './../../input-output/pdf-dictionary-properties';
import { PdfImage } from './pdf-image';
/**
 * The 'PdfBitmap' contains methods and properties to handle the Bitmap images.
 * ```typescript
 * // create a new PDF document.
 * let document : PdfDocument = new PdfDocument();
 * // add a page to the document.
 * let page1 : PdfPage = document.pages.add();
 * // base64 string of an image
 * let imageString : string = '/9j/3+2w7em7HzY/KiijFw … 1OEYRUYrQ45yc5OUtz/9k=';
 * // load the image from the base64 string of original image.
 * let image : PdfBitmap = new PdfBitmap(imageString);
 * // draw the image
 * page1.graphics.drawImage(image, new RectangleF({x : 10, y : 10}, {width : 200, height : 200}));
 * // save the document.
 * document.save('output.pdf');
 * // destroy the document
 * document.destroy();
 * ```
 */
var PdfBitmap = /** @class */ (function (_super) {
    __extends(PdfBitmap, _super);
    /**
     * Create an instance for `PdfBitmap` class.
     * @param encodedString Base64 string of an image.
     * ```typescript
     * // create a new PDF document.
     * let document : PdfDocument = new PdfDocument();
     * // add a page to the document.
     * let page1 : PdfPage = document.pages.add();
     * // base64 string of an image
     * let imageString : string = '/9j/3+2w7em7HzY/KiijFw … 1OEYRUYrQ45yc5OUtz/9k=';
     * //
     * // load the image from the base64 string of original image.
     * let image : PdfBitmap = new PdfBitmap(imageString);
     * //
     * // draw the image
     * page1.graphics.drawImage(image, new RectangleF({x : 10, y : 10}, {width : 200, height : 200}));
     * // save the document.
     * document.save('output.pdf');
     * // destroy the document
     * document.destroy();
     * ```
     */
    function PdfBitmap(encodedString) {
        var _this = _super.call(this) || this;
        //Fields
        /**
         * Specifies the `status` of an image.
         * @default true.
         * @hidden
         * @private
         */
        _this.imageStatus = true;
        /**
         * Internal variable for accessing fields from `DictionryProperties` class.
         * @hidden
         * @private
         */
        _this.dictionaryProperties = new DictionaryProperties();
        _this.loadImage(encodedString);
        return _this;
    }
    /**
     * `Load image`.
     * @hidden
     * @private
     */
    PdfBitmap.prototype.loadImage = function (encodedString) {
        var task = this.initializeAsync(encodedString);
    };
    /**
     * `Initialize` image parameters.
     * @private
     */
    PdfBitmap.prototype.initializeAsync = function (encodedString) {
        var byteArray = new ByteArray(encodedString.length);
        byteArray.writeFromBase64String(encodedString);
        this.decoder = new ImageDecoder(byteArray);
        this.height = this.decoder.height;
        this.width = this.decoder.width;
        // FrameCount = BitmapImageDecoder.FrameCount;
        this.bitsPerComponent = this.decoder.bitsPerComponent;
    };
    /**
     * `Saves` the image into stream.
     * @private
     */
    PdfBitmap.prototype.save = function () {
        this.imageStatus = true;
        this.imageStream = this.decoder.getImageDictionary();
    };
    return PdfBitmap;
}(PdfImage));
export { PdfBitmap };
