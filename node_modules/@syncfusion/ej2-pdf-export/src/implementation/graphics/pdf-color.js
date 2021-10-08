import { PdfColorSpace } from './enum';
import { Operators } from './../input-output/pdf-operators';
import { Dictionary } from './../collections/dictionary';
import { PdfNumber } from './../primitives/pdf-number';
import { PdfArray } from './../primitives/pdf-array';
/**
 * Implements structures and routines working with `color`.
 * ```typescript
 * // create a new PDF document
 * let document : PdfDocument = new PdfDocument();
 * // add a new page to the document
 * let page1 : PdfPage = document.pages.add();
 * // set the font
 * let font : PdfStandardFont = new PdfStandardFont(PdfFontFamily.Helvetica, 20);
 * //
 * // set color
 * let brushColor : PdfColor = new PdfColor(0, 0, 0);
 * //
 * // create black brush
 * let blackBrush : PdfSolidBrush = new PdfSolidBrush(brushColor);
 * // draw the text
 * page1.graphics.drawString('Hello World', font, blackBrush, new PointF(0, 0));
 * // save the document
 * document.save('output.pdf');
 * // destroy the document
 * document.destroy();
 * ```
 * @default black color
 */
var PdfColor = /** @class */ (function () {
    function PdfColor(color1, color2, color3, color4) {
        if (typeof color1 === 'undefined') {
            if (typeof color2 !== 'undefined' && typeof color3 !== 'undefined' && typeof color4 !== 'undefined') {
                this.assignRGB(color2, color3, color4);
            }
            else {
                this.filled = false;
            }
        }
        else if (color1 instanceof PdfColor) {
            this.redColor = color1.r;
            this.greenColor = color1.g;
            this.blueColor = color1.b;
            this.grayColor = color1.gray;
            this.alpha = color1.alpha;
            this.filled = (this.alpha !== 0);
            /* tslint:disable-next-line:max-line-length */
        }
        else if (typeof color1 === 'number' && typeof color2 === 'undefined' && typeof color3 === 'undefined' && typeof color4 === 'undefined') {
            if (color1 < 0) {
                color1 = 0;
            }
            if (color1 > 1) {
                color1 = 1;
            }
            this.redColor = color1 * PdfColor.maxColourChannelValue;
            this.greenColor = color1 * PdfColor.maxColourChannelValue;
            this.blueColor = color1 * PdfColor.maxColourChannelValue;
            this.cyanColor = color1;
            this.magentaColor = color1;
            this.yellowColor = color1;
            this.blackColor = color1;
            this.grayColor = color1;
            this.alpha = PdfColor.maxColourChannelValue;
            this.filled = true;
        }
        else if (typeof color4 === 'undefined') {
            this.assignRGB(color1, color2, color3);
        }
        else {
            this.assignRGB(color2, color3, color4, color1);
        }
    }
    /**
     * `Assign` red, green, blue colors with alpha value..
     * @private
     */
    PdfColor.prototype.assignRGB = function (r, g, b, a) {
        if (typeof r === 'undefined' || typeof g === 'undefined' || typeof b === 'undefined') {
            this.filled = false;
        }
        else {
            this.cyanColor = 0;
            this.magentaColor = 0;
            this.yellowColor = 0;
            this.blackColor = 0;
            this.grayColor = 0;
            this.redColor = r;
            this.greenColor = g;
            this.blueColor = b;
            if (typeof a === 'undefined') {
                this.alpha = PdfColor.maxColourChannelValue;
            }
            else {
                this.alpha = a;
            }
            this.filled = true;
            this.assignCMYK(r, g, b);
        }
    };
    /**
     * `Calculate and assign` cyan, megenta, yellow colors from rgb values..
     * @private
     */
    PdfColor.prototype.assignCMYK = function (r, g, b) {
        var red = r / PdfColor.maxColourChannelValue;
        var green = g / PdfColor.maxColourChannelValue;
        var blue = b / PdfColor.maxColourChannelValue;
        var black = PdfNumber.min(1 - red, 1 - green, 1 - blue);
        var cyan = (black === 1.0) ? 0 : (1 - red - black) / (1 - black);
        var magenta = (black === 1.0) ? 0 : (1 - green - black) / (1 - black);
        var yellow = (black === 1.0) ? 0 : (1 - blue - black) / (1 - black);
        this.blackColor = black;
        this.cyanColor = cyan;
        this.magentaColor = magenta;
        this.yellowColor = yellow;
    };
    Object.defineProperty(PdfColor.prototype, "r", {
        //Properties
        // public static get Empty():PdfColor
        // {
        //     return this.s_emptyColor
        // }
        /**
         * Gets or sets `Red` channel value.
         * @private
         */
        get: function () {
            return this.redColor;
        },
        set: function (value) {
            this.redColor = value;
            this.assignCMYK(this.redColor, this.greenColor, this.blueColor);
            this.filled = true;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PdfColor.prototype, "red", {
        /**
         * Gets the `Red` color
         * @private
         */
        get: function () {
            return (this.r / PdfColor.maxColourChannelValue);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PdfColor.prototype, "b", {
        /**
         * Gets or sets `Blue` channel value.
         * @private
         */
        get: function () {
            return this.blueColor;
        },
        set: function (value) {
            this.blueColor = value;
            this.assignCMYK(this.redColor, this.greenColor, this.blueColor);
            this.filled = true;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PdfColor.prototype, "blue", {
        /**
         * Gets the `blue` color.
         * @private
         */
        get: function () {
            return (this.b / PdfColor.maxColourChannelValue);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PdfColor.prototype, "c", {
        /**
         * Gets or sets `Cyan` channel value.
         * @private
         */
        get: function () {
            return this.cyanColor;
        },
        set: function (value) {
            if (value < 0) {
                this.cyanColor = 0;
            }
            else if (value > 1) {
                this.cyanColor = 1;
            }
            else {
                this.cyanColor = value;
            }
            this.assignRGB(this.cyanColor, this.magentaColor, this.yellowColor, this.blackColor);
            this.filled = true;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PdfColor.prototype, "k", {
        /**
         * Gets or sets `Black` channel value.
         * @private
         */
        get: function () {
            return this.blackColor;
        },
        set: function (value) {
            if ((value < 0)) {
                this.blackColor = 0;
            }
            else if ((value > 1)) {
                this.blackColor = 1;
            }
            else {
                this.blackColor = value;
            }
            this.assignRGB(this.cyanColor, this.magentaColor, this.yellowColor, this.blackColor);
            this.filled = true;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PdfColor.prototype, "m", {
        /**
         * Gets or sets `Magenta` channel value.
         * @private
         */
        get: function () {
            return this.magentaColor;
        },
        set: function (value) {
            if ((value < 0)) {
                this.magentaColor = 0;
            }
            else if ((value > 1)) {
                this.magentaColor = 1;
            }
            else {
                this.magentaColor = value;
            }
            this.assignRGB(this.cyanColor, this.magentaColor, this.yellowColor, this.blackColor);
            this.filled = true;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PdfColor.prototype, "y", {
        /**
         * Gets or sets `Yellow` channel value.
         * @private
         */
        get: function () {
            return this.yellowColor;
        },
        set: function (value) {
            if ((value < 0)) {
                this.yellowColor = 0;
            }
            else if ((value > 1)) {
                this.yellowColor = 1;
            }
            else {
                this.yellowColor = value;
            }
            this.assignRGB(this.cyanColor, this.magentaColor, this.yellowColor, this.blackColor);
            this.filled = true;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PdfColor.prototype, "g", {
        /**
         *  Gets or sets `Green` channel value.
         * @private
         */
        get: function () {
            return this.greenColor;
        },
        set: function (value) {
            this.greenColor = value;
            this.assignCMYK(this.redColor, this.greenColor, this.blueColor);
            this.filled = true;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PdfColor.prototype, "green", {
        /**
         * Gets the `Green` color.
         * @private
         */
        get: function () {
            return (this.g / PdfColor.maxColourChannelValue);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PdfColor.prototype, "gray", {
        /**
         * Gets or sets `Gray` channel value.
         * @private
         */
        get: function () {
            return ((((this.redColor + this.greenColor) + this.blueColor)) / (PdfColor.maxColourChannelValue * 3));
        },
        set: function (value) {
            if (value < 0) {
                this.grayColor = 0;
            }
            else if (value > 1) {
                this.grayColor = 1;
            }
            else {
                this.grayColor = value;
            }
            this.r = (this.grayColor * PdfColor.maxColourChannelValue);
            this.g = (this.grayColor * PdfColor.maxColourChannelValue);
            this.b = (this.grayColor * PdfColor.maxColourChannelValue);
            this.assignCMYK(this.redColor, this.greenColor, this.blueColor);
            this.filled = true;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PdfColor.prototype, "isEmpty", {
        /**
         * Gets whether the PDFColor `is Empty` or not.
         * @private
         */
        get: function () {
            return !this.filled;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PdfColor.prototype, "a", {
        /**
         * Gets or sets `Alpha` channel value.
         * @private
         */
        get: function () {
            return this.alpha;
        },
        set: function (value) {
            if (value < 0) {
                this.alpha = 0;
            }
            else {
                // if (this.alpha !== value) {
                this.alpha = value;
                // }
            }
            this.filled = true;
        },
        enumerable: true,
        configurable: true
    });
    //Public methods
    /**
     * Converts `PDFColor to PDF string` representation.
     * @private
     */
    PdfColor.prototype.toString = function (colorSpace, stroke) {
        if (this.isEmpty) {
            return '';
        }
        var str = '';
        switch (colorSpace) {
            case PdfColorSpace.Rgb:
                str = this.rgbToString(stroke);
                break;
            case PdfColorSpace.GrayScale:
                str = this.grayScaleToString(stroke);
                break;
            case PdfColorSpace.Cmyk:
                str = this.cmykToString(stroke);
                break;
        }
        return str;
    };
    /**
     * Sets `GrayScale` color.
     * @private
     */
    PdfColor.prototype.grayScaleToString = function (ifStroking) {
        var gray = this.gray;
        var colour = '';
        var obj = null;
        /* tslint:disable-next-line:max-line-length */
        obj = (ifStroking) ? PdfColor.grayStringsSroke.containsKey(gray) ? PdfColor.grayStringsSroke.getValue(gray) : null : PdfColor.grayStringsFill.containsKey(gray) ? PdfColor.grayStringsFill.getValue(gray) : null;
        if (obj == null) {
            if (ifStroking) {
                colour = gray.toString() + ' G';
                PdfColor.grayStringsSroke.setValue(gray, colour);
            }
        }
        else {
            colour = obj.toString();
        }
        return colour + Operators.newLine;
    };
    /**
     * Sets `RGB` color.
     * @private
     */
    PdfColor.prototype.rgbToString = function (ifStroking) {
        var r = this.r;
        var g = this.g;
        var b = this.b;
        var key = (r << 16) + (g << 8) + b;
        if (ifStroking) {
            key += 1 << 24;
        }
        var colour = '';
        var obj = null;
        if (PdfColor.rgbStrings.containsKey(key)) {
            obj = PdfColor.rgbStrings.getValue(key);
        }
        if (obj == null) {
            var red = r / PdfColor.maxColourChannelValue;
            var green = g / PdfColor.maxColourChannelValue;
            var blue = b / PdfColor.maxColourChannelValue;
            if (ifStroking) {
                colour = red.toString() + ' ' + green.toString() + ' ' + blue.toString() + ' RG';
            }
            else {
                colour = red.toString() + ' ' + green.toString() + ' ' + blue.toString() + ' rg';
            }
            PdfColor.rgbStrings.setValue(key, colour);
        }
        else {
            colour = obj.toString();
        }
        return colour + Operators.newLine;
    };
    /***
     * Sets `CMYK` color.
     * @private
     */
    PdfColor.prototype.cmykToString = function (ifStroking) {
        var cyan = this.c;
        var magenta = this.m;
        var yellow = this.y;
        var black = this.b;
        var colour = '';
        colour = cyan.toString() + ' ' + magenta.toString() + ' ' + yellow.toString() + ' ' + black.toString() + ' K';
        return colour + Operators.newLine;
    };
    /**
     * Converts `colour to a PDF array`.
     * @private
     */
    PdfColor.prototype.toArray = function (colorSpace) {
        var array = new PdfArray();
        switch (colorSpace) {
            case PdfColorSpace.Rgb:
                array.add(new PdfNumber(this.red));
                array.add(new PdfNumber(this.green));
                array.add(new PdfNumber(this.blue));
                break;
        }
        return array;
    };
    //Fields
    /**
     * Holds `RGB colors` converted into strings.
     * @private
     */
    PdfColor.rgbStrings = new Dictionary();
    /**
     * Holds Gray scale colors converted into strings for `stroking`.
     * @private
     */
    PdfColor.grayStringsSroke = new Dictionary();
    /**
     * Holds Gray scale colors converted into strings for `filling`.
     * @private
     */
    PdfColor.grayStringsFill = new Dictionary();
    /**
     * `Max value` of color channel.
     * @private
     */
    PdfColor.maxColourChannelValue = 255.0;
    return PdfColor;
}());
export { PdfColor };
