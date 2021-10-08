import { PdfDictionary } from './../primitives/pdf-dictionary';
import { PdfNumber } from './../primitives/pdf-number';
import { PdfName } from './../primitives/pdf-name';
import { DictionaryProperties } from './../input-output/pdf-dictionary-properties';
/**
 * Represents a simple `transparency`.
 * @private
 */
var PdfTransparency = /** @class */ (function () {
    // Properties
    // /**
    //  * Gets the `stroke` operation alpha value.
    //  * @private
    //  */
    // public get stroke() : number {
    //     let result : number = this.getNumber(this.dictionaryProperties.CA);
    //     return result;
    // }
    // /**
    //  * Gets the `fill` operation alpha value.
    //  * @private
    //  */
    // public get fill() : number {
    //     let result : number = this.getNumber(this.dictionaryProperties.ca);
    //     return result;
    // }
    // /**
    //  * Gets the `blend mode`.
    //  * @private
    //  */
    // public get mode() : PdfBlendMode {
    //     let result : string = this.getName(this.dictionaryProperties.ca);
    //     return PdfBlendMode.Normal;
    // }
    // Constructors
    /**
     * Initializes a new instance of the `Transparency` class.
     * @private
     */
    function PdfTransparency(stroke, fill, mode) {
        // Fields
        /**
         * Internal variable to store `dictionary`.
         * @default new PdfDictionary()
         * @private
         */
        this.dictionary = new PdfDictionary();
        /**
         * Internal variable for accessing fields from `DictionryProperties` class.
         * @default new DictionaryProperties()
         * @private
         */
        this.dictionaryProperties = new DictionaryProperties();
        this.dictionary.items.setValue(this.dictionaryProperties.CA, new PdfNumber(stroke));
        this.dictionary.items.setValue(this.dictionaryProperties.ca, new PdfNumber(fill));
        this.dictionary.items.setValue(this.dictionaryProperties.BM, new PdfName(mode.toString()));
    }
    Object.defineProperty(PdfTransparency.prototype, "element", {
        // // Implementation
        // /**
        //  * Gets the `number value`.
        //  * @private
        //  */
        // private getNumber(keyName : string) : number {
        //     let result : number = 0.0;
        //     let numb : PdfNumber = this.dictionary.items.getValue(keyName) as PdfNumber;
        //     result = numb.intValue;
        //     return result;
        // }
        // /**
        //  * Gets the `name value`.
        //  * @private
        //  */
        // private getName(keyName : string) : string {
        //     let result : string = null;
        //     let name : PdfName = this.dictionary.items.getValue(keyName) as PdfName;
        //     result = name.value;
        //     return result;
        // }
        // IPdfWrapper Members
        /**
         * Gets the `element`.
         * @private
         */
        get: function () {
            return this.dictionary;
        },
        enumerable: true,
        configurable: true
    });
    return PdfTransparency;
}());
export { PdfTransparency };
