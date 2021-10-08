/**
 * PdfBorders.ts class for EJ2-PDF
 */
import { PdfPen, PdfDashStyle, PdfColor } from '@syncfusion/ej2-pdf-export';
/**
 * `PdfBorders` class used represents the cell border of the PDF grid.
 */
var PdfBorders = /** @class */ (function () {
    // Constructor
    /**
     * Create a new instance for `PdfBorders` class.
     *
     * @private
     */
    function PdfBorders() {
        var defaultBorderPenLeft = new PdfPen(new PdfColor(0, 0, 0));
        defaultBorderPenLeft.dashStyle = PdfDashStyle.Solid;
        var defaultBorderPenRight = new PdfPen(new PdfColor(0, 0, 0));
        defaultBorderPenRight.dashStyle = PdfDashStyle.Solid;
        var defaultBorderPenTop = new PdfPen(new PdfColor(0, 0, 0));
        defaultBorderPenTop.dashStyle = PdfDashStyle.Solid;
        var defaultBorderPenBottom = new PdfPen(new PdfColor(0, 0, 0));
        defaultBorderPenBottom.dashStyle = PdfDashStyle.Solid;
        this.leftPen = defaultBorderPenLeft;
        this.rightPen = defaultBorderPenRight;
        this.topPen = defaultBorderPenTop;
        this.bottomPen = defaultBorderPenBottom;
    }
    Object.defineProperty(PdfBorders.prototype, "left", {
        // Properties
        /**
         * Gets or sets the `Left`.
         *
         * @returns {PdfPen} .
         * @private
         */
        get: function () {
            return this.leftPen;
        },
        set: function (value) {
            this.leftPen = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PdfBorders.prototype, "right", {
        /**
         * Gets or sets the `Right`.
         *
         * @returns {PdfPen} .
         * @private
         */
        get: function () {
            return this.rightPen;
        },
        set: function (value) {
            this.rightPen = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PdfBorders.prototype, "top", {
        /**
         * Gets or sets the `Top`.
         *
         * @returns {PdfPen} .
         * @private
         */
        get: function () {
            return this.topPen;
        },
        set: function (value) {
            this.topPen = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PdfBorders.prototype, "bottom", {
        /**
         * Gets or sets the `Bottom`.
         *
         * @returns {PdfPen} .
         * @private
         */
        get: function () {
            return this.bottomPen;
        },
        set: function (value) {
            this.bottomPen = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PdfBorders.prototype, "all", {
        /**
         * sets the `All`.
         *
         * @param {PdfPen} value .
         * @private
         */
        set: function (value) {
            this.leftPen = this.rightPen = this.topPen = this.bottomPen = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PdfBorders.prototype, "isAll", {
        /**
         * Gets a value indicating whether this instance `is all`.
         *
         * @returns {boolean} .
         * @private
         */
        get: function () {
            return ((this.leftPen === this.rightPen) && (this.leftPen === this.topPen) && (this.leftPen === this.bottomPen));
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PdfBorders, "default", {
        /**
         * Gets the `default`.
         *
         * @returns {PdfBorders} .
         * @private
         */
        get: function () {
            return new PdfBorders();
        },
        enumerable: true,
        configurable: true
    });
    return PdfBorders;
}());
export { PdfBorders };
var PdfPaddings = /** @class */ (function () {
    function PdfPaddings(left, right, top, bottom) {
        /**
         * The 'left' border padding set.
         *
         * @private
         */
        this.hasLeftPad = false;
        /**
         * The 'right' border padding set.
         *
         * @private
         */
        this.hasRightPad = false;
        /**
         * The 'top' border padding set.
         *
         * @private
         */
        this.hasTopPad = false;
        /**
         * The 'bottom' border padding set.
         *
         * @private
         */
        this.hasBottomPad = false;
        if (typeof left === 'undefined') {
            //5.76 and 0 are taken from ms-word default table margins.
            this.leftPad = this.rightPad = 5.76;
            //0.5 is set for top and bottom by default.
            this.bottomPad = this.topPad = 0.5;
        }
        else {
            this.leftPad = left;
            this.rightPad = right;
            this.topPad = top;
            this.bottomPad = bottom;
            this.hasLeftPad = true;
            this.hasRightPad = true;
            this.hasTopPad = true;
            this.hasBottomPad = true;
        }
    }
    Object.defineProperty(PdfPaddings.prototype, "left", {
        // Properties
        /**
         * Gets or sets the `left` value of the edge
         *
         * @returns {number} .
         * @private
         */
        get: function () {
            return this.leftPad;
        },
        set: function (value) {
            this.leftPad = value;
            this.hasLeftPad = true;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PdfPaddings.prototype, "right", {
        /**
         * Gets or sets the `right` value of the edge.
         *
         * @returns {number} .
         * @private
         */
        get: function () {
            return this.rightPad;
        },
        set: function (value) {
            this.rightPad = value;
            this.hasRightPad = true;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PdfPaddings.prototype, "top", {
        /**
         * Gets or sets the `top` value of the edge
         *
         * @returns {number} .
         * @private
         */
        get: function () {
            return this.topPad;
        },
        set: function (value) {
            this.topPad = value;
            this.hasTopPad = true;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PdfPaddings.prototype, "bottom", {
        /**
         * Gets or sets the `bottom` value of the edge.
         *
         * @returns {number} .
         * @private
         */
        get: function () {
            return this.bottomPad;
        },
        set: function (value) {
            this.bottomPad = value;
            this.hasBottomPad = true;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PdfPaddings.prototype, "all", {
        /**
         * Sets value to all sides `left,right,top and bottom`.s
         *
         * @param {number} value .
         * @private
         */
        set: function (value) {
            this.leftPad = this.rightPad = this.topPad = this.bottomPad = value;
            this.hasLeftPad = true;
            this.hasRightPad = true;
            this.hasTopPad = true;
            this.hasBottomPad = true;
        },
        enumerable: true,
        configurable: true
    });
    return PdfPaddings;
}());
export { PdfPaddings };
