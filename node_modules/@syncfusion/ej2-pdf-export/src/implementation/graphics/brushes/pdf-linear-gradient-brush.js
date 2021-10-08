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
 * PdfLinearGradientBrush.ts class for EJ2-PDF
 */
import { PdfColorSpace } from './../enum';
import { PdfColor } from './../pdf-color';
import { PointF, Rectangle } from './../../drawing/pdf-drawing';
import { PdfDictionary } from '../../primitives/pdf-dictionary';
import { DictionaryProperties } from './../../input-output/pdf-dictionary-properties';
import { PdfBoolean } from '../../primitives/pdf-boolean';
import { PdfArray } from './../../primitives/pdf-array';
import { PdfNumber } from './../../primitives/pdf-number';
import { PdfColorBlend } from './pdf-color-blend';
import { PdfGradientBrush } from './pdf-gradient-brush';
import { PdfExtend, PdfLinearGradientMode, ShadingType } from './enum';
/**
 * `PdfLinearGradientBrush` Implements linear gradient brush by using PDF axial shading pattern.
 * @private
 */
var PdfLinearGradientBrush = /** @class */ (function (_super) {
    __extends(PdfLinearGradientBrush, _super);
    /**
     * Initializes a new instance of the `PdfLinearGradientBrush` class.
     * @public
     */
    /* tslint:disable-next-line:max-line-length */
    function PdfLinearGradientBrush(arg1, arg2, arg3, arg4) {
        var _this = _super.call(this, new PdfDictionary()) || this;
        /**
         * Local variable to store the dictionary properties.
         * @private
         */
        _this.mDictionaryProperties = new DictionaryProperties();
        if (arg1 instanceof PointF && arg2 instanceof PointF && arg3 instanceof PdfColor && arg4 instanceof PdfColor) {
            _this.initialize(arg3, arg4);
            _this.mPointStart = arg1;
            _this.mPointEnd = arg2;
            _this.setPoints(_this.mPointStart, _this.mPointEnd);
        }
        else if (arg1 instanceof Rectangle) {
            _this.initialize(arg2, arg3);
            /* tslint:disable-next-line:max-line-length */
            if ((arg4 === PdfLinearGradientMode.BackwardDiagonal || arg4 === PdfLinearGradientMode.ForwardDiagonal || arg4 === PdfLinearGradientMode.Horizontal || arg4 === PdfLinearGradientMode.Vertical)) {
                _this.mBoundaries = arg1;
                switch (arg4) {
                    case PdfLinearGradientMode.BackwardDiagonal:
                        _this.mPointStart = new PointF(arg1.right, arg1.top);
                        _this.mPointEnd = new PointF(arg1.left, arg1.bottom);
                        break;
                    case PdfLinearGradientMode.ForwardDiagonal:
                        _this.mPointStart = new PointF(arg1.left, arg1.top);
                        _this.mPointEnd = new PointF(arg1.right, arg1.bottom);
                        break;
                    case PdfLinearGradientMode.Horizontal:
                        _this.mPointStart = new PointF(arg1.left, arg1.top);
                        _this.mPointEnd = new PointF(arg1.right, arg1.top);
                        break;
                    case PdfLinearGradientMode.Vertical:
                        _this.mPointStart = new PointF(arg1.left, arg1.top);
                        _this.mPointEnd = new PointF(arg1.left, arg1.bottom);
                        break;
                    default:
                        throw new Error('ArgumentException -- Unsupported linear gradient mode: ' + arg4 + ' mode');
                }
                _this.setPoints(_this.mPointStart, _this.mPointEnd);
            }
            else if (typeof arg4 === 'number' && typeof arg4 !== 'undefined') {
                _this.mBoundaries = arg1;
                arg4 = arg4 % 360;
                if ((arg4 === 0)) {
                    _this.mPointStart = new PointF(arg1.left, arg1.top);
                    _this.mPointEnd = new PointF(arg1.right, arg1.top);
                }
                else if ((arg4 === 90)) {
                    _this.mPointStart = new PointF(arg1.left, arg1.top);
                    _this.mPointEnd = new PointF(arg1.left, arg1.bottom);
                }
                else if ((arg4 === 180)) {
                    _this.mPointEnd = new PointF(arg1.left, arg1.top);
                    _this.mPointStart = new PointF(arg1.right, arg1.top);
                }
                else if ((arg4 === 270)) {
                    _this.mPointEnd = new PointF(arg1.left, arg1.top);
                    _this.mPointStart = new PointF(arg1.left, arg1.bottom);
                }
                else {
                    var d2r = (Math.PI / 180);
                    var radAngle = (arg4 * d2r);
                    var k = Math.tan(radAngle);
                    var x = (_this.mBoundaries.left
                        + ((_this.mBoundaries.right - _this.mBoundaries.left) / 2));
                    var y = (_this.mBoundaries.top
                        + ((_this.mBoundaries.bottom - _this.mBoundaries.top) / 2));
                    var centre = new PointF(x, y);
                    x = (_this.mBoundaries.width / (2 * (Math.cos(radAngle))));
                    y = ((k * x));
                    x = (x + centre.x);
                    y = (y + centre.y);
                    var p1 = new PointF(x, y);
                    var cp1 = _this.subPoints(p1, centre);
                    //  P1 - P0
                    var p = _this.choosePoint(arg4);
                    var coef = (_this.mulPoints(_this.subPoints(p, centre), cp1)
                        / _this.mulPoints(cp1, cp1));
                    _this.mPointEnd = _this.addPoints(centre, _this.mulPoint(cp1, coef));
                    //  Parametric line equation.
                    _this.mPointStart = _this.addPoints(centre, _this.mulPoint(cp1, (coef * -1)));
                }
                _this.setPoints(_this.mPointEnd, _this.mPointStart);
            }
        }
        return _this;
    }
    /**
     * Initializes a new instance of the `PdfLinearGradientBrush` class.
     * @param color1 The starting color of the gradient.
     * @param color2 The end color of the gradient.
     */
    PdfLinearGradientBrush.prototype.initialize = function (color1, color2) {
        this.mColours = [color1, color2];
        this.mColourBlend = new PdfColorBlend(2);
        this.mColourBlend.positions = [0, 1];
        this.mColourBlend.colors = this.mColours;
        this.initShading();
    };
    Object.defineProperty(PdfLinearGradientBrush.prototype, "blend", {
        //Properties
        /**
         * Gets or sets a PdfBlend that specifies positions
         * and factors that define a custom falloff for the gradient.
         * @public
         */
        get: function () {
            return this.mBlend;
        },
        set: function (value) {
            if ((value == null)) {
                throw new Error('ArgumentNullException : Blend');
            }
            if ((this.mColours == null)) {
                throw new Error('NotSupportedException : There is no starting and ending colours specified.');
            }
            this.mBlend = value;
            //  TODO: generate correct colour blend.
            this.mColourBlend = this.mBlend.generateColorBlend(this.mColours, this.colorSpace);
            this.resetFunction();
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PdfLinearGradientBrush.prototype, "interpolationColors", {
        /**
         * Gets or sets a ColorBlend that defines a multicolor linear gradient.
         * @public
         */
        get: function () {
            return this.mColourBlend;
        },
        set: function (value) {
            if ((value == null)) {
                throw new Error('ArgumentNullException : InterpolationColors');
            }
            this.mBlend = null;
            this.mColours = null;
            this.mColourBlend = value;
            this.resetFunction();
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PdfLinearGradientBrush.prototype, "linearColors", {
        /**
         * Gets or sets the starting and ending colors of the gradient.
         * @public
         */
        get: function () {
            return this.mColours;
        },
        set: function (value) {
            if ((value == null)) {
                throw new Error('ArgumentNullException : LinearColors');
            }
            if ((value.length < 2)) {
                throw new Error('ArgumentException : The array is too small - LinearColors');
            }
            if ((this.mColours == null && typeof this.mColours === 'undefined')) {
                this.mColours = [value[0], value[1]];
            }
            else {
                this.mColours[0] = value[0];
                this.mColours[1] = value[1];
            }
            if ((this.mBlend == null && typeof this.mBlend === 'undefined')) {
                //  Set correct colour blend.
                this.mColourBlend = new PdfColorBlend(2);
                this.mColourBlend.colors = this.mColours;
                this.mColourBlend.positions = [0, 1];
            }
            else {
                this.mColourBlend = this.mBlend.generateColorBlend(this.mColours, this.colorSpace);
            }
            this.resetFunction();
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PdfLinearGradientBrush.prototype, "rectangle", {
        /**
         * Gets a rectangular region that defines the boundaries of the gradient.
         * @public
         */
        get: function () {
            return this.mBoundaries;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PdfLinearGradientBrush.prototype, "extend", {
        /**
         * Gets or sets the value indicating whether the gradient should extend starting and ending points.
         * @public
         */
        get: function () {
            var result = PdfExtend.None;
            var extend = (this.shading.items.getValue(this.mDictionaryProperties.extend));
            if ((extend != null)) {
                var extStart = (extend.items(0));
                var extEnd = (extend.items(1));
                if (extStart.value) {
                    result = (result | PdfExtend.Start);
                }
                if (extEnd.value) {
                    result = (result | PdfExtend.End);
                }
            }
            return result;
        },
        set: function (value) {
            var extend = (this.shading.items.getValue(this.mDictionaryProperties.extend));
            var extStart;
            var extEnd;
            if ((extend == null)) {
                extStart = new PdfBoolean(false);
                extEnd = new PdfBoolean(false);
                extend = new PdfArray();
                extend.add(extStart);
                extend.add(extEnd);
                this.shading.items.setValue(this.mDictionaryProperties.extend, extend);
            }
            else {
                extStart = (extend.items(0));
                extEnd = (extend.items(1));
            }
            // extStart.value = ((value && PdfExtend.Start) > 0);
            // extEnd.value = ((value && PdfExtend.End) > 0);
        },
        enumerable: true,
        configurable: true
    });
    //Implementation
    /**
     * Adds two points to each other.
     * @param point1 The point1.
     * @param point2 The point2.
     */
    PdfLinearGradientBrush.prototype.addPoints = function (point1, point2) {
        var x = (point1.x + point2.x);
        var y = (point1.y + point2.y);
        var result = new PointF(x, y);
        return result;
    };
    /**
     * Subs the second point from the first one.
     * @param point1 The point1.
     * @param point2 The point2.
     */
    PdfLinearGradientBrush.prototype.subPoints = function (point1, point2) {
        var x = (point1.x - point2.x);
        var y = (point1.y - point2.y);
        var result = new PointF(x, y);
        return result;
    };
    /**
     * Makes scalar multiplication of two points.
     * @param point1 The point1.
     * @param point2 The point2.
     */
    PdfLinearGradientBrush.prototype.mulPoints = function (point1, point2) {
        var result = ((point1.x * point2.x) + (point1.y * point2.y));
        return result;
    };
    /**
     * Multiplies the point by the value specified.
     * @param point The point1.
     * @param value The value.
     */
    PdfLinearGradientBrush.prototype.mulPoint = function (point, value) {
        point.x = (point.x * value);
        point.y = (point.y * value);
        return point;
    };
    /**
     * Choose the point according to the angle.
     * @param angle The angle.
     */
    PdfLinearGradientBrush.prototype.choosePoint = function (angle) {
        var point = new PointF(0, 0);
        //  Choose the correct point.
        if ((angle < 90) && (angle > 0)) {
            point = new PointF(this.mBoundaries.right, this.mBoundaries.bottom);
        }
        else if ((angle < 180) && (angle > 90)) {
            point = new PointF(this.mBoundaries.left, this.mBoundaries.bottom);
        }
        else if ((angle < 270) && (angle > 180)) {
            point = new PointF(this.mBoundaries.left, this.mBoundaries.top);
        }
        else if (angle > 270) {
            point = new PointF(this.mBoundaries.right, this.mBoundaries.top);
        }
        else {
            throw new Error('PdfException - Internal error.');
        }
        return point;
    };
    /**
     * Sets the start and end points.
     * @param point1 The point1.
     * @param point2 The point2.
     */
    PdfLinearGradientBrush.prototype.setPoints = function (point1, point2) {
        var points = new PdfArray();
        points.add(new PdfNumber(point1.x));
        points.add(new PdfNumber(this.updateY(point1.y)));
        points.add(new PdfNumber(point2.x));
        points.add(new PdfNumber(this.updateY(point2.y)));
        this.shading.items.setValue(this.mDictionaryProperties.coords, points);
    };
    /**
     * Updates y co-ordinate.
     * @param y Y co-ordinate..
     */
    PdfLinearGradientBrush.prototype.updateY = function (y) {
        if (y !== 0) {
            return -y;
        }
        else {
            return y;
        }
    };
    //Overrides
    /**
     * Initializes the shading dictionary.
     * @private
     */
    PdfLinearGradientBrush.prototype.initShading = function () {
        this.colorSpace = PdfColorSpace.Rgb;
        this.function = this.mColourBlend.getFunction(this.colorSpace);
        this.shading.items.setValue(this.mDictionaryProperties.shadingType, new PdfNumber((ShadingType.Axial)));
    };
    //Overrides
    /**
     * Creates a new copy of a brush.
     * @public
     */
    PdfLinearGradientBrush.prototype.clone = function () {
        var brush = this;
        brush.resetPatternDictionary(new PdfDictionary(this.patternDictionary));
        brush.shading = new PdfDictionary();
        brush.initShading();
        brush.setPoints(brush.mPointStart, brush.mPointEnd);
        if (brush !== null && brush instanceof PdfLinearGradientBrush) {
            if ((this.matrix != null && typeof this.matrix !== 'undefined')) {
                brush.matrix = this.matrix.clone();
            }
        }
        if ((this.mColours != null && typeof this.mColours !== 'undefined')) {
            brush.mColours = (this.mColours);
        }
        if ((this.blend != null && typeof this.blend !== 'undefined')) {
            brush.blend = this.blend.clonePdfBlend();
        }
        else if ((this.interpolationColors != null && typeof this.interpolationColors !== 'undefined')) {
            brush.interpolationColors = this.interpolationColors.cloneColorBlend();
        }
        brush.extend = this.extend;
        this.cloneBackgroundValue(brush);
        this.cloneAntiAliasingValue(brush);
        return brush;
    };
    /**
     * Resets the function.
     * @public
     */
    PdfLinearGradientBrush.prototype.resetFunction = function () {
        this.function = this.mColourBlend.getFunction(this.colorSpace);
    };
    return PdfLinearGradientBrush;
}(PdfGradientBrush));
export { PdfLinearGradientBrush };
