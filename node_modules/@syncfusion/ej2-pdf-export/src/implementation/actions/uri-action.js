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
import { PdfAction } from './action';
import { PdfString } from './../primitives/pdf-string';
import { PdfName } from './../primitives/pdf-name';
/**
 * `PdfUriAction` class for initialize the uri related internals.
 * @private
 */
var PdfUriAction = /** @class */ (function (_super) {
    __extends(PdfUriAction, _super);
    function PdfUriAction(uri) {
        var _this = _super.call(this) || this;
        // Fields
        /**
         * Specifies the `uri` string.
         * @default ''.
         * @private
         */
        _this.uniformResourceIdentifier = '';
        return _this;
    }
    Object.defineProperty(PdfUriAction.prototype, "uri", {
        // Properties
        /**
         * Gets and Sets the value of `Uri`.
         * @private
         */
        get: function () {
            return this.uniformResourceIdentifier;
        },
        set: function (value) {
            this.uniformResourceIdentifier = value;
            this.dictionary.items.setValue(this.dictionaryProperties.uri, new PdfString(this.uniformResourceIdentifier));
        },
        enumerable: true,
        configurable: true
    });
    // Implementation
    /**
     * `Initialize` the internals.
     * @private
     */
    PdfUriAction.prototype.initialize = function () {
        _super.prototype.initialize.call(this);
        this.dictionary.items.setValue(this.dictionaryProperties.s, new PdfName(this.dictionaryProperties.uri));
    };
    return PdfUriAction;
}(PdfAction));
export { PdfUriAction };
