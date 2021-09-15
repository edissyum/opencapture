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
 * PdfPageCountField.ts class for EJ2-PDF
 */
import { PdfSingleValueField } from './single-value-field';
import { PdfNumberStyle } from './../../pages/enum';
import { PdfBrush } from './../../graphics/brushes/pdf-brush';
import { PdfNumbersConvertor } from './pdf-numbers-convertor';
/**
 * Represents total PDF document page count automatic field.
 */
var PdfPageCountField = /** @class */ (function (_super) {
    __extends(PdfPageCountField, _super);
    function PdfPageCountField(font, arg2) {
        var _this = _super.call(this) || this;
        // Fields
        /**
         * Stores the number style of the field.
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
    Object.defineProperty(PdfPageCountField.prototype, "numberStyle", {
        // Properties
        /**
         * Gets and sets the number style of the field.
         * @public
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
    // Implementation
    /**
     * Return the actual value of the content to drawn.
     * @public
     */
    PdfPageCountField.prototype.getValue = function (graphics) {
        var result = null;
        var page = this.getPageFromGraphics(graphics);
        var document = page.section.parent.document;
        var count = document.pages.count;
        result = PdfNumbersConvertor.convert(count, this.numberStyle);
        return result;
    };
    return PdfPageCountField;
}(PdfSingleValueField));
export { PdfPageCountField };
