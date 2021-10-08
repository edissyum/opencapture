/**
 * TtfGlyphInfo.ts class for EJ2-PDF
 */
var TtfGlyphInfo = /** @class */ (function () {
    function TtfGlyphInfo() {
    }
    Object.defineProperty(TtfGlyphInfo.prototype, "empty", {
        //Properties
        /**
         * Gets a value indicating whether this TtfGlyphInfo is empty.
         */
        get: function () {
            var empty = (this.index === this.width && this.width === this.charCode && this.charCode === 0);
            return empty;
        },
        enumerable: true,
        configurable: true
    });
    //IComparable implementation
    /**
     * Compares two WidthDescriptor objects.
     */
    TtfGlyphInfo.prototype.compareTo = function (obj) {
        var glyph = obj;
        return this.index - glyph.index;
    };
    return TtfGlyphInfo;
}());
export { TtfGlyphInfo };
