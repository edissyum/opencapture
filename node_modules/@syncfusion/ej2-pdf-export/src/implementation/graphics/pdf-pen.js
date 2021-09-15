/**
 * PdfPen.ts class for EJ2-PDF
 */
import { PdfColor } from './pdf-color';
import { PdfSolidBrush } from './brushes/pdf-solid-brush';
import { PdfDashStyle, PdfColorSpace } from './enum';
import { PdfBrush } from './brushes/pdf-brush';
/**
 * `PdfPen` class defining settings for drawing operations, that determines the color,
 * width, and style of the drawing elements.
 * ```typescript
 * // create a new PDF document
 * let document : PdfDocument = new PdfDocument();
 * // create a new page
 * let page1 : PdfPage = document.pages.add();
 * // set pen
 * let pen : PdfPen = new PdfPen(new PdfColor(0, 0, 0));
 * // draw rectangle
 * page1.graphics.drawRectangle(pen, new RectangleF({x : 0, y : 0}, {width : 100, height : 50}));
 * // save the document.
 * document.save('output.pdf');
 * // destroy the document
 * document.destroy();
 * ```
 */
var PdfPen = /** @class */ (function () {
    function PdfPen(arg1, arg2) {
        //Fields
        /**
         * Specifies the `color of the pen`.
         * @default new PdfColor()
         * @private
         */
        this.pdfColor = new PdfColor(0, 0, 0);
        /**
         * Specifies the `dash offset of the pen`.
         * @default 0
         * @private
         */
        this.dashOffsetValue = 0;
        /**
         * Specifies the `dash pattern of the pen`.
         * @default [0]
         * @private
         */
        this.penDashPattern = [0];
        /**
         * Specifies the `dash style of the pen`.
         * @default Solid
         * @private
         */
        this.pdfDashStyle = PdfDashStyle.Solid;
        /**
         * Specifies the `line cap of the pen`.
         * @default 0
         * @private
         */
        this.pdfLineCap = 0;
        /**
         * Specifies the `line join of the pen`.
         * @default 0
         * @private
         */
        this.pdfLineJoin = 0;
        /**
         * Specifies the `width of the pen`.
         * @default 1.0
         * @private
         */
        this.penWidth = 1.0;
        /**
         * Specifies the `mitter limit of the pen`.
         * @default 0.0
         * @private
         */
        this.internalMiterLimit = 0.0;
        /**
         * Stores the `colorspace` value.
         * @default Rgb
         * @private
         */
        this.colorSpace = PdfColorSpace.Rgb;
        if (arg1 instanceof PdfBrush) {
            this.setBrush(arg1);
        }
        else if (arg1 instanceof PdfColor) {
            this.color = arg1;
        }
        if (typeof arg2 === 'number') {
            this.width = arg2;
        }
    }
    Object.defineProperty(PdfPen.prototype, "color", {
        //Properties
        /**
         * Gets or sets the `color of the pen`.
         * @private
         */
        get: function () {
            return this.pdfColor;
        },
        set: function (value) {
            this.pdfColor = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PdfPen.prototype, "dashOffset", {
        /**
         * Gets or sets the `dash offset of the pen`.
         * @private
         */
        get: function () {
            if (typeof this.dashOffsetValue === 'undefined' || this.dashOffsetValue == null) {
                return 0;
            }
            else {
                return this.dashOffsetValue;
            }
        },
        set: function (value) {
            this.dashOffsetValue = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PdfPen.prototype, "dashPattern", {
        /**
         * Gets or sets the `dash pattern of the pen`.
         * @private
         */
        get: function () {
            return this.penDashPattern;
        },
        set: function (value) {
            this.penDashPattern = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PdfPen.prototype, "dashStyle", {
        /**
         * Gets or sets the `dash style of the pen`.
         * ```typescript
         * // create a new PDF document
         * let document : PdfDocument = new PdfDocument();
         * // create a new page
         * let page1 : PdfPage = document.pages.add();
         * // set pen
         * let pen : PdfPen = new PdfPen(new PdfColor(0, 0, 0));
         * //
         * // set pen style
         * pen.dashStyle = PdfDashStyle.DashDot;
         * // get pen style
         * let style : PdfDashStyle = pen.dashStyle;
         * //
         * // draw rectangle
         * page1.graphics.drawRectangle(pen, new RectangleF({x : 0, y : 0}, {width : 100, height : 50}));
         * // save the document.
         * document.save('output.pdf');
         * // destroy the document
         * document.destroy();
         * ```
         */
        get: function () {
            return this.pdfDashStyle;
        },
        set: function (value) {
            if (this.pdfDashStyle !== value) {
                this.pdfDashStyle = value;
                switch (this.pdfDashStyle) {
                    case PdfDashStyle.Custom:
                        break;
                    case PdfDashStyle.Dash:
                        this.penDashPattern = [3, 1];
                        break;
                    case PdfDashStyle.Dot:
                        this.penDashPattern = [1, 1];
                        break;
                    case PdfDashStyle.DashDot:
                        this.penDashPattern = [3, 1, 1, 1];
                        break;
                    case PdfDashStyle.DashDotDot:
                        this.penDashPattern = [3, 1, 1, 1, 1, 1];
                        break;
                    case PdfDashStyle.Solid:
                        break;
                    default:
                        this.pdfDashStyle = PdfDashStyle.Solid;
                        this.penDashPattern = [0];
                        break;
                }
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PdfPen.prototype, "lineCap", {
        /**
         * Gets or sets the `line cap of the pen`.
         * @private
         */
        get: function () {
            return this.pdfLineCap;
        },
        set: function (value) {
            this.pdfLineCap = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PdfPen.prototype, "lineJoin", {
        /**
         * Gets or sets the `line join style of the pen`.
         * @private
         */
        get: function () {
            return this.pdfLineJoin;
        },
        set: function (value) {
            this.pdfLineJoin = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PdfPen.prototype, "miterLimit", {
        /**
         * Gets or sets the `miter limit`.
         * @private
         */
        get: function () {
            return this.internalMiterLimit;
        },
        set: function (value) {
            this.internalMiterLimit = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PdfPen.prototype, "width", {
        /**
         * Gets or sets the `width of the pen`.
         * ```typescript
         * // create a new PDF document
         * let document : PdfDocument = new PdfDocument();
         * // create a new page
         * let page1 : PdfPage = document.pages.add();
         * // set pen
         * let pen : PdfPen = new PdfPen(new PdfColor(0, 0, 0));
         * //
         * // set pen width
         * pen.width = 2;
         * //
         * // draw rectangle
         * page1.graphics.drawRectangle(pen, new RectangleF({x : 0, y : 0}, {width : 100, height : 50}));
         * // save the document.
         * document.save('output.pdf');
         * // destroy the document
         * document.destroy();
         * ```
         */
        get: function () {
            return this.penWidth;
        },
        set: function (value) {
            this.penWidth = value;
        },
        enumerable: true,
        configurable: true
    });
    //Helper
    /**
     * `Clones` this instance of PdfPen class.
     * @private
     */
    PdfPen.prototype.clone = function () {
        var pen = this;
        return pen;
    };
    /**
     * `Sets the brush`.
     * @private
     */
    PdfPen.prototype.setBrush = function (brush) {
        var sBrush = brush;
        if ((sBrush != null && sBrush instanceof PdfSolidBrush)) {
            this.color = sBrush.color;
            this.pdfBrush = sBrush;
        }
        this.color = sBrush.color;
        this.pdfBrush = sBrush;
    };
    /**
     * `Monitors the changes`.
     * @private
     */
    PdfPen.prototype.monitorChanges = function (currentPen, streamWriter, getResources, saveState, currentColorSpace, matrix) {
        var diff = false;
        saveState = true;
        if (currentPen == null) {
            diff = true;
        }
        diff = this.dashControl(currentPen, saveState, streamWriter);
        streamWriter.setLineWidth(this.width);
        streamWriter.setLineJoin(this.lineJoin);
        streamWriter.setLineCap(this.lineCap);
        var miterLimit = this.miterLimit;
        if (miterLimit > 0) {
            streamWriter.setMiterLimit(miterLimit);
            diff = true;
        }
        var brush = this.pdfBrush;
        streamWriter.setColorAndSpace(this.color, currentColorSpace, true);
        diff = true;
        return diff;
    };
    /**
     * `Controls the dash style` and behaviour of each line.
     * @private
     */
    PdfPen.prototype.dashControl = function (pen, saveState, streamWriter) {
        saveState = true;
        var lineWidth = this.width;
        var pattern = this.getPattern();
        streamWriter.setLineDashPattern(pattern, this.dashOffset * lineWidth);
        return saveState;
    };
    /**
     * `Gets the pattern` of PdfPen.
     * @private
     */
    PdfPen.prototype.getPattern = function () {
        var pattern = this.dashPattern;
        for (var i = 0; i < pattern.length; ++i) {
            pattern[i] *= this.width;
        }
        return pattern;
    };
    return PdfPen;
}());
export { PdfPen };
