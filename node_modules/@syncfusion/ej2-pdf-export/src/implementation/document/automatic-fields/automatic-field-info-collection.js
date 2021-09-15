/**
 * Represent a `collection of automatic fields information`.
 * @private
 */
var PdfAutomaticFieldInfoCollection = /** @class */ (function () {
    /**
     * Initializes a new instance of the 'PdfPageNumberFieldInfoCollection' class.
     * @private
     */
    function PdfAutomaticFieldInfoCollection() {
        /**
         * Internal variable to store instance of `pageNumberFields` class.
         * @private
         */
        this.automaticFieldsInformation = [];
        //
    }
    Object.defineProperty(PdfAutomaticFieldInfoCollection.prototype, "automaticFields", {
        /**
         * Gets the `page number fields collection`.
         * @private
         */
        get: function () {
            return this.automaticFieldsInformation;
        },
        enumerable: true,
        configurable: true
    });
    // Public methods
    /// Adds the specified field info.
    /**
     * Add page number field into collection.
     * @private
     */
    PdfAutomaticFieldInfoCollection.prototype.add = function (fieldInfo) {
        return this.automaticFields.push(fieldInfo);
    };
    return PdfAutomaticFieldInfoCollection;
}());
export { PdfAutomaticFieldInfoCollection };
