/**
 * PdfPageSettings.ts class for EJ2-PDF
 */
import { SizeF, PointF } from './../drawing/pdf-drawing';
import { PdfPageSize } from './pdf-page-size';
import { PdfPageRotateAngle, PdfPageOrientation } from './enum';
import { PdfMargins } from './../graphics/pdf-margins';
/**
 * The class provides various `setting` related with PDF pages.
 */
var PdfPageSettings = /** @class */ (function () {
    function PdfPageSettings(margins) {
        //Fields
        /**
         * The page `margins`.
         * @private
         */
        this.pageMargins = new PdfMargins();
        /**
         * The page `size`.
         * @default a4
         * @private
         */
        this.pageSize = PdfPageSize.a4;
        /**
         * The page `rotation angle`.
         * @default PdfPageRotateAngle.RotateAngle0
         * @private
         */
        this.rotateAngle = PdfPageRotateAngle.RotateAngle0;
        /**
         * The page `orientation`.
         * @default PdfPageOrientation.Portrait
         * @private
         */
        this.pageOrientation = PdfPageOrientation.Portrait;
        /**
         * The page `origin`.
         * @default 0,0
         * @private
         */
        this.pageOrigin = new PointF(0, 0);
        /**
         * Checks the Whether the `rotation` is applied or not.
         * @default false
         * @private
         */
        this.isRotation = false;
        if (typeof margins === 'number') {
            this.pageMargins.setMargins(margins);
        }
    }
    Object.defineProperty(PdfPageSettings.prototype, "size", {
        //Properties
        /**
         * Gets or sets the `size` of the page.
         * @private
         */
        get: function () {
            return this.pageSize;
        },
        set: function (value) {
            this.setSize(value);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PdfPageSettings.prototype, "orientation", {
        /**
         * Gets or sets the page `orientation`.
         * @private
         */
        get: function () {
            return this.pageOrientation;
        },
        set: function (orientation) {
            if (this.pageOrientation !== orientation) {
                this.pageOrientation = orientation;
                this.updateSize(orientation);
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PdfPageSettings.prototype, "margins", {
        /**
         * Gets or sets the `margins` of the page.
         * @private
         */
        get: function () {
            return this.pageMargins;
        },
        set: function (value) {
            this.pageMargins = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PdfPageSettings.prototype, "width", {
        /**
         * Gets or sets the `width` of the page.
         * @private
         */
        get: function () {
            return this.pageSize.width;
        },
        set: function (value) {
            this.pageSize.width = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PdfPageSettings.prototype, "height", {
        /**
         * Gets or sets the `height` of the page.
         * @private
         */
        get: function () {
            return this.pageSize.height;
        },
        set: function (value) {
            this.pageSize.height = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PdfPageSettings.prototype, "origin", {
        /**
         * Gets or sets the `origin` of the page.
         * @private
         */
        get: function () {
            return this.pageOrigin;
        },
        set: function (value) {
            this.pageOrigin = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PdfPageSettings.prototype, "rotate", {
        /**
         * Gets or sets the number of degrees by which the page should be `rotated` clockwise when displayed or printed.
         * @private
         */
        get: function () {
            return this.rotateAngle;
        },
        set: function (value) {
            this.rotateAngle = value;
            this.isRotation = true;
        },
        enumerable: true,
        configurable: true
    });
    //Methods
    /**
     * `Update page size` depending on orientation.
     * @private
     */
    PdfPageSettings.prototype.updateSize = function (orientation) {
        var min = Math.min(this.pageSize.width, this.pageSize.height);
        var max = Math.max(this.pageSize.width, this.pageSize.height);
        switch (orientation) {
            case PdfPageOrientation.Portrait:
                this.pageSize = new SizeF(min, max);
                break;
            case PdfPageOrientation.Landscape:
                this.pageSize = new SizeF(max, min);
                break;
        }
    };
    /**
     * Creates a `clone` of the object.
     * @private
     */
    PdfPageSettings.prototype.clone = function () {
        var settings = this;
        settings.pageMargins = this.pageMargins.clone();
        // if (GetTransition() != null)
        // {
        //     settings.Transition = (PdfPageTransition)Transition.clone();
        // }
        return settings;
    };
    /**
     * Returns `size`, shrinked by the margins.
     * @private
     */
    PdfPageSettings.prototype.getActualSize = function () {
        var width = this.width - (this.margins.left + this.margins.right);
        var height = this.height - (this.margins.top + this.margins.bottom);
        var size = new SizeF(width, height);
        return size;
    };
    /**
     * Sets `size` to the page aaccording to the orientation.
     * @private
     */
    PdfPageSettings.prototype.setSize = function (size) {
        var min = Math.min(size.width, size.height);
        var max = Math.max(size.width, size.height);
        if (this.orientation === PdfPageOrientation.Portrait) {
            this.pageSize = new SizeF(min, max);
        }
        else {
            this.pageSize = new SizeF(max, min);
        }
    };
    return PdfPageSettings;
}());
export { PdfPageSettings };
