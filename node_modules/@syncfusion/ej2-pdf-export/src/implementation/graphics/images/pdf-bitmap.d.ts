/**
 * PdfBitmap.ts class for EJ2-PDF
 */
import { ImageDecoder } from './../../graphics/images/image-decoder';
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
export declare class PdfBitmap extends PdfImage {
    /**
     * Specifies the `status` of an image.
     * @default true.
     * @hidden
     * @private
     */
    private imageStatus;
    /**
     * Internal variable for accessing fields from `DictionryProperties` class.
     * @hidden
     * @private
     */
    private dictionaryProperties;
    /**
     * `Type` of an image.
     * @hidden
     * @private
     */
    checkImageType: number;
    /**
     * Object to store `decoder` of an image.
     * @hidden
     * @private
     */
    decoder: ImageDecoder;
    /**
     * `Load image`.
     * @hidden
     * @private
     */
    private loadImage;
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
    constructor(encodedString: string);
    /**
     * `Initialize` image parameters.
     * @private
     */
    initializeAsync(encodedString: string): void;
    /**
     * `Saves` the image into stream.
     * @private
     */
    save(): void;
}
