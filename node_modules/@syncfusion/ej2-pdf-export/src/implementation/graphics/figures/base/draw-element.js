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
 * PdfDrawElement.ts class for EJ2-PDF
 */
import { PdfShapeElement } from './pdf-shape-element';
/**
 * Represents a base class for all page graphics elements.
 */
var PdfDrawElement = /** @class */ (function (_super) {
    __extends(PdfDrawElement, _super);
    /**
     * Initializes a new instance of the `PdfDrawElement` class.
     * @protected
     */
    function PdfDrawElement(pen) {
        var _this = _super.call(this) || this;
        if (typeof pen !== 'undefined') {
            _this.mpen = pen;
        }
        return _this;
    }
    Object.defineProperty(PdfDrawElement.prototype, "pen", {
        // Properties
        /**
         * Gets or sets a pen that will be used to draw the element.
         * @public
         */
        get: function () {
            return this.mpen;
        },
        set: function (value) {
            this.mpen = value;
        },
        enumerable: true,
        configurable: true
    });
    return PdfDrawElement;
}(PdfShapeElement));
export { PdfDrawElement };
