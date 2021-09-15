import { DictionaryProperties } from './../../input-output/pdf-dictionary-properties';
var PdfFunction = /** @class */ (function () {
    //Constructor
    /**
     * Initializes a new instance of the `PdfFunction` class.
     * @public
     */
    function PdfFunction(dictionary) {
        //Field
        /**
         * Internal variable to store dictionary.
         * @private
         */
        this.mDictionary = null;
        /**
         * Local variable to store the dictionary properties.
         * @private
         */
        this.mDictionaryProperties = new DictionaryProperties();
        this.mDictionary = dictionary;
    }
    Object.defineProperty(PdfFunction.prototype, "domain", {
        //Properties
        /**
         * Gets or sets the domain of the function.
         * @public
         */
        get: function () {
            var domain = this.mDictionary.items.getValue(this.mDictionaryProperties.domain);
            return domain;
        },
        set: function (value) {
            this.mDictionary.items.setValue(this.mDictionaryProperties.domain, value);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PdfFunction.prototype, "range", {
        /**
         * Gets or sets the range.
         * @public
         */
        get: function () {
            var range = (this.mDictionary.items.getValue(this.mDictionaryProperties.range));
            return range;
        },
        set: function (value) {
            this.mDictionary.items.setValue(this.mDictionaryProperties.range, value);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PdfFunction.prototype, "dictionary", {
        /**
         * Gets the dictionary.
         */
        get: function () {
            return this.mDictionary;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PdfFunction.prototype, "element", {
        //IPdfWrapper Members
        /**
         * Gets the element.
         */
        get: function () {
            return this.mDictionary;
        },
        enumerable: true,
        configurable: true
    });
    return PdfFunction;
}());
export { PdfFunction };
