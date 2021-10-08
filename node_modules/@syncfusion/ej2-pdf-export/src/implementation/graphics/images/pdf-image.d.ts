/**
 * PdfImage.ts class for EJ2-PDF
 */
import { IPdfWrapper } from './../../../interfaces/i-pdf-wrapper';
import { IPdfPrimitive } from './../../../interfaces/i-pdf-primitives';
import { PdfStream } from './../../primitives/pdf-stream';
import { SizeF } from './../../drawing/pdf-drawing';
/**
 * `PdfImage` class represents the base class for images and provides functionality for the 'PdfBitmap' class.
 * @private
 */
export declare abstract class PdfImage implements IPdfWrapper {
    /**
     * `Width` of an image.
     * @private
     */
    private imageWidth;
    /**
     * `Height` of an image.
     * @private
     */
    private imageHeight;
    /**
     * `Bits per component` of an image.
     * @hidden
     * @private
     */
    bitsPerComponent: number;
    /**
     * `horizontal resolution` of an image.
     * @hidden
     * @private
     */
    horizontalResolution: number;
    /**
     * `Vertical resolution` of an image.
     * @hidden
     * @private
     */
    verticalResolution: number;
    /**
     * `physical dimension` of an image.
     * @hidden
     * @private
     */
    private imagePhysicalDimension;
    /**
     * Gets and Sets the `width` of an image.
     * @private
     */
    width: number;
    /**
     * Gets and Sets the `height` of an image.
     * @private
     */
    height: number;
    /**
     * Gets or sets the size of the image.
     * @private
     */
    size: SizeF;
    /**
     * Gets the `physical dimension` of an image.
     * @private
     */
    readonly physicalDimension: SizeF;
    /**
     * return the stored `stream of an image`.
     * @private
     */
    imageStream: PdfStream;
    /**
     * Gets the `element` image stream.
     * @private
     */
    readonly element: IPdfPrimitive;
    /**
     * `Save` the image stream.
     * @private
     */
    abstract save(): void;
    /**
     * Return the value of `width and height of an image` in points.
     * @private
     */
    getPointSize(width: number, height: number): SizeF;
    getPointSize(width: number, height: number, horizontalResolution: number, verticalResolution: number): SizeF;
}
