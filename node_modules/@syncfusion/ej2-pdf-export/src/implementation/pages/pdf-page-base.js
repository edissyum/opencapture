import { PdfArray } from './../primitives/pdf-array';
import { PdfPageLayerCollection } from './pdf-page-layer-collection';
import { DictionaryProperties } from './../input-output/pdf-dictionary-properties';
import { PdfResources } from './../graphics/pdf-resources';
/**
 * The abstract base class for all pages,
 * `PdfPageBase` class provides methods and properties to create PDF pages and its elements.
 * @private
 */
var PdfPageBase = /** @class */ (function () {
    //constructors
    /**
     * Initializes a new instance of the `PdfPageBase` class.
     * @private
     */
    function PdfPageBase(dictionary) {
        /**
         * `Index` of the default layer.
         * @default -1.
         * @private
         */
        this.defLayerIndex = -1;
        /**
         * Local variable to store if page `updated`.
         * @default false.
         * @private
         */
        this.modified = false;
        /**
         * Instance of `DictionaryProperties` class.
         * @hidden
         * @private
         */
        this.dictionaryProperties = new DictionaryProperties();
        this.pageDictionary = dictionary;
    }
    Object.defineProperty(PdfPageBase.prototype, "section", {
        //Properties
        /**
         * Gets the `section` of a page.
         * @private
         */
        get: function () {
            // if (this.pdfSection === null) {
            //     throw new Error('PdfException : Page must be added to some section before using.');
            // }
            return this.pdfSection;
        },
        set: function (value) {
            this.pdfSection = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PdfPageBase.prototype, "dictionary", {
        /**
         * Gets the page `dictionary`.
         * @private
         */
        get: function () {
            return this.pageDictionary;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PdfPageBase.prototype, "element", {
        /**
         * Gets the wrapped `element`.
         * @private
         */
        get: function () {
            return this.pageDictionary;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PdfPageBase.prototype, "defaultLayer", {
        /**
         * Gets the `default layer` of the page (Read only).
         * @private
         */
        get: function () {
            var layer = this.layers;
            var index = this.defaultLayerIndex;
            var returnlayer = layer.items(index);
            return returnlayer;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PdfPageBase.prototype, "defaultLayerIndex", {
        /**
         * Gets or sets `index of the default layer`.
         * @private
         */
        get: function () {
            if (this.layerCollection.count === 0 || this.defLayerIndex === -1) {
                var layer = this.layerCollection.add();
                this.defLayerIndex = this.layerCollection.indexOf(layer);
            }
            return this.defLayerIndex;
        },
        /**
         * Gets or sets` index of the default layer`.
         * @private
         */
        set: function (value) {
            if (value < 0 || value > this.layers.count - 1) {
                throw new Error('ArgumentOutOfRangeException : value, Index can not be less 0 and greater Layers.Count - 1');
            }
            else {
                this.defLayerIndex = value;
                this.modified = true;
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PdfPageBase.prototype, "layers", {
        /**
         * Gets the collection of the page's `layers` (Read only).
         * @private
         */
        get: function () {
            if (this.layerCollection == null || typeof this.layerCollection === 'undefined') {
                this.layerCollection = new PdfPageLayerCollection(this);
            }
            return this.layerCollection;
        },
        enumerable: true,
        configurable: true
    });
    /**
     * Return an instance of `PdfResources` class.
     * @private
     */
    PdfPageBase.prototype.getResources = function () {
        if (this.resources == null) {
            this.resources = new PdfResources();
            this.dictionary.items.setValue(this.dictionaryProperties.resources, this.resources);
        }
        return this.resources;
    };
    Object.defineProperty(PdfPageBase.prototype, "contents", {
        /**
         * Gets `array of page's content`.
         * @private
         */
        get: function () {
            var obj = this.pageDictionary.items.getValue(this.dictionaryProperties.contents);
            var contents = obj;
            var rh = obj;
            if (contents == null) {
                contents = new PdfArray();
                this.pageDictionary.items.setValue(this.dictionaryProperties.contents, contents);
            }
            return contents;
        },
        enumerable: true,
        configurable: true
    });
    /**
     * Sets the `resources`.
     * @private
     */
    PdfPageBase.prototype.setResources = function (res) {
        this.resources = res;
        this.dictionary.items.setValue(this.dictionaryProperties.resources, this.resources);
        this.modified = true;
    };
    return PdfPageBase;
}());
export { PdfPageBase };
