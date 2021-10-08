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
 * PdfSectionTemplate.ts class for EJ2-PDF
 */
import { PdfDocumentTemplate } from './../document/pdf-document-template';
/**
 * Represents a `page template` for all the pages in the section.
 */
var PdfSectionTemplate = /** @class */ (function (_super) {
    __extends(PdfSectionTemplate, _super);
    // Constructors
    /**
     * `Creates a new object`.
     * @private
     */
    function PdfSectionTemplate() {
        var _this = _super.call(this) || this;
        _this.leftValue = _this.topValue = _this.rightValue = _this.bottomValue = _this.stampValue = true;
        return _this;
    }
    Object.defineProperty(PdfSectionTemplate.prototype, "applyDocumentLeftTemplate", {
        // Properties
        /**
         * Gets or sets value indicating whether parent `Left page template should be used or not`.
         * @private
         */
        get: function () {
            return this.leftValue;
        },
        set: function (value) {
            this.leftValue = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PdfSectionTemplate.prototype, "applyDocumentTopTemplate", {
        /**
         * Gets or sets value indicating whether parent `Top page template should be used or not`.
         * @private
         */
        get: function () {
            return this.topValue;
        },
        set: function (value) {
            this.topValue = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PdfSectionTemplate.prototype, "applyDocumentRightTemplate", {
        /**
         * Gets or sets value indicating whether parent `Right page template should be used or not`.
         * @private
         */
        get: function () {
            return this.rightValue;
        },
        set: function (value) {
            this.rightValue = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PdfSectionTemplate.prototype, "applyDocumentBottomTemplate", {
        /**
         * Gets or sets value indicating whether parent `Bottom page template should be used or not`.
         * @private
         */
        get: function () {
            return this.bottomValue;
        },
        set: function (value) {
            this.bottomValue = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PdfSectionTemplate.prototype, "applyDocumentStamps", {
        /**
         * Gets or sets value indicating whether the `stamp value` is true or not.
         * @private
         */
        get: function () {
            return this.stampValue;
        },
        set: function (value) {
            this.stampValue = value;
        },
        enumerable: true,
        configurable: true
    });
    return PdfSectionTemplate;
}(PdfDocumentTemplate));
export { PdfSectionTemplate };
