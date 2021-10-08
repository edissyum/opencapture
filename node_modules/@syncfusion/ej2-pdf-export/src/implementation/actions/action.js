import { PdfDictionary } from './../primitives/pdf-dictionary';
import { PdfReferenceHolder } from './../primitives/pdf-reference';
import { PdfName } from './../primitives/pdf-name';
import { DictionaryProperties } from './../input-output/pdf-dictionary-properties';
/**
 * `PdfAction` class represents base class for all action types.
 * @private
 */
var PdfAction = /** @class */ (function () {
    // Constructors
    /**
     * Initialize instance for `Action` class.
     * @private
     */
    function PdfAction() {
        /**
         * Specifies the Next `action` to perform.
         * @private
         */
        this.action = null;
        /**
         * Specifies the Internal variable to store `dictionary properties`.
         * @private
         */
        this.dictionaryProperties = new DictionaryProperties();
        // super(); -> Object()
        this.initialize();
    }
    Object.defineProperty(PdfAction.prototype, "next", {
        // Properties
        /**
         * Gets and Sets the `Next` action to perform.
         * @private
         */
        get: function () {
            return this.action;
        },
        set: function (value) {
            // if (this.action !== value) {
            this.action = value;
            this.dictionary.items.setValue(this.dictionaryProperties.next, new PdfReferenceHolder(this.action));
            // }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PdfAction.prototype, "dictionary", {
        /**
         * Gets and Sets the instance of PdfDictionary class for `Dictionary`.
         * @private
         */
        get: function () {
            if (typeof this.pdfDictionary === 'undefined') {
                this.pdfDictionary = new PdfDictionary();
            }
            return this.pdfDictionary;
        },
        enumerable: true,
        configurable: true
    });
    // Implementation
    /**
     * `Initialize` the action type.
     * @private
     */
    PdfAction.prototype.initialize = function () {
        this.dictionary.items.setValue(this.dictionaryProperties.type, new PdfName(this.dictionaryProperties.action));
    };
    Object.defineProperty(PdfAction.prototype, "element", {
        // IPdfWrapper Members
        /**
         * Gets the `Element` as IPdfPrimitive class.
         * @private
         */
        get: function () {
            return this.dictionary;
        },
        enumerable: true,
        configurable: true
    });
    return PdfAction;
}());
export { PdfAction };
