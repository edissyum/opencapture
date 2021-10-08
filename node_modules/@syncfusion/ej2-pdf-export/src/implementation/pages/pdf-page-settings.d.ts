/**
 * PdfPageSettings.ts class for EJ2-PDF
 */
import { SizeF, PointF } from './../drawing/pdf-drawing';
import { PdfPageRotateAngle, PdfPageOrientation } from './enum';
import { PdfMargins } from './../graphics/pdf-margins';
/**
 * The class provides various `setting` related with PDF pages.
 */
export declare class PdfPageSettings {
    /**
     * The page `margins`.
     * @private
     */
    private pageMargins;
    /**
     * The page `size`.
     * @default a4
     * @private
     */
    private pageSize;
    /**
     * The page `rotation angle`.
     * @default PdfPageRotateAngle.RotateAngle0
     * @private
     */
    private rotateAngle;
    /**
     * The page `orientation`.
     * @default PdfPageOrientation.Portrait
     * @private
     */
    private pageOrientation;
    /**
     * The page `origin`.
     * @default 0,0
     * @private
     */
    private pageOrigin;
    /**
     * Checks the Whether the `rotation` is applied or not.
     * @default false
     * @private
     */
    isRotation: boolean;
    /**
     * Initializes a new instance of the `PdfPageSettings` class.
     * @private
     */
    constructor();
    /**
     * Initializes a new instance of the `PdfPageSettings` class.
     * @private
     */
    constructor(margins: number);
    /**
     * Gets or sets the `size` of the page.
     * @private
     */
    size: SizeF;
    /**
     * Gets or sets the page `orientation`.
     * @private
     */
    orientation: PdfPageOrientation;
    /**
     * Gets or sets the `margins` of the page.
     * @private
     */
    margins: PdfMargins;
    /**
     * Gets or sets the `width` of the page.
     * @private
     */
    width: number;
    /**
     * Gets or sets the `height` of the page.
     * @private
     */
    height: number;
    /**
     * Gets or sets the `origin` of the page.
     * @private
     */
    origin: PointF;
    /**
     * Gets or sets the number of degrees by which the page should be `rotated` clockwise when displayed or printed.
     * @private
     */
    rotate: PdfPageRotateAngle;
    /**
     * `Update page size` depending on orientation.
     * @private
     */
    private updateSize;
    /**
     * Creates a `clone` of the object.
     * @private
     */
    clone(): PdfPageSettings;
    /**
     * Returns `size`, shrinked by the margins.
     * @private
     */
    getActualSize(): SizeF;
    /**
     * Sets `size` to the page aaccording to the orientation.
     * @private
     */
    private setSize;
}
