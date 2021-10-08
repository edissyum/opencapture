/**
 * Used to `write a string` into output file.
 * @private
 */
var PdfWriter = /** @class */ (function () {
    /**
     * Initialize an instance of `PdfWriter` class.
     * @private
     */
    function PdfWriter(stream) {
        this.streamWriter = stream;
    }
    Object.defineProperty(PdfWriter.prototype, "document", {
        //properties
        /**
         * Gets and Sets the `document`.
         * @private
         */
        get: function () {
            return this.pdfDocument;
        },
        set: function (value) {
            this.pdfDocument = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PdfWriter.prototype, "position", {
        /**
         * Gets the `position`.
         * @private
         */
        get: function () {
            return this.streamWriter.buffer.size;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PdfWriter.prototype, "length", {
        /**
         * Gets  the `length` of the stream'.
         * @private
         */
        get: function () {
            return this.streamWriter.buffer.size;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PdfWriter.prototype, "stream", {
        /**
         * Gets the `stream`.
         * @private
         */
        get: function () {
            var result = this.streamWriter;
            return result;
        },
        enumerable: true,
        configurable: true
    });
    //public Methods
    /**
     * `Writes the specified data`.
     * @private
     */
    PdfWriter.prototype.write = function (overload) {
        var data = [];
        var tempOverload = overload;
        this.streamWriter.write(tempOverload);
    };
    return PdfWriter;
}());
export { PdfWriter };
