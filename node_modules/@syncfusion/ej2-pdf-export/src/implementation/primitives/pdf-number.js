/**
 * `PdfNumber` class is used to perform number related primitive operations.
 * @private
 */
var PdfNumber = /** @class */ (function () {
    /**
     * Initializes a new instance of the `PdfNumber` class.
     * @private
     */
    function PdfNumber(value) {
        /**
         * Sotres the `position`.
         * @default -1
         * @private
         */
        this.position5 = -1;
        this.value = value;
    }
    Object.defineProperty(PdfNumber.prototype, "intValue", {
        /**
         * Gets or sets the `integer` value.
         * @private
         */
        get: function () {
            return this.value;
        },
        set: function (value) {
            this.value = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PdfNumber.prototype, "isInteger", {
        /**
         * Gets or sets a value indicating whether this instance `is integer`.
         * @private
         */
        get: function () {
            return this.integer;
        },
        set: function (value) {
            this.integer = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PdfNumber.prototype, "status", {
        /**
         * Gets or sets the `Status` of the specified object.
         * @private
         */
        get: function () {
            return this.status5;
        },
        set: function (value) {
            this.status5 = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PdfNumber.prototype, "isSaving", {
        /**
         * Gets or sets a value indicating whether this document `is saving` or not.
         * @private
         */
        get: function () {
            return this.isSaving5;
        },
        set: function (value) {
            this.isSaving5 = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PdfNumber.prototype, "objectCollectionIndex", {
        /**
         * Gets or sets the `index` value of the specified object.
         * @private
         */
        get: function () {
            return this.index5;
        },
        set: function (value) {
            this.index5 = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PdfNumber.prototype, "position", {
        /**
         * Gets or sets the `position` of the object.
         * @private
         */
        get: function () {
            return this.position5;
        },
        set: function (value) {
            this.position5 = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PdfNumber.prototype, "clonedObject", {
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
     * `Saves the object`.
     * @private
     */
    PdfNumber.prototype.save = function (writer) {
        writer.write(this.intValue.toString()); //tostring(CultureInfo.InletiantCulture)
    };
    /**
     * Creates a `copy of PdfNumber`.
     * @private
     */
    PdfNumber.prototype.clone = function (crossTable) {
        var newNumber = new PdfNumber(this.value);
        return newNumber;
    };
    /**
     * Converts a `float value to a string` using Adobe PDF rules.
     * @private
     */
    PdfNumber.floatToString = function (number) {
        // let tempString1 : string = number.toString();
        // let tempString2 : string = tempString1.indexOf('.') != -1 ? tempString1.substring(0, tempString1.indexOf('.')) : tempString1;
        var returnString = number.toFixed(2);
        if (returnString === '0.00') {
            returnString = '.00';
        }
        // let prefixLength : number = (22 - tempString2.length) >= 0 ? (22 - tempString2.length) : 0;
        // for (let index : number = 0; index < prefixLength; index++) {
        //     returnString += '0';
        // }
        // returnString += tempString2 + '.00';
        // returnString += (tempString3.length > 6) ? tempString3.substring(0,6) : tempString3;
        // let suffixLength : number = (6 - tempString3.length) >= 0 ? (6 - tempString3.length) : 0;
        // for (let index : number = 0; index < suffixLength; index++) {
        //     returnString += '0';
        // }
        return returnString;
    };
    /**
     * Determines the `minimum of the three values`.
     * @private
     */
    PdfNumber.min = function (x, y, z) {
        var r = Math.min(x, y);
        return Math.min(z, r);
    };
    return PdfNumber;
}());
export { PdfNumber };
