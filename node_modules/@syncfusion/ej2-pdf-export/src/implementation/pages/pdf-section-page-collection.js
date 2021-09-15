/**
 * Represents the `collection of pages in a section`.
 * @private
 */
var PdfSectionPageCollection = /** @class */ (function () {
    // Constructors
    /**
     * Initializes a new instance of the `PdfSectionPageCollection` class.
     * @private
     */
    function PdfSectionPageCollection(section) {
        //  Fields
        /**
         * @hidden
         * @private
         */
        this.pdfSection = null;
        if (section == null) {
            throw Error('ArgumentNullException("section")');
        }
        this.section = section;
    }
    Object.defineProperty(PdfSectionPageCollection.prototype, "section", {
        // Properties
        /**
         * Gets the `PdfPage` at the specified index.
         * @private
         */
        get: function () {
            return this.pdfSection;
        },
        set: function (value) {
            this.pdfSection = value;
        },
        enumerable: true,
        configurable: true
    });
    // Public Methods
    /**
     * `Determines` whether the specified page is within the collection.
     * @private
     */
    PdfSectionPageCollection.prototype.contains = function (page) {
        return this.section.contains(page);
    };
    /**
     * `Removes` the specified page from collection.
     * @private
     */
    PdfSectionPageCollection.prototype.remove = function (page) {
        this.section.remove(page);
    };
    /**
     * `Adds` a new page from collection.
     * @private
     */
    PdfSectionPageCollection.prototype.add = function () {
        return this.section.add();
    };
    return PdfSectionPageCollection;
}());
export { PdfSectionPageCollection };
