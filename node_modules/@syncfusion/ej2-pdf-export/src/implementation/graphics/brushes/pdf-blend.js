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
var PdfBlend = /** @class */ (function () {
    function PdfBlend(count) {
        //Constants
        /**
         * precision of the GCD calculations.
         * @private
         */
        this.precision = 1000;
        //
    }
    Object.defineProperty(PdfBlend.prototype, "factors", {
        //Properties
        /**
         * Gets or sets the array of factor to the blend.
         * @public
         */
        get: function () {
            return this.mFactors;
        },
        set: function (value) {
            if ((value == null)) {
                throw new Error('ArgumentNullException : Factors');
            }
            this.mFactors = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PdfBlend.prototype, "positions", {
        /**
         * 'positions' Gets or sets the array of positions
         * @public
         */
        get: function () {
            return this.mPositions;
        },
        set: function (value) {
            var positionarray = value;
            for (var i = 0; i < positionarray.length; i++) {
                if (((positionarray[i] < 0) || (positionarray[i] > 1))) {
                    positionarray[i] = 0;
                }
            }
            this.mPositions = positionarray;
            this.mPositions = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PdfBlend.prototype, "count", {
        /**
         * Gets the number of elements that specify the blend.
         * @protected
         */
        get: function () {
            return this.mCount;
        },
        enumerable: true,
        configurable: true
    });
    //Implementation
    /**
     * Generates a correct color blend.
     * @param colours The colours.
     * @param colorSpace The color space.
     */
    PdfBlend.prototype.generateColorBlend = function (colours, colorSpace) {
        if ((colours == null)) {
            throw new Error('ArgumentNullException : colours');
        }
        if ((this.positions == null)) {
            this.positions = [0];
        }
        var cBlend = new PdfColorBlend(this.count);
        var positions = this.positions;
        var clrs = null;
        if ((positions.length === 1)) {
            positions = [3];
            positions[0] = 0;
            positions[1] = this.positions[0];
            positions[2] = 1;
            /* tslint:disable */
            clrs = new Array(3);
            clrs[0] = colours[0];
            clrs[1] = colours[0];
            clrs[2] = colours[1];
        }
        else {
            var c1 = colours[0];
            var c2 = colours[1];
            /* tslint:disable */
            clrs = new Array(this.count);
            var i = 0;
            var count = this.count;
            for (i = 0; i < count; ++i) {
                clrs[i] = this.interpolate(this.mFactors[i], c1, c2, colorSpace);
            }
        }
        cBlend.positions = positions;
        cBlend.colors = clrs;
        return cBlend;
    };
    /**
     * 'clonePdfBlend' Clones this instance.
     * @public
     */
    PdfBlend.prototype.clonePdfBlend = function () {
        var blend = this;
        if ((this.mFactors != null)) {
            blend.factors = (this.mFactors);
        }
        if ((this.positions != null)) {
            blend.positions = (this.positions);
        }
        return blend;
    };
    PdfBlend.prototype.gcd = function (u, v) {
        if (typeof u === 'number' && typeof v === 'number' && typeof v !== 'undefined') {
            if (((u < 0) || (u > 1))) {
                throw new Error('ArgumentOutOfRangeException : u');
            }
            if (((v < 0) || (v > 1))) {
                throw new Error('ArgumentOutOfRangeException : v');
            }
            var iU = (Math.max(1, (u * this.precision)));
            var iV = (Math.max(1, (v * this.precision)));
            var iResult = this.gcdInt(iU, iV);
            var result = ((iResult) / this.precision);
            return result;
        }
        else {
            var values = u;
            if ((values == null)) {
                throw new Error('ArgumentNullException : values');
            }
            if ((values.length < 1)) {
                throw new Error('ArgumentException : Not enough values in the array. - values');
            }
            var gcd = values[0];
            if ((values.length > 1)) {
                var count = values.length;
                for (var i = 1; i < count; ++i) {
                    gcd = this.gcd(values[i], gcd);
                    if ((gcd === (1 / this.precision))) {
                        break;
                    }
                }
            }
            return gcd;
        }
    };
    /**
     * Calculate the GCD int of the specified values.
     * @param u The u.
     * @param v The v.
     */
    PdfBlend.prototype.gcdInt = function (u, v) {
        if ((u <= 0)) {
            throw new Error('ArgumentOutOfRangeException' + u + 'The arguments cannot be less or equal to zero.');
        }
        if ((v <= 0)) {
            throw new Error('ArgumentOutOfRangeException' + v + 'The arguments cannot be less or equal to zero.');
        }
        if (((u === 1) || (v === 1))) {
            return 1;
        }
        var shift = 0;
        while (this.isEven(u, v)) {
            ++shift;
            u >>= 1;
            v >>= 1;
        }
        while (((u & 1) <= 0)) {
            u >>= 1;
        }
        do {
            while ((v & 1) <= 0) {
                v >>= 1;
            }
            if (u > v) {
                var t = v;
                v = u;
                u = t;
            }
            v = v - u;
        } while (v !== 0);
        return (u << shift);
    };
    PdfBlend.prototype.isEven = function (arg1, arg2) {
        if (typeof arg2 === 'number' && typeof arg2 !== 'undefined') {
            var result = true;
            result = (result && ((arg1 & 1) <= 0)); //  Is u even?
            result = (result && ((arg2 & 1) <= 0)); //  Is v even?
            return result;
        }
        else {
            return ((arg1 & 1) <= 0);
        }
    };
    PdfBlend.prototype.interpolate = function (t, color1, color2, colorSpace) {
        if (color1 instanceof PdfColor) {
            var color = new PdfColor();
            switch (colorSpace) {
                case PdfColorSpace.Rgb:
                    var red = (this.interpolate(t, color1.red, color2.red));
                    var green = (this.interpolate(t, color1.green, color2.green));
                    var blue = (this.interpolate(t, color1.blue, color2.blue));
                    color = new PdfColor(red, green, blue);
                    break;
                case PdfColorSpace.GrayScale:
                    var gray = (this.interpolate(t, color1.gray, color2.gray));
                    color = new PdfColor(gray);
                    break;
                case PdfColorSpace.Cmyk:
                    var cyan = (this.interpolate(t, color1.c, color2.c));
                    var magenta = (this.interpolate(t, color1.m, color2.m));
                    var yellow = (this.interpolate(t, color1.y, color2.y));
                    var black = (this.interpolate(t, color1.k, color2.k));
                    color = new PdfColor(cyan, magenta, yellow, black);
                    break;
            }
            return color;
        }
        else {
            var t0 = 0;
            var t1 = 1;
            var result = 0;
            if ((t === t0)) {
                result = color1;
            }
            else if ((t === t1)) {
                result = color2;
            }
            else {
                result = (color1 + ((t - t0) * ((color2 - color1) / (t1 - t0))));
            }
            return result;
        }
    };
    return PdfBlend;
}());
export { PdfBlend };
