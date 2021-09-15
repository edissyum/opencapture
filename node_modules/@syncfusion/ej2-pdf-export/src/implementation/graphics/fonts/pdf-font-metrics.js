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
import { PdfFont } from './pdf-font';
import { PdfSubSuperScript } from './enum';
import { PdfArray } from './../../primitives/pdf-array';
/**
 * `Metrics` of the font.
 * @private
 */
var PdfFontMetrics = /** @class */ (function () {
    function PdfFontMetrics() {
        /**
         * `Line gap`.
         * @private
         */
        this.lineGap = 0;
    }
    //  Public methods
    /**
     * Returns `ascent` taking into consideration font`s size.
     * @private
     */
    PdfFontMetrics.prototype.getAscent = function (format) {
        var returnValue = this.ascent * PdfFont.charSizeMultiplier * this.getSize(format);
        return returnValue;
    };
    /**
     * Returns `descent` taking into consideration font`s size.
     * @private
     */
    PdfFontMetrics.prototype.getDescent = function (format) {
        var returnValue = this.descent * PdfFont.charSizeMultiplier * this.getSize(format);
        return returnValue;
    };
    /**
     * Returns `Line gap` taking into consideration font`s size.
     * @private
     */
    PdfFontMetrics.prototype.getLineGap = function (format) {
        var returnValue = this.lineGap * PdfFont.charSizeMultiplier * this.getSize(format);
        return returnValue;
    };
    /**
     * Returns `height` taking into consideration font`s size.
     * @private
     */
    PdfFontMetrics.prototype.getHeight = function (format) {
        var height;
        var clearTypeFonts = ['cambria', 'candara', 'constantia', 'corbel', 'cariadings'];
        var clearTypeFontCollection = [];
        for (var index = 0; index < clearTypeFonts.length; index++) {
            var font = clearTypeFonts[index];
            clearTypeFontCollection.push(font);
        }
        if (this.getDescent(format) < 0) {
            // if ((clearTypeFontCollection.indexOf(this.name.toLowerCase()) !== -1) && !this.isUnicodeFont) {
            //     height = (this.GetAscent(format) - this.GetDescent(format) - this.GetLineGap(format));
            // } else {
            height = (this.getAscent(format) - this.getDescent(format) + this.getLineGap(format));
            // }
        }
        else {
            height = (this.getAscent(format) + this.getDescent(format) + this.getLineGap(format));
        }
        return height;
    };
    /**
     * Calculates `size` of the font depending on the subscript/superscript value.
     * @private
     */
    PdfFontMetrics.prototype.getSize = function (format) {
        var size = this.size;
        if (format != null) {
            switch (format.subSuperScript) {
                case PdfSubSuperScript.SubScript:
                    size /= this.subScriptSizeFactor;
                    break;
                case PdfSubSuperScript.SuperScript:
                    size /= this.superscriptSizeFactor;
                    break;
            }
        }
        return size;
    };
    /**
     * `Clones` the metrics.
     * @private
     */
    PdfFontMetrics.prototype.clone = function () {
        var metrics = this;
        metrics.widthTable = WidthTable.clone();
        return metrics;
    };
    Object.defineProperty(PdfFontMetrics.prototype, "widthTable", {
        //  Properies
        /**
         * Gets or sets the `width table`.
         * @private
         */
        get: function () {
            return this.internalWidthTable;
        },
        set: function (value) {
            this.internalWidthTable = value;
        },
        enumerable: true,
        configurable: true
    });
    return PdfFontMetrics;
}());
export { PdfFontMetrics };
var WidthTable = /** @class */ (function () {
    function WidthTable() {
    }
    /**
     * Static `clones` this instance of the WidthTable class.
     * @private
     */
    WidthTable.clone = function () {
        return null;
    };
    return WidthTable;
}());
export { WidthTable };
var StandardWidthTable = /** @class */ (function (_super) {
    __extends(StandardWidthTable, _super);
    // Constructors
    /**
     * Initializes a new instance of the `StandardWidthTable` class.
     * @private
     */
    function StandardWidthTable(widths) {
        var _this = _super.call(this) || this;
        if (widths == null) {
            throw new Error('ArgumentNullException:widths');
        }
        _this.widths = widths;
        return _this;
    }
    //Properties
    /**
     * Gets the `32 bit number` at the specified index.
     * @private
     */
    StandardWidthTable.prototype.items = function (index) {
        if (index < 0 || index >= this.widths.length) {
            throw new Error('ArgumentOutOfRangeException:index, The character is not supported by the font.');
        }
        var result = this.widths[index];
        return result;
    };
    Object.defineProperty(StandardWidthTable.prototype, "length", {
        /**
         * Gets the `length` of the internal array.
         * @private
         */
        get: function () {
            return this.widths.length;
        },
        enumerable: true,
        configurable: true
    });
    //Overrides
    /**
     * `Clones` this instance of the WidthTable class.
     * @private
     */
    StandardWidthTable.prototype.clone = function () {
        var swt = this;
        swt.widths = this.widths;
        return swt;
    };
    /**
     * Converts width table to a `PDF array`.
     * @private
     */
    StandardWidthTable.prototype.toArray = function () {
        var arr = new PdfArray(this.widths);
        return arr;
    };
    return StandardWidthTable;
}(WidthTable));
export { StandardWidthTable };
