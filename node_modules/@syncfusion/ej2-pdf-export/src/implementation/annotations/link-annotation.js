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
import { PdfAnnotation } from './annotation';
import { PdfName } from './../primitives/pdf-name';
/**
 * `PdfLinkAnnotation` class represents the ink annotation class.
 * @private
 */
var PdfLinkAnnotation = /** @class */ (function (_super) {
    __extends(PdfLinkAnnotation, _super);
    function PdfLinkAnnotation(rectangle) {
        return _super.call(this, rectangle) || this;
    }
    // Implementation
    /**
     * `Initializes` annotation object.
     * @private
     */
    PdfLinkAnnotation.prototype.initialize = function () {
        _super.prototype.initialize.call(this);
        this.dictionary.items.setValue(this.dictionaryProperties.subtype, new PdfName(this.dictionaryProperties.link));
    };
    return PdfLinkAnnotation;
}(PdfAnnotation));
export { PdfLinkAnnotation };
