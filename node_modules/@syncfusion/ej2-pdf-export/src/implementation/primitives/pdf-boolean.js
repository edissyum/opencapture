/**
 * `PdfBoolean` class is used to perform boolean related primitive operations.
 * @private
 */
var PdfBoolean = /** @class */ (function () {
    //constructor
    /**
     * Initializes a new instance of the `PdfBoolean` class.
     * @private
     */
    function PdfBoolean(value) {
        /**
         * Internal variable to store the `position`.
         * @default -1
         * @private
         */
        this.currentPosition = -1;
        this.value = value;
    }
    Object.defineProperty(PdfBoolean.prototype, "status", {
        //Properties
        /**
         * Gets or sets the `Status` of the specified object.
         * @private
         */
        get: function () {
            return this.objectStatus;
        },
        set: function (value) {
            this.objectStatus = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PdfBoolean.prototype, "isSaving", {
        /**
         * Gets or sets a value indicating whether this document `is saving` or not.
         * @private
         */
        get: function () {
            return this.saving;
        },
        set: function (value) {
            this.saving = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PdfBoolean.prototype, "objectCollectionIndex", {
        /**
         * Gets or sets the `index` value of the specified object.
         * @private
         */
        get: function () {
            return this.index;
        },
        set: function (value) {
            this.index = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PdfBoolean.prototype, "position", {
        /**
         * Gets or sets the `position` of the object.
         * @private
         */
        get: function () {
            return this.currentPosition;
        },
        set: function (value) {
            this.currentPosition = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PdfBoolean.prototype, "clonedObject", {
        /**
         * Returns `cloned object`.
         * @private
         */
        get: function () {
            var rValue = null;
            return rValue;
        },
        enumerable: true,
        configurable: true
    });
    /**
     * `Saves` the object using the specified writer.
     * @private
     */
    PdfBoolean.prototype.save = function (writer) {
        writer.write(this.boolToStr(this.value));
    };
    /**
     * Creates a `copy of PdfBoolean`.
     * @private
     */
    PdfBoolean.prototype.clone = function (crossTable) {
        var newNumber = new PdfBoolean(this.value);
        return newNumber;
    };
    // Implementation
    /**
     * Converts `boolean to string` - 0/1 'true'/'false'.
     * @private
     */
    PdfBoolean.prototype.boolToStr = function (value) {
        return value ? 'true' : 'false';
    };
    return PdfBoolean;
}());
export { PdfBoolean };
