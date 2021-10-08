/**
 * PdfUnitConverter.ts class for EJ2-PDF
 */
import { PdfGraphicsUnit } from './../graphics/enum';
/**
 * Used to perform `convertion between pixels and points`.
 * @private
 */
export declare class PdfUnitConverter {
    /**
     * Indicates default `horizontal resolution`.
     * @default 96
     * @private
     */
    static readonly horizontalResolution: number;
    /**
     * Indicates default `vertical resolution`.
     * @default 96
     * @private
     */
    static readonly verticalResolution: number;
    /**
     * `Width, in millimeters`, of the physical screen.
     * @private
     */
    static readonly horizontalSize: number;
    /**
     * `Height, in millimeters`, of the physical screen.
     * @private
     */
    static readonly verticalSize: number;
    /**
     * `Width, in pixels`, of the screen.
     * @private
     */
    static readonly pxHorizontalResolution: number;
    /**
     * `Height, in pixels`, of the screen.
     * @private
     */
    static readonly pxVerticalResolution: number;
    /**
     * `Matrix` for conversations between different numeric systems.
     * @private
     */
    private proportions;
    /**
     * Initializes a new instance of the `UnitConvertor` class with DPI value.
     * @private
     */
    constructor(dpi: number);
    /**
     * `Converts` the value, from one graphics unit to another graphics unit.
     * @private
     */
    convertUnits(value: number, from: PdfGraphicsUnit, to: PdfGraphicsUnit): number;
    /**
     * Converts the value `to pixel` from specified graphics unit.
     * @private
     */
    convertToPixels(value: number, from: PdfGraphicsUnit): number;
    /**
     * Converts value, to specified graphics unit `from Pixel`.
     * @private
     */
    convertFromPixels(value: number, to: PdfGraphicsUnit): number;
    /**
     * `Update proportions` matrix according to Graphics settings.
     * @private
     */
    private updateProportionsHelper;
}
