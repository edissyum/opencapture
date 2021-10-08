/**
 * PdfMargins.ts class for EJ2-PDF
 * A class representing PDF page margins.
 */
var PdfMargins = /** @class */ (function () {
    /**
     * Initializes a new instance of the `PdfMargins` class.
     * @private
     */
    function PdfMargins() {
        /**
         * Represents the `Default Page Margin` value.
         * @default 0.0
         * @private
         */
        this.pdfMargin = 40.0;
        this.setMargins(this.pdfMargin);
    }
    Object.defineProperty(PdfMargins.prototype, "left", {
        //Properties
        /**
         * Gets or sets the `left margin` size.
         * @private
         */
        get: function () {
            return this.leftMargin;
        },
        set: function (value) {
            this.leftMargin = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PdfMargins.prototype, "top", {
        /**
         * Gets or sets the `top margin` size.
         * @private
         */
        get: function () {
            return this.topMargin;
        },
        set: function (value) {
            this.topMargin = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PdfMargins.prototype, "right", {
        /**
         * Gets or sets the `right margin` size.
         * @private
         */
        get: function () {
            return this.rightMargin;
        },
        set: function (value) {
            this.rightMargin = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PdfMargins.prototype, "bottom", {
        /**
         * Gets or sets the `bottom margin` size.
         * @private
         */
        get: function () {
            return this.bottomMargin;
        },
        set: function (value) {
            this.bottomMargin = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PdfMargins.prototype, "all", {
        /**
         * Sets the `margins`.
         * @private
         */
        set: function (value) {
            this.setMargins(value);
        },
        enumerable: true,
        configurable: true
    });
    PdfMargins.prototype.setMargins = function (margin1, margin2, margin3, margin4) {
        if (typeof margin2 === 'undefined') {
            this.leftMargin = this.topMargin = this.rightMargin = this.bottomMargin = margin1;
        }
        else {
            if (typeof margin3 === 'undefined') {
                this.leftMargin = this.rightMargin = margin1;
                this.bottomMargin = this.topMargin = margin2;
            }
            else {
                this.leftMargin = margin1;
                this.topMargin = margin2;
                this.rightMargin = margin3;
                this.bottomMargin = margin4;
            }
        }
    };
    /**
     * `Clones` the object.
     * @private
     */
    PdfMargins.prototype.clone = function () {
        return this;
    };
    return PdfMargins;
}());
export { PdfMargins };
