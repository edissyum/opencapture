import { PdfNumber } from './../primitives/pdf-number';
import { PdfName } from './../primitives/pdf-name';
import { PdfArray } from './../primitives/pdf-array';
import { PdfDictionary, SaveSectionCollectionEventHandler } from './../primitives/pdf-dictionary';
import { PdfReferenceHolder } from './../primitives/pdf-reference';
import { RectangleF, PointF } from './../drawing/pdf-drawing';
import { PdfSection } from './pdf-section';
import { DictionaryProperties } from './../input-output/pdf-dictionary-properties';
/**
 * Represents the `collection of the sections`.
 * @private
 */
var PdfSectionCollection = /** @class */ (function () {
    //constructor
    /**
     * Initializes a new instance of the `PdfSectionCollection` class.
     * @private
     */
    function PdfSectionCollection(document) {
        /**
         * @hidden
         * @private
         */
        this.sections = [];
        /**
         * @hidden
         * @private
         */
        this.dictionaryProperties = new DictionaryProperties();
        // if (document === null) {
        //     throw new Error('ArgumentNullException : document');
        // }
        this.pdfDocument = document.clone();
        this.initialize();
    }
    Object.defineProperty(PdfSectionCollection.prototype, "section", {
        //Properties
        /**
         * Gets the `Section` collection.
         */
        get: function () {
            return this.sections;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PdfSectionCollection.prototype, "document", {
        /**
         * Gets a parent `document`.
         * @private
         */
        get: function () {
            return this.pdfDocument;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PdfSectionCollection.prototype, "count", {
        /**
         * Gets the `number of sections` in a document.
         * @private
         */
        get: function () {
            return this.sections.length;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PdfSectionCollection.prototype, "element", {
        /**
         * Gets the wrapped `element`.
         * @private
         */
        get: function () {
            return this.pages;
        },
        enumerable: true,
        configurable: true
    });
    //Methods
    /**
     * `Initializes the object`.
     * @private
     */
    PdfSectionCollection.prototype.initialize = function () {
        this.sectionCount = new PdfNumber(0);
        this.sectionCollection = new PdfArray();
        this.pages = new PdfDictionary();
        this.pages.beginSave = new SaveSectionCollectionEventHandler(this);
        this.pages.items.setValue(this.dictionaryProperties.type, new PdfName('Pages'));
        this.pages.items.setValue(this.dictionaryProperties.kids, this.sectionCollection);
        this.pages.items.setValue(this.dictionaryProperties.count, this.sectionCount);
        this.pages.items.setValue(this.dictionaryProperties.resources, new PdfDictionary());
        this.setPageSettings(this.pages, this.pdfDocument.pageSettings);
    };
    /**
     * Initializes a new instance of the `PdfSectionCollection` class.
     * @private
     */
    PdfSectionCollection.prototype.pdfSectionCollection = function (index) {
        if (index < 0 || index >= this.count) {
            throw new Error('IndexOutOfRangeException()');
        }
        return this.sections[index];
    };
    /**
     * In fills dictionary by the data from `Page settings`.
     * @private
     */
    PdfSectionCollection.prototype.setPageSettings = function (container, pageSettings) {
        // if (container === null) {
        //     throw new Error('ArgumentNullException : container');
        // }
        // if (pageSettings === null) {
        //     throw new Error('ArgumentNullException : pageSettings');
        // }
        var bounds = new RectangleF(new PointF(), pageSettings.size);
        container.items.setValue(this.dictionaryProperties.mediaBox, PdfArray.fromRectangle(bounds));
    };
    /**
     * `Adds` the specified section.
     * @private
     */
    PdfSectionCollection.prototype.add = function (section) {
        if (typeof section === 'undefined') {
            var section_1 = new PdfSection(this.pdfDocument);
            this.add(section_1);
            return section_1;
        }
        else {
            // if (section === null) {
            //     throw new Error('ArgumentNullException : section');
            // }
            var r = this.checkSection(section);
            this.sections.push(section);
            section.parent = this;
            this.sectionCollection.add(r);
            return this.sections.indexOf(section);
        }
    };
    /**
     * `Checks` if the section is within the collection.
     * @private
     */
    PdfSectionCollection.prototype.checkSection = function (section) {
        var r = new PdfReferenceHolder(section);
        var contains = this.sectionCollection.contains(r);
        // if (contains) {
        //     throw new Error('ArgumentException : The object can not be added twice to the collection,section');
        // }
        return r;
    };
    /**
     * Catches the Save event of the dictionary to `count the pages`.
     * @private
     */
    PdfSectionCollection.prototype.countPages = function () {
        var count = 0;
        this.sections.forEach(function (n) { return (count += n.count); });
        return count;
    };
    /**
     * Catches the Save event of the dictionary to `count the pages`.
     * @hidden
     * @private
     */
    PdfSectionCollection.prototype.beginSave = function () {
        this.sectionCount.intValue = this.countPages();
    };
    //Fields
    /**
     * Rotate factor for page `rotation`.
     * @default 90
     * @private
     */
    PdfSectionCollection.rotateFactor = 90;
    return PdfSectionCollection;
}());
export { PdfSectionCollection };
