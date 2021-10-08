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
 * PdfColorBlend.ts class for EJ2-PDF
 */
import { PdfColorSpace } from './../enum';
import { PdfSampledFunction } from './../../general/functions/pdf-sampled-function';
import { PdfBlend } from './pdf-blend';
/**
 * `PdfColorBlend` Represents the arrays of colors and positions used for
 *  interpolating color blending in a multicolor gradient.
 * @private
 */
var PdfColorBlend = /** @class */ (function (_super) {
    __extends(PdfColorBlend, _super);
    function PdfColorBlend(count) {
        var _this = _super.call(this) || this;
        if (typeof count === 'number') {
            _this = _super.call(this, count) || this;
        }
        return _this;
    }
    Object.defineProperty(PdfColorBlend.prototype, "colors", {
        //Properties
        /**
         * Gets or sets the array of colors.
         * @public
         */
        get: function () {
            return this.mcolors;
        },
        set: function (value) {
            if ((value == null)) {
                throw new Error('ArgumentNullException : Colors');
            }
            this.mcolors = value;
        },
        enumerable: true,
        configurable: true
    });
    //Implementation
    /**
     * Gets the function.
     * @param colorSpace The color space.
     * @public
     */
    PdfColorBlend.prototype.getFunction = function (colorSpace) {
        var domain = [0, 1];
        var colourComponents = this.getColorComponentsCount(colorSpace);
        var maxComponentValue = this.getMaxComponentValue(colorSpace);
        var range = this.setRange(colourComponents, maxComponentValue);
        var func = null;
        if ((this.mbrush == null && typeof this.mbrush === 'undefined')) {
            var sizes = [1];
            var samplesCount = void 0;
            var step = 1;
            if (this.positions.length === 2) {
                samplesCount = 2;
            }
            else {
                var positions = this.positions;
                var intervals = this.getIntervals(positions);
                var gcd = this.gcd(intervals);
                step = gcd;
                samplesCount = (((1 / gcd)) + 1);
            }
            sizes[0] = samplesCount;
            var samples = this.getSamplesValues(colorSpace, samplesCount, maxComponentValue, step);
            func = new PdfSampledFunction(domain, range, sizes, samples);
            return func;
        }
        return func;
    };
    /**
     * 'cloneColorBlend' Clones this instance.
     * @public
     */
    PdfColorBlend.prototype.cloneColorBlend = function () {
        var cBlend = this;
        if ((this.mcolors != null && typeof this.mcolors !== 'undefined')) {
            cBlend.colors = (this.mcolors);
        }
        if ((this.positions != null && typeof this.positions !== 'undefined')) {
            cBlend.positions = (this.positions);
        }
        return cBlend;
    };
    /**
     * Sets the range.
     * @param colourComponents The colour components.
     * @param maxValue The max value.
     */
    PdfColorBlend.prototype.setRange = function (colourComponents, maxValue) {
        var range = [(colourComponents * 2)];
        for (var i = 0; (i < colourComponents); ++i) {
            range[(i * 2)] = 0;
            range[((i * 2) + 1)] = 1;
        }
        return range;
    };
    /**
     * Calculates the color components count according to colour space.
     * @param colorSpace The color space.
     */
    PdfColorBlend.prototype.getColorComponentsCount = function (colorSpace) {
        var count = 0;
        switch (colorSpace) {
            case PdfColorSpace.Rgb:
                count = 3;
                break;
            case PdfColorSpace.Cmyk:
                count = 4;
                break;
            case PdfColorSpace.GrayScale:
                count = 1;
                break;
            default:
                throw new Error('ArgumentException - Unsupported color space: ' + colorSpace + ' colorSpace');
        }
        return count;
    };
    /**
     * Gets samples values for specified colour space.
     * @param colorSpace The color space.
     * @param sampleCount The sample count.
     * @param maxComponentValue The max component value.
     * @param step The step.
     */
    PdfColorBlend.prototype.getSamplesValues = function (colorSpace, sampleCount, maxComponentValue, step) {
        var values;
        switch (colorSpace) {
            case PdfColorSpace.GrayScale:
                values = this.getGrayscaleSamples(sampleCount, maxComponentValue, step);
                break;
            case PdfColorSpace.Cmyk:
                values = this.getCmykSamples(sampleCount, maxComponentValue, step);
                break;
            case PdfColorSpace.Rgb:
                values = this.getRgbSamples(sampleCount, maxComponentValue, step);
                break;
            default:
                throw new Error('ArgumentException - Unsupported color space: ' + colorSpace + ' colorSpace');
        }
        return values;
    };
    /**
     * Gets the grayscale samples.
     * @param sampleCount The sample count.
     * @param maxComponentValue The max component value.
     * @param step The step.
     */
    PdfColorBlend.prototype.getGrayscaleSamples = function (sampleCount, maxComponentValue, step) {
        var values = [(sampleCount * 2)];
        for (var i = 0; (i < sampleCount); ++i) {
            var color = this.getNextColor(i, step, PdfColorSpace.GrayScale);
            var index = (i * 2);
        }
        return values;
    };
    /**
     * Gets the RGB samples.
     * @param sampleCount The sample count.
     * @param maxComponentValue The max component value.
     * @param step The step.
     */
    PdfColorBlend.prototype.getRgbSamples = function (sampleCount, maxComponentValue, step) {
        var values = [(sampleCount * 3)];
        for (var i = 0; (i < sampleCount); ++i) {
            var color = this.getNextColor(i, step, PdfColorSpace.Rgb);
            var index = (i * 3);
            values[index] = color.r;
            values[(index + 1)] = color.g;
            values[(index + 2)] = color.b;
        }
        return values;
    };
    /**
     * Gets the CMYK samples.
     * @param sampleCount The sample count.
     * @param maxComponentValue The max component value.
     * @param step The step.
     */
    PdfColorBlend.prototype.getCmykSamples = function (sampleCount, maxComponentValue, step) {
        var values = [(sampleCount * 4)];
        for (var i = 0; (i < sampleCount); i++) {
            var color = this.getNextColor(i, step, PdfColorSpace.Cmyk);
            var index = (i * 4);
            values[index] = ((color.c * maxComponentValue));
            values[(index + 1)] = ((color.m * maxComponentValue));
            values[(index + 2)] = ((color.y * maxComponentValue));
            values[(index + 3)] = ((color.k * maxComponentValue));
        }
        return values;
    };
    /**
     * Calculates the color that should be at the specified index.
     * @param index The index.
     * @param step The step.
     * @param colorSpace The color space.
     */
    PdfColorBlend.prototype.getNextColor = function (index, step, colorSpace) {
        var position = (step * index);
        var indexHi;
        var indexLow;
        var result = this.getIndices(position, indexLow, indexHi);
        indexLow = result.indexLow;
        indexHi = result.indexHi;
        var color;
        if (indexLow === indexHi) {
            color = this.mcolors[indexLow];
        }
        else {
            var positionLow = this.positions[indexLow];
            var positionHi = this.positions[indexHi];
            var colorLow = this.mcolors[indexLow];
            var colorHi = this.mcolors[indexHi];
            var t = ((position - positionLow) / (positionHi - positionLow));
            color = this.interpolate(t, colorLow, colorHi, colorSpace);
        }
        return color;
    };
    /**
     * Gets the indices.
     * @param position The position.
     * @param indexLow The index low.
     * @param indexHi The index hi.
     */
    PdfColorBlend.prototype.getIndices = function (position, indexLow, indexHi) {
        var positions = this.positions;
        indexLow = 0;
        indexHi = 0;
        for (var i = 0; (i < this.mcolors.length); ++i) {
            var currPos = positions[i];
            if ((currPos === position)) {
                indexHi = i;
                indexLow = i;
                break;
            }
            else if ((currPos > position)) {
                indexHi = i;
                break;
            }
            indexLow = i;
            indexHi = i;
        }
        return { indexLow: indexLow, indexHi: indexHi };
    };
    /**
     * Calculates the max component value.
     * @param colorSpace The color space.
     */
    PdfColorBlend.prototype.getMaxComponentValue = function (colorSpace) {
        var result = 0;
        switch (colorSpace) {
            case PdfColorSpace.Cmyk:
            case PdfColorSpace.Rgb:
                result = 255;
                break;
            case PdfColorSpace.GrayScale:
                result = 65535;
                break;
            default:
                throw new Error('ArgumentException - Unsupported color space: ' + colorSpace + 'colorSpace');
        }
        return result;
    };
    /**
     * Gets an intervals array from the positions array.
     * @param positions The positions array.
     */
    PdfColorBlend.prototype.getIntervals = function (positions) {
        var count = positions.length;
        var intervals = [(count - 1)];
        var prev = positions[0];
        for (var i = 1; (i < count); ++i) {
            var v = positions[i];
            intervals[(i - 1)] = (v - prev);
            prev = v;
        }
        return intervals;
    };
    return PdfColorBlend;
}(PdfBlend));
export { PdfColorBlend };
