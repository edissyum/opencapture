/**
 * TtfTableInfo.ts class for EJ2-PDF
 */
var TtfTableInfo = /** @class */ (function () {
    function TtfTableInfo() {
    }
    Object.defineProperty(TtfTableInfo.prototype, "empty", {
        //Properties
        /**
         * Gets a value indicating whether this table is empty.
         * @private
         */
        get: function () {
            var empty = (this.offset === this.length && this.length === this.checksum && this.checksum === 0);
            return empty;
        },
        enumerable: true,
        configurable: true
    });
    return TtfTableInfo;
}());
export { TtfTableInfo };
