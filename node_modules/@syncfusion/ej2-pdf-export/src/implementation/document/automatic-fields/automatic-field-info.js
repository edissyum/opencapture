/**
 * PdfAutomaticFieldInfo.ts class for EJ2-PDF
 * @private
 */
import { PointF } from './../../drawing/pdf-drawing';
import { PdfAutomaticField } from './automatic-field';
/**
 * Represents information about the automatic field.
 * @private
 */
var PdfAutomaticFieldInfo = /** @class */ (function () {
    function PdfAutomaticFieldInfo(field, location, scaleX, scaleY) {
        // Fields
        /**
         * Internal variable to store location of the field.
         * @private
         */
        this.pageNumberFieldLocation = new PointF();
        /**
         * Internal variable to store field.
         * @private
         */
        this.pageNumberField = null;
        /**
         * Internal variable to store x scaling factor.
         * @private
         */
        this.scaleX = 1;
        /**
         * Internal variable to store y scaling factor.
         * @private
         */
        this.scaleY = 1;
        if (typeof location === 'undefined' && field instanceof PdfAutomaticFieldInfo) {
            this.pageNumberField = field.field;
            this.pageNumberFieldLocation = field.location;
            this.scaleX = field.scalingX;
            this.scaleY = field.scalingY;
        }
        else if (typeof scaleX === 'undefined' && location instanceof PointF && field instanceof PdfAutomaticField) {
            this.pageNumberField = field;
            this.pageNumberFieldLocation = location;
        }
        else {
            this.pageNumberField = field;
            this.pageNumberFieldLocation = location;
            this.scaleX = scaleX;
            this.scaleY = scaleY;
        }
    }
    Object.defineProperty(PdfAutomaticFieldInfo.prototype, "location", {
        /* tslint:enable */
        // Properties
        /**
         * Gets or sets the location.
         * @private
         */
        get: function () {
            return this.pageNumberFieldLocation;
        },
        set: function (value) {
            this.pageNumberFieldLocation = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PdfAutomaticFieldInfo.prototype, "field", {
        /**
         * Gets or sets the field.
         * @private
         */
        get: function () {
            return this.pageNumberField;
        },
        set: function (value) {
            this.pageNumberField = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PdfAutomaticFieldInfo.prototype, "scalingX", {
        /**
         * Gets or sets the scaling X factor.
         * @private
         */
        get: function () {
            return this.scaleX;
        },
        set: function (value) {
            this.scaleX = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PdfAutomaticFieldInfo.prototype, "scalingY", {
        /**
         * Gets or sets the scaling Y factor.
         * @private
         */
        get: function () {
            return this.scaleY;
        },
        set: function (value) {
            this.scaleY = value;
        },
        enumerable: true,
        configurable: true
    });
    return PdfAutomaticFieldInfo;
}());
export { PdfAutomaticFieldInfo };
