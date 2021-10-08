/**
 * Used to perform `convertion between pixels and points`.
 * @private
 */
var PdfUnitConverter = /** @class */ (function () {
    //constructors
    /**
     * Initializes a new instance of the `UnitConvertor` class with DPI value.
     * @private
     */
    function PdfUnitConverter(dpi) {
        this.updateProportionsHelper(dpi);
    }
    /**
     * `Converts` the value, from one graphics unit to another graphics unit.
     * @private
     */
    PdfUnitConverter.prototype.convertUnits = function (value, from, to) {
        return this.convertFromPixels(this.convertToPixels(value, from), to);
    };
    /**
     * Converts the value `to pixel` from specified graphics unit.
     * @private
     */
    PdfUnitConverter.prototype.convertToPixels = function (value, from) {
        var index = from;
        var result = (value * this.proportions[index]);
        return result;
    };
    /**
     * Converts value, to specified graphics unit `from Pixel`.
     * @private
     */
    PdfUnitConverter.prototype.convertFromPixels = function (value, to) {
        var index = to;
        var result = (value / this.proportions[index]);
        return result;
    };
    /**
     * `Update proportions` matrix according to Graphics settings.
     * @private
     */
    PdfUnitConverter.prototype.updateProportionsHelper = function (pixelPerInch) {
        this.proportions = [
            pixelPerInch / 2.54,
            pixelPerInch / 6.0,
            1,
            pixelPerInch / 72.0,
            pixelPerInch,
            pixelPerInch / 300.0,
            pixelPerInch / 25.4 // Millimeter
        ];
    };
    //Fields
    /**
     * Indicates default `horizontal resolution`.
     * @default 96
     * @private
     */
    PdfUnitConverter.horizontalResolution = 96;
    /**
     * Indicates default `vertical resolution`.
     * @default 96
     * @private
     */
    PdfUnitConverter.verticalResolution = 96;
    return PdfUnitConverter;
}());
export { PdfUnitConverter };
