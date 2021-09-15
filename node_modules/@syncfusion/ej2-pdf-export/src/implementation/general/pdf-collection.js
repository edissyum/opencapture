/**
 * PdfCollection.ts class for EJ2-PDF
 * The class used to handle the collection of PdF objects.
 */
var PdfCollection = /** @class */ (function () {
    // Constructors
    /**
     * Initializes a new instance of the `Collection` class.
     * @private
     */
    function PdfCollection() {
        //
    }
    Object.defineProperty(PdfCollection.prototype, "count", {
        // Properties
        /**
         * Gets the `Count` of stored objects.
         * @private
         */
        get: function () {
            if (typeof this.collection === 'undefined') {
                this.collection = [];
            }
            return this.collection.length;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PdfCollection.prototype, "list", {
        /**
         * Gets the `list` of stored objects.
         * @private
         */
        get: function () {
            if (typeof this.collection === 'undefined') {
                this.collection = [];
            }
            return this.collection;
        },
        enumerable: true,
        configurable: true
    });
    return PdfCollection;
}());
export { PdfCollection };
