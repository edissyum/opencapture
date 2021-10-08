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
import { PdfColorSpace } from './../enum';
import { PdfColor } from './../pdf-color';
import { PdfBrush } from './pdf-brush';
import { PdfDictionary } from '../../primitives/pdf-dictionary';
import { DictionaryProperties } from './../../input-output/pdf-dictionary-properties';
import { PdfBoolean } from './../../primitives/pdf-boolean';
import { PdfArray } from './../../primitives/pdf-array';
import { PdfName } from '../../primitives/pdf-name';
import { PdfNumber } from '../../primitives/pdf-number';
import { PdfReferenceHolder } from '../../primitives/pdf-reference';
/**
 * `PdfGradientBrush` class provides objects used to fill the interiors of graphical shapes such as rectangles,
 * ellipses, pies, polygons, and paths.
 * @private
 */
var PdfGradientBrush = /** @class */ (function (_super) {
    __extends(PdfGradientBrush, _super);
    //Constructor
    /**
     * Initializes a new instance of the `PdfGradientBrush` class.
     * @public
     */
    /* tslint:disable-next-line:max-line-length */
    function PdfGradientBrush(shading) {
        var _this = _super.call(this) || this;
        // Fields
        /**
         * Local variable to store the background color.
         * @private
         */
        _this.mbackground = new PdfColor(255, 255, 255);
        /**
         * Local variable to store the stroking color.
         * @private
         */
        _this.mbStroking = false;
        /**
         * Local variable to store the function.
         * @private
         */
        _this.mfunction = null;
        /**
         * Local variable to store the DictionaryProperties.
         * @private
         */
        _this.dictionaryProperties = new DictionaryProperties();
        _this.mpatternDictionary = new PdfDictionary();
        _this.mpatternDictionary.items.setValue(_this.dictionaryProperties.type, new PdfName(_this.dictionaryProperties.pattern));
        _this.mpatternDictionary.items.setValue(_this.dictionaryProperties.patternType, new PdfNumber(2));
        _this.shading = shading;
        _this.colorSpace = PdfColorSpace.Rgb;
        return _this;
    }
    Object.defineProperty(PdfGradientBrush.prototype, "background", {
        //Properties
        /**
         * Gets or sets the background color of the brush.
         * @public
         */
        get: function () {
            return this.mbackground;
        },
        set: function (value) {
            this.mbackground = value;
            var sh = this.shading;
            if (value.isEmpty) {
                sh.remove(this.dictionaryProperties.background);
            }
            else {
                sh.items.setValue(this.dictionaryProperties.background, value.toArray(this.colorSpace));
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PdfGradientBrush.prototype, "antiAlias", {
        /**
         * Gets or sets a value indicating whether use anti aliasing algorithm.
         * @public
         */
        get: function () {
            var sh = this.shading;
            var aa = (sh.items.getValue(this.dictionaryProperties.antiAlias));
            return aa.value;
        },
        set: function (value) {
            var sh = this.shading;
            var aa = (sh.items.getValue(this.dictionaryProperties.antiAlias));
            if ((aa == null && typeof aa === 'undefined')) {
                aa = new PdfBoolean(value);
                sh.items.setValue(this.dictionaryProperties.antiAlias, aa);
            }
            else {
                aa.value = value;
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PdfGradientBrush.prototype, "function", {
        /**
         * Gets or sets the function of the brush.
         * @protected
         */
        get: function () {
            return this.mfunction;
        },
        set: function (value) {
            this.mfunction = value;
            if (value != null && typeof value !== 'undefined') {
                this.shading.items.setValue(this.dictionaryProperties.function, new PdfReferenceHolder(this.mfunction));
            }
            else {
                this.shading.remove(this.dictionaryProperties.function);
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PdfGradientBrush.prototype, "bBox", {
        /**
         * Gets or sets the boundary box of the brush.
         * @protected
         */
        get: function () {
            var sh = this.shading;
            var box = (sh.items.getValue(this.dictionaryProperties.bBox));
            return box;
        },
        set: function (value) {
            var sh = this.shading;
            if (value == null && typeof value === 'undefined') {
                sh.remove(this.dictionaryProperties.bBox);
            }
            else {
                sh.items.setValue(this.dictionaryProperties.bBox, value);
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PdfGradientBrush.prototype, "colorSpace", {
        /**
         * Gets or sets the color space of the brush.
         * @public
         */
        get: function () {
            return this.mcolorSpace;
        },
        set: function (value) {
            var colorSpace = this.shading.items.getValue(this.dictionaryProperties.colorSpace);
            if ((value !== this.mcolorSpace) || (colorSpace == null)) {
                this.mcolorSpace = value;
                var csValue = this.colorSpaceToDeviceName(value);
                this.shading.items.setValue(this.dictionaryProperties.colorSpace, new PdfName(csValue));
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PdfGradientBrush.prototype, "stroking", {
        /**
         * Gets or sets a value indicating whether this PdfGradientBrush is stroking.
         * @public
         */
        get: function () {
            return this.mbStroking;
        },
        set: function (value) {
            this.mbStroking = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PdfGradientBrush.prototype, "patternDictionary", {
        /**
         * Gets the pattern dictionary.
         * @protected
         */
        get: function () {
            if (this.mpatternDictionary == null) {
                this.mpatternDictionary = new PdfDictionary();
            }
            return this.mpatternDictionary;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PdfGradientBrush.prototype, "shading", {
        /**
         * Gets or sets the shading dictionary.
         * @protected
         */
        get: function () {
            return this.mshading;
        },
        set: function (value) {
            if (value == null) {
                throw new Error('ArgumentNullException : Shading');
            }
            if (value !== this.mshading) {
                this.mshading = value;
                this.patternDictionary.items.setValue(this.dictionaryProperties.shading, new PdfReferenceHolder(this.mshading));
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PdfGradientBrush.prototype, "matrix", {
        /**
         * Gets or sets the transformation matrix.
         * @public
         */
        get: function () {
            return this.mmatrix;
        },
        set: function (value) {
            if (value == null) {
                throw new Error('ArgumentNullException : Matrix');
            }
            if (value !== this.mmatrix) {
                this.mmatrix = value.clone();
                var m = new PdfArray(this.mmatrix.matrix.elements);
                this.mpatternDictionary.items.setValue(this.dictionaryProperties.matrix, m);
            }
        },
        enumerable: true,
        configurable: true
    });
    //Overrides
    /**
     * Monitors the changes of the brush and modify PDF state respectfully.
     * @param brush The brush.
     * @param streamWriter The stream writer.
     * @param getResources The get resources delegate.
     * @param saveChanges if set to true the changes should be saved anyway.
     * @param currentColorSpace The current color space.
     */
    /* tslint:disable-next-line:max-line-length */
    PdfGradientBrush.prototype.monitorChanges = function (brush, streamWriter, getResources, saveChanges, currentColorSpace) {
        var diff = false;
        if (brush instanceof PdfGradientBrush) {
            if ((this.colorSpace !== currentColorSpace)) {
                this.colorSpace = currentColorSpace;
                this.resetFunction();
            }
            //  Set the /Pattern colour space.
            streamWriter.setColorSpace('Pattern', this.mbStroking);
            //  Set the pattern for non-stroking operations.
            var resources = getResources.getResources();
            var name_1 = resources.getName(this);
            streamWriter.setColourWithPattern(null, name_1, this.mbStroking);
            diff = true;
        }
        return diff;
    };
    /**
     * Resets the changes, which were made by the brush.
     * In other words resets the state to the initial one.
     * @param streamWriter The stream writer.
     */
    PdfGradientBrush.prototype.resetChanges = function (streamWriter) {
        //  Unable reset.
    };
    //Implementation
    /**
     * Converts colorspace enum to a PDF name.
     * @param colorSpace The color space enum value.
     */
    PdfGradientBrush.prototype.colorSpaceToDeviceName = function (colorSpace) {
        var result;
        switch (colorSpace) {
            case PdfColorSpace.Rgb:
                result = 'DeviceRGB';
                break;
        }
        return result;
    };
    /**
     * Resets the pattern dictionary.
     * @param dictionary A new pattern dictionary.
     */
    PdfGradientBrush.prototype.resetPatternDictionary = function (dictionary) {
        this.mpatternDictionary = dictionary;
    };
    /**
     * Clones the anti aliasing value.
     * @param brush The brush.
     */
    PdfGradientBrush.prototype.cloneAntiAliasingValue = function (brush) {
        if ((brush == null)) {
            throw new Error('ArgumentNullException : brush');
        }
        var sh = this.shading;
        var aa = (sh.items.getValue(this.dictionaryProperties.antiAlias));
        if ((aa != null)) {
            brush.shading.items.setValue(this.dictionaryProperties.antiAlias, new PdfBoolean(aa.value));
        }
    };
    /**
     * Clones the background value.
     * @param brush The brush.
     */
    PdfGradientBrush.prototype.cloneBackgroundValue = function (brush) {
        var background = this.background;
        if (!background.isEmpty) {
            brush.background = background;
        }
    };
    Object.defineProperty(PdfGradientBrush.prototype, "element", {
        /* tslint:enable */
        // IPdfWrapper Members
        /**
         * Gets the `element`.
         * @private
         */
        get: function () {
            return this.patternDictionary;
        },
        enumerable: true,
        configurable: true
    });
    return PdfGradientBrush;
}(PdfBrush));
export { PdfGradientBrush };
