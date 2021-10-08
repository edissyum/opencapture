var TtfMetrics = /** @class */ (function () {
    function TtfMetrics() {
    }
    Object.defineProperty(TtfMetrics.prototype, "isItalic", {
        //Properties
        /**
         * Gets a value indicating whether this instance is italic.
         */
        get: function () {
            return ((this.macStyle & 2) !== 0);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(TtfMetrics.prototype, "isBold", {
        /**
         * Gets a value indicating whether this instance is bold.
         */
        get: function () {
            return ((this.macStyle & 1) !== 0);
        },
        enumerable: true,
        configurable: true
    });
    return TtfMetrics;
}());
export { TtfMetrics };
