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
 * PdfCatalog.ts class for EJ2-PDF
 */
import { PdfDictionary } from './../primitives/pdf-dictionary';
import { DictionaryProperties } from './../input-output/pdf-dictionary-properties';
import { PdfName } from './../primitives/pdf-name';
import { PdfReferenceHolder } from './../primitives/pdf-reference';
/**
 * `PdfCatalog` class represents internal catalog of the Pdf document.
 * @private
 */
var PdfCatalog = /** @class */ (function (_super) {
    __extends(PdfCatalog, _super);
    //constructor
    /**
     * Initializes a new instance of the `PdfCatalog` class.
     * @private
     */
    function PdfCatalog() {
        var _this = _super.call(this) || this;
        //fields
        /**
         * Internal variable to store collection of `sections`.
         * @default null
         * @private
         */
        _this.sections = null;
        /**
         * Internal variable for accessing fields from `DictionryProperties` class.
         * @private
         */
        _this.tempDictionaryProperties = new DictionaryProperties();
        _this.items.setValue(new DictionaryProperties().type, new PdfName('Catalog'));
        return _this;
    }
    Object.defineProperty(PdfCatalog.prototype, "pages", {
        //Properties
        /**
         * Gets or sets the sections, which contain `pages`.
         * @private
         */
        get: function () {
            return this.sections;
        },
        set: function (value) {
            var dictionary = value.element;
            // if (this.sections !== value) {
            //     this.sections = value;
            //     this.Items.setValue(this.tempDictionaryProperties.pages, new PdfReferenceHolder(value));
            // }
            this.sections = value;
            this.items.setValue(this.tempDictionaryProperties.pages, new PdfReferenceHolder(value));
        },
        enumerable: true,
        configurable: true
    });
    return PdfCatalog;
}(PdfDictionary));
export { PdfCatalog };
