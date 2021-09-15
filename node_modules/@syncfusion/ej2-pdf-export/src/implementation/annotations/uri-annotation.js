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
import { PdfActionLinkAnnotation } from './action-link-annotation';
import { PdfName } from './../primitives/pdf-name';
import { PdfUriAction } from './../actions/uri-action';
/**
 * `PdfUriAnnotation` class represents the Uri annotation.
 * @private
 */
var PdfUriAnnotation = /** @class */ (function (_super) {
    __extends(PdfUriAnnotation, _super);
    function PdfUriAnnotation(rectangle, uri) {
        var _this = _super.call(this, rectangle) || this;
        if (typeof uri !== 'undefined') {
            _this.uri = uri;
        }
        return _this;
    }
    Object.defineProperty(PdfUriAnnotation.prototype, "uriAction", {
        /**
         * Get `action` of the annotation.
         * @private
         */
        get: function () {
            if (typeof this.pdfUriAction === 'undefined') {
                this.pdfUriAction = new PdfUriAction();
            }
            return this.pdfUriAction;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PdfUriAnnotation.prototype, "uri", {
        // Properties
        /**
         * Gets or sets the `Uri` address.
         * @private
         */
        get: function () {
            return this.uriAction.uri;
        },
        set: function (value) {
            if (this.uriAction.uri !== value) {
                this.uriAction.uri = value;
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PdfUriAnnotation.prototype, "action", {
        /**
         * Gets or sets the `action`.
         * @private
         */
        get: function () {
            return this.getSetAction();
        },
        set: function (value) {
            this.getSetAction(value);
            this.uriAction.next = value;
        },
        enumerable: true,
        configurable: true
    });
    // Implementation
    /**
     * `Initializes` annotation object.
     * @private
     */
    PdfUriAnnotation.prototype.initialize = function () {
        _super.prototype.initialize.call(this);
        this.dictionary.items.setValue(this.dictionaryProperties.subtype, new PdfName(this.dictionaryProperties.link));
        var tempPrimitive = this.uriAction.element;
        this.dictionary.items.setValue(this.dictionaryProperties.a, this.uriAction.element);
    };
    return PdfUriAnnotation;
}(PdfActionLinkAnnotation));
export { PdfUriAnnotation };
