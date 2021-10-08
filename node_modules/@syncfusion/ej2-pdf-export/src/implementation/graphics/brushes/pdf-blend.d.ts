/**
 * PdfBlend.ts class for EJ2-PDF
 */
import { PdfColorSpace } from './../enum';
import { PdfColor } from './../pdf-color';
import { PdfColorBlend } from './pdf-color-blend';
/**
 * `PdfBlend` Represents the blend color space
 * @private
 */
export declare class PdfBlend {
    /**
     * precision of the GCD calculations.
     * @private
     */
    private precision;
    /**
     * Local variable to store the count.
     * @private
     */
    private mCount;
    /**
     * Local variable to store the positions.
     * @private
     */
    private mPositions;
    /**
     * Local variable to store the factors
     * @private.
     */
    private mFactors;
    /**
     * Initializes a new instance of the `PdfBlend` class.
     * @public
     */
    constructor();
    /**
     * Initializes a new instance of the `PdfBlend` class.
     * @public
     */
    constructor(count: number);
    /**
     * Gets or sets the array of factor to the blend.
     * @public
     */
    factors: number[];
    /**
     * 'positions' Gets or sets the array of positions
     * @public
     */
    positions: number[];
    /**
     * Gets the number of elements that specify the blend.
     * @protected
     */
    protected readonly count: number;
    /**
     * Generates a correct color blend.
     * @param colours The colours.
     * @param colorSpace The color space.
     */
    generateColorBlend(colours: PdfColor[], colorSpace: PdfColorSpace): PdfColorBlend;
    /**
     * 'clonePdfBlend' Clones this instance.
     * @public
     */
    clonePdfBlend(): PdfBlend;
    /**
     * Calculate the GCD of the specified values.
     * @param u The values.
     */
    protected gcd(u: number[]): number;
    /**
     * Determines greatest common divisor of the specified u and v.
     * @param u The u.
     * @param v The v.
     */
    protected gcd(u: number, v: number): number;
    /**
     * Calculate the GCD int of the specified values.
     * @param u The u.
     * @param v The v.
     */
    protected gcdInt(u: number, v: number): number;
    /**
     * Determines if the u value is even.
     * @param u The u value.
     */
    private isEven;
    /**
     * Interpolates the specified colours according to the t value.
     * @param t The t value, which show the imagine position on a line from 0 to 1.
     * @param v1 The minimal value.
     * @param v2 The maximal value.
     */
    protected interpolate(t: number, v1: number, v2: number): number;
    /**
     * Interpolates the specified colours according to the t value.
     * @param t The t value, which show the imagine position on a line from 0 to 1.
     * @param color1 The minimal colour.
     * @param color2 The maximal colour.
     * @param colorSpace The color space.
     */
    protected interpolate(t: number, color1: PdfColor, color2: PdfColor, colorSpace: PdfColorSpace): PdfColor;
}
