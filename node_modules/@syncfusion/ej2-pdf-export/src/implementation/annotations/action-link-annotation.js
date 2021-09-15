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
import { PdfLinkAnnotation } from './link-annotation';
/**
 * Represents base class for `link annotations` with associated action.
 * @private
 */
var PdfActionLinkAnnotation = /** @class */ (function (_super) {
    __extends(PdfActionLinkAnnotation, _super);
    // Constructors
    /**
     * Specifies the constructor for `ActionLinkAnnotation`.
     * @private
     */
    function PdfActionLinkAnnotation(rectangle) {
        var _this = _super.call(this, rectangle) || this;
        // Fields
        /**
         * Internal variable to store annotation's `action`.
         * @default null
         * @private
         */
        _this.pdfAction = null;
        return _this;
    }
    //Public method
    /**
     * get and set the `action`.
     * @hidden
     */
    PdfActionLinkAnnotation.prototype.getSetAction = function (value) {
        if (typeof value === 'undefined') {
            return this.pdfAction;
        }
        else {
            this.pdfAction = value;
        }
    };
    return PdfActionLinkAnnotation;
}(PdfLinkAnnotation));
export { PdfActionLinkAnnotation };
