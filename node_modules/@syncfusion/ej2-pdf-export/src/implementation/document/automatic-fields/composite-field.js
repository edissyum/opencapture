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
 * PdfCompositeField.ts class for EJ2-PDF
 */
import { PdfMultipleValueField } from './multiple-value-field';
/**
 * Represents class which can concatenate multiple automatic fields into single string.
 */
var PdfCompositeField = /** @class */ (function (_super) {
    __extends(PdfCompositeField, _super);
    // Constructor
    /**
     * Initialize a new instance of `PdfCompositeField` class.
     * @param font Font of the field.
     * @param brush Color of the field.
     * @param text Content of the field.
     * @param list List of the automatic fields in specific order based on the text content.
     */
    function PdfCompositeField(font, brush, text) {
        var list = [];
        for (var _i = 3; _i < arguments.length; _i++) {
            list[_i - 3] = arguments[_i];
        }
        var _this = _super.call(this) || this;
        // Fields
        /**
         * Stores the array of automatic fields.
         * @private
         */
        _this.internalAutomaticFields = null;
        /**
         * Stores the text value of the field.
         * @private
         */
        _this.internalText = '';
        _this.font = font;
        _this.brush = brush;
        _this.text = text;
        _this.automaticFields = list;
        return _this;
    }
    Object.defineProperty(PdfCompositeField.prototype, "text", {
        // Properties
        /**
         * Gets and sets the content of the field.
         * @public
         */
        get: function () {
            return this.internalText;
        },
        set: function (value) {
            this.internalText = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PdfCompositeField.prototype, "automaticFields", {
        /**
         * Gets and sets the list of the field to drawn.
         * @public
         */
        get: function () {
            return this.internalAutomaticFields;
        },
        set: function (value) {
            this.internalAutomaticFields = value;
        },
        enumerable: true,
        configurable: true
    });
    // Implementation
    /**
     * Return the actual value generated from the list of automatic fields.
     * @public
     */
    PdfCompositeField.prototype.getValue = function (graphics) {
        var values = [];
        var text = this.text.toString();
        if (typeof this.automaticFields !== 'undefined' && this.automaticFields != null && this.automaticFields.length > 0) {
            for (var i = 0; i < this.automaticFields.length; i++) {
                var automaticField = this.automaticFields[i];
                text = text.replace('{' + i + '}', automaticField.getValue(graphics));
            }
        }
        return text;
    };
    return PdfCompositeField;
}(PdfMultipleValueField));
export { PdfCompositeField };
