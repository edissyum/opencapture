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
 * PdfSampledFunction.ts class for EJ2-PDF
 * Implements PDF Sampled Function.
 */
import { PdfArray } from './../../primitives/pdf-array';
import { PdfFunction } from './pdf-function';
import { PdfStream } from './../../primitives/pdf-stream';
import { PdfNumber } from './../../primitives/pdf-number';
var PdfSampledFunction = /** @class */ (function (_super) {
    __extends(PdfSampledFunction, _super);
    /**
     * Initializes a new instance of the `PdfSampledFunction` class.
     * @public
     */
    function PdfSampledFunction(domain, range, sizes, samples) {
        var _this = _super.call(this, new PdfStream()) || this;
        if (typeof domain === 'undefined') {
            _this.dictionary.items.setValue(_this.mDictionaryProperties.functionType, new PdfNumber(0));
        }
        else {
            _this.dictionary.items.setValue(_this.mDictionaryProperties.functionType, new PdfNumber(0));
            _this.checkParams(domain, range, sizes, samples);
            _this.setDomainAndRange(domain, range);
            _this.setSizeAndValues(sizes, samples);
        }
        return _this;
    }
    // Helper methods
    /**
     * Checks the input parameters.
     */
    PdfSampledFunction.prototype.checkParams = function (domain, range, sizes, samples) {
        var rLength = range.length;
        var dLength = domain.length;
        var sLength = samples.length;
        var frameLength = (rLength * (dLength / 4));
    };
    /**
     * Sets the domain and range.
     */
    PdfSampledFunction.prototype.setDomainAndRange = function (domain, range) {
        this.domain = new PdfArray(domain);
        this.range = new PdfArray(range);
    };
    /**
     * Sets the size and values.
     */
    PdfSampledFunction.prototype.setSizeAndValues = function (sizes, samples) {
        var s = (this.dictionary);
        this.dictionary.items.setValue(this.mDictionaryProperties.size, new PdfArray(sizes));
        this.dictionary.items.setValue(this.mDictionaryProperties.bitsPerSample, new PdfNumber(8));
        s.writeBytes(samples);
    };
    return PdfSampledFunction;
}(PdfFunction));
export { PdfSampledFunction };
