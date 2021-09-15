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
import { PdfBrush } from './../../graphics/brushes/pdf-brush';
import { PdfNumberStyle } from './../../pages/enum';
import { PdfNumbersConvertor } from './pdf-numbers-convertor';
import { PdfMultipleValueField } from './multiple-value-field';
/**
 * Represents PDF document `page number field`.
 * @public
 */
var PdfPageNumberField = /** @class */ (function (_super) {
    __extends(PdfPageNumberField, _super);
    function PdfPageNumberField(font, arg2) {
        var _this = _super.call(this) || this;
        // Fields
        /**
         * Stores the number style of the page number field.
         * @private
         */
        _this.internalNumberStyle = PdfNumberStyle.Numeric;
        if (typeof arg2 === 'undefined') {
            _this.font = font;
        }
        else if (arg2 instanceof PdfBrush) {
            _this.font = font;
            _this.brush = arg2;
        }
        else {
            _this.font = font;
            _this.bounds = arg2;
        }
        return _this;
    }
    Object.defineProperty(PdfPageNumberField.prototype, "numberStyle", {
        // Properties
        /**
         * Gets and sets the number style of the page number field.
         * @private
         */
        get: function () {
            return this.internalNumberStyle;
        },
        set: function (value) {
            this.internalNumberStyle = value;
        },
        enumerable: true,
        configurable: true
    });
    /**
     * Return the `string` value of page number field.
     * @public
     */
    PdfPageNumberField.prototype.getValue = function (graphics) {
        var result = null;
        var page = this.getPageFromGraphics(graphics);
        result = this.internalGetValue(page);
        return result;
    };
    /**
     * Internal method to `get actual value of page number`.
     * @private
     */
    PdfPageNumberField.prototype.internalGetValue = function (page) {
        var document = page.document;
        var pageIndex = document.pages.indexOf(page) + 1;
        return PdfNumbersConvertor.convert(pageIndex, this.numberStyle);
    };
    return PdfPageNumberField;
}(PdfMultipleValueField));
export { PdfPageNumberField };
