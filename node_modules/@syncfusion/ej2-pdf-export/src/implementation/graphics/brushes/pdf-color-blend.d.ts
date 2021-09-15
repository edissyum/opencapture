/**
 * PdfColorBlend.ts class for EJ2-PDF
 */
import { PdfColorSpace } from './../enum';
import { PdfColor } from './../pdf-color';
import { PdfFunction } from './../../general/functions/pdf-function';
import { PdfBlend } from './pdf-blend';
/**
 * `PdfColorBlend` Represents the arrays of colors and positions used for
 *  interpolating color blending in a multicolor gradient.
 * @private
 */
export declare class PdfColorBlend extends PdfBlend {
    /**
     * Array of colors.
     * @private
     */
    private mcolors;
    /**
     * Local variable to store the brush.
     */
    private mbrush;
    /**
     * Initializes a new instance of the `PdfColorBlend` class.
     * @public
     */
    constructor();
    /**
     * Initializes a new instance of the `PdfColorBlend` class.
     * @public
     */
    constructor(count: number);
    /**
     * Gets or sets the array of colors.
     * @public
     */
    colors: PdfColor[];
    /**
     * Gets the function.
     * @param colorSpace The color space.
     * @public
     */
    getFunction(colorSpace: PdfColorSpace): PdfFunction;
    /**
     * 'cloneColorBlend' Clones this instance.
     * @public
     */
    cloneColorBlend(): PdfColorBlend;
    /**
     * Sets the range.
     * @param colourComponents The colour components.
     * @param maxValue The max value.
     */
    private setRange;
    /**
     * Calculates the color components count according to colour space.
     * @param colorSpace The color space.
     */
    private getColorComponentsCount;
    /**
     * Gets samples values for specified colour space.
     * @param colorSpace The color space.
     * @param sampleCount The sample count.
     * @param maxComponentValue The max component value.
     * @param step The step.
     */
    private getSamplesValues;
    /**
     * Gets the grayscale samples.
     * @param sampleCount The sample count.
     * @param maxComponentValue The max component value.
     * @param step The step.
     */
    private getGrayscaleSamples;
    /**
     * Gets the RGB samples.
     * @param sampleCount The sample count.
     * @param maxComponentValue The max component value.
     * @param step The step.
     */
    private getRgbSamples;
    /**
     * Gets the CMYK samples.
     * @param sampleCount The sample count.
     * @param maxComponentValue The max component value.
     * @param step The step.
     */
    private getCmykSamples;
    /**
     * Calculates the color that should be at the specified index.
     * @param index The index.
     * @param step The step.
     * @param colorSpace The color space.
     */
    private getNextColor;
    /**
     * Gets the indices.
     * @param position The position.
     * @param indexLow The index low.
     * @param indexHi The index hi.
     */
    private getIndices;
    /**
     * Calculates the max component value.
     * @param colorSpace The color space.
     */
    private getMaxComponentValue;
    /**
     * Gets an intervals array from the positions array.
     * @param positions The positions array.
     */
    private getIntervals;
}
