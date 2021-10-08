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
 * PdfRadialGradientBrush.ts class for EJ2-PDF
 */
import { PdfColorSpace } from './../enum';
import { PdfDictionary } from '../../primitives/pdf-dictionary';
import { DictionaryProperties } from './../../input-output/pdf-dictionary-properties';
import { PdfBoolean } from '../../primitives/pdf-boolean';
import { PdfArray } from './../../primitives/pdf-array';
import { PdfNumber } from './../../primitives/pdf-number';
import { PdfColorBlend } from './pdf-color-blend';
import { PdfGradientBrush } from './pdf-gradient-brush';
import { PdfExtend, ShadingType } from './enum';
/**
 * `PdfRadialGradientBrush` Represent radial gradient brush.
 * @private
 */
var PdfRadialGradientBrush = /** @class */ (function (_super) {
    __extends(PdfRadialGradientBrush, _super);
    //Constructor
    /**
     * Initializes a new instance of the `PdfRadialGradientBrush` class.
     * @public
     */
    /* tslint:disable-next-line:max-line-length */
    function PdfRadialGradientBrush(centerStart, radiusStart, centerEnd, radiusEnd, colorStart, colorEnd) {
        var _this = _super.call(this, new PdfDictionary()) || this;
        /**
         * Local varaible to store the dictionary properties.
         */
        _this.mDictionaryProperties = new DictionaryProperties();
        _this.initialize(colorStart, colorEnd);
        if (radiusStart < 0) {
            throw new Error('ArgumentOutOfRangeException : radiusStart - The radius cannot be less then zero.');
        }
        if (radiusEnd < 0) {
            throw new Error('ArgumentOutOfRangeException : radiusEnd - The radius cannpt be less then zero.');
        }
        _this.mPointEnd = centerEnd;
        _this.mPointStart = centerStart;
        _this.mRadiusStart = radiusStart;
        _this.mRadiusEnd = radiusEnd;
        _this.setPoints(_this.mPointStart, _this.mPointEnd, _this.mRadiusStart, _this.mRadiusEnd);
        return _this;
    }
    /**
     * Initializes a new instance of the `PdfRadialGradientBrush` class.
     * @param color1 The color1.
     * @param color2 The color2.
     */
    PdfRadialGradientBrush.prototype.initialize = function (color1, color2) {
        this.mColour = [color1, color2];
        this.mColourBlends = new PdfColorBlend(2);
        this.mColourBlends.positions = [0, 1];
        this.mColourBlends.colors = this.mColour;
        this.initShading();
    };
    Object.defineProperty(PdfRadialGradientBrush.prototype, "blend", {
        //Properties
        /**
         * Gets or sets a PdfBlend that specifies positions and factors that define a custom falloff for the gradient.
         * @public
         */
        get: function () {
            return this.mBlend;
        },
        set: function (value) {
            if ((value == null)) {
                throw new Error('ArgumentNullException : Blend');
            }
            if ((this.mColour == null && typeof this.mColour === 'undefined')) {
                throw new Error('NotSupportedException : There is no starting and ending colours specified.');
            }
            this.mBlend = value;
            this.mColourBlends = this.mBlend.generateColorBlend(this.mColour, this.colorSpace);
            this.resetFunction();
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PdfRadialGradientBrush.prototype, "interpolationColors", {
        /**
         * Gets or sets a ColorBlend that defines a multicolor radial gradient.
         * @public
         */
        get: function () {
            return this.mColourBlends;
        },
        set: function (value) {
            if (value == null) {
                throw new Error('ArgumentNullException : InterpolationColors');
            }
            this.mBlend = null;
            this.mColour = null;
            this.mColourBlends = value;
            this.resetFunction();
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PdfRadialGradientBrush.prototype, "linearColors", {
        /**
         * Gets or sets the starting and ending colors of the radial gradient.
         * @public
         */
        get: function () {
            return this.mColour;
        },
        set: function (value) {
            if ((value == null)) {
                throw new Error('ArgumentNullException : radial LinearColors');
            }
            if ((value.length < 2)) {
                throw new Error('ArgumentException : The array is too small LinearColors');
            }
            if ((this.mColour == null && typeof this.mColour === 'undefined')) {
                this.mColour = [value[0], value[1]];
            }
            else {
                this.mColour[0] = value[0];
                this.mColour[1] = value[1];
            }
            if ((this.mBlend == null && typeof this.mBlend === 'undefined')) {
                //  Set correct colour blend.
                this.mColourBlends = new PdfColorBlend(2);
                this.mColourBlends.colors = this.mColour;
                this.mColourBlends.positions = [0, 1];
            }
            else {
                this.mColourBlends = this.mBlend.generateColorBlend(this.mColour, this.colorSpace);
            }
            this.resetFunction();
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PdfRadialGradientBrush.prototype, "rectangle", {
        /**
         * Gets or sets the rectangle.
         * @public
         */
        get: function () {
            return this.mBoundaries;
        },
        set: function (value) {
            this.mBoundaries = value;
            this.bBox = PdfArray.fromRectangle(value);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PdfRadialGradientBrush.prototype, "extend", {
        /**
         * Gets or sets the value indicating whether the gradient
         *  should extend starting and ending points.
         * @public
         */
        get: function () {
            var result1 = PdfExtend.None;
            var extend1 = (this.shading.items.getValue(this.mDictionaryProperties.extend));
            if (extend1 !== null && typeof extend1 !== 'undefined') {
                var extStart = (extend1.items(0));
                var extEnd = (extend1.items(1));
                if (extStart.value) {
                    result1 = (result1 | PdfExtend.Start);
                }
                if (extEnd.value) {
                    result1 = (result1 | PdfExtend.End);
                }
            }
            return result1;
        },
        set: function (value) {
            var extend = (this.shading.items.getValue(this.mDictionaryProperties.extend));
            var extStart;
            var extEnd1;
            if (extend == null && typeof extend === 'undefined') {
                extStart = new PdfBoolean(false);
                extEnd1 = new PdfBoolean(false);
                extend = new PdfArray();
                extend.add(extStart);
                extend.add(extEnd1);
                this.shading.items.setValue(this.mDictionaryProperties.extend, extend);
            }
            else {
                extStart = (extend.items(0));
                extEnd1 = (extend.items(1));
            }
        },
        enumerable: true,
        configurable: true
    });
    //Implementation
    /**
     * Sets the points.
     * @param pointStart The point start.
     * @param pointEnd The point end.
     * @param radiusStart The radius start.
     * @param radiusEnd The radius end.
     */
    PdfRadialGradientBrush.prototype.setPoints = function (pointStart, pointEnd, radiusStart, radiusEnd) {
        var points = new PdfArray();
        points.add(new PdfNumber(pointStart.x));
        points.add(new PdfNumber(this.updateY(pointStart.y)));
        points.add(new PdfNumber(radiusStart));
        points.add(new PdfNumber(pointEnd.x));
        points.add(new PdfNumber(this.updateY(pointEnd.y)));
        if ((radiusStart !== radiusEnd)) {
            points.add(new PdfNumber(radiusEnd));
        }
        else {
            points.add(new PdfNumber(0));
        }
        this.shading.items.setValue(this.mDictionaryProperties.coords, points);
    };
    /**
     * Update y co-ordinate.
     * @param y Y co-ordinate.
     */
    PdfRadialGradientBrush.prototype.updateY = function (y) {
        if (y !== 0) {
            return -y;
        }
        else {
            return y;
        }
    };
    /**
     * Initializess the shading dictionary.
     * @private
     */
    PdfRadialGradientBrush.prototype.initShading = function () {
        this.colorSpace = PdfColorSpace.Rgb;
        this.function = this.mColourBlends.getFunction(this.colorSpace);
        this.shading.items.setValue(this.mDictionaryProperties.shadingType, new PdfNumber((ShadingType.Radial)));
    };
    //Overrides
    /**
     * Creates a new copy of a brush.
     * @public
     */
    PdfRadialGradientBrush.prototype.clone = function () {
        var rBrush = this;
        rBrush.resetPatternDictionary(new PdfDictionary(this.patternDictionary));
        rBrush.shading = new PdfDictionary();
        rBrush.initShading();
        rBrush.setPoints(this.mPointStart, this.mPointEnd, this.mRadiusStart, this.mRadiusEnd);
        if (rBrush instanceof PdfRadialGradientBrush) {
            if ((this.matrix !== null && typeof this.matrix !== 'undefined')) {
                rBrush.matrix = this.matrix.clone();
            }
        }
        if ((this.mColour !== null && typeof this.mColour !== 'undefined')) {
            rBrush.mColour = (this.mColour);
        }
        if ((this.blend !== null && typeof this.blend !== 'undefined')) {
            rBrush.blend = this.blend.clonePdfBlend();
        }
        else if ((this.interpolationColors !== null && typeof this.interpolationColors !== 'undefined')) {
            rBrush.interpolationColors = this.interpolationColors.cloneColorBlend();
        }
        rBrush.extend = this.extend;
        this.cloneBackgroundValue(rBrush);
        this.cloneAntiAliasingValue(rBrush);
        return rBrush;
    };
    /**
     * Resets the function.
     * @public
     */
    PdfRadialGradientBrush.prototype.resetFunction = function () {
        this.function = this.mColourBlends.getFunction(this.colorSpace);
    };
    return PdfRadialGradientBrush;
}(PdfGradientBrush));
export { PdfRadialGradientBrush };
