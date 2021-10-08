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
 * PdfFillElement.ts class for EJ2-PDF
 */
import { PdfDrawElement } from './draw-element';
import { PdfPen } from './../../pdf-pen';
import { PdfColor } from './../../pdf-color';
/**
 * Represents a base class for all page graphics elements.
 */
var PdfFillElement = /** @class */ (function (_super) {
    __extends(PdfFillElement, _super);
    /**
     * Initializes a new instance of the `PdfFillElement` class.
     * @protected
     */
    function PdfFillElement(arg1, arg2) {
        var _this = _super.call(this) || this;
        // Fields
        /**
         * Internal variable to store pen.
         * @private
         */
        _this.mbrush = null;
        if (typeof arg1 === 'undefined') {
            //
        }
        else if (arg1 instanceof PdfPen) {
            _this = _super.call(this, arg1) || this;
        }
        else {
            _this.mbrush = arg2;
        }
        return _this;
    }
    Object.defineProperty(PdfFillElement.prototype, "brush", {
        // Properties
        /**
         * Gets or sets a brush of the element.
         * @public
         */
        get: function () {
            return this.mbrush;
        },
        set: function (value) {
            this.mbrush = value;
        },
        enumerable: true,
        configurable: true
    });
    // Implementation
    /**
     * Gets the pen. If both pen and brush are not explicitly defined, default pen will be used.
     * @protected
     */
    PdfFillElement.prototype.obtainPen = function () {
        return ((this.mbrush == null) && (this.pen == null)) ? new PdfPen(new PdfColor(0, 0, 0)) : this.pen;
    };
    return PdfFillElement;
}(PdfDrawElement));
export { PdfFillElement };
