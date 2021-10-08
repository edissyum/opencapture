import { PdfPage } from './pdf-page';
import { Dictionary } from './../collections/dictionary';
/**
 * Represents a virtual collection of all the pages in the document.
 * @private
 */
var PdfDocumentPageCollection = /** @class */ (function () {
    //constructor
    /**
     * Initializes a new instance of the `PdfPageCollection` class.
     * @private
     */
    function PdfDocumentPageCollection(document) {
        /**
         * It holds the page collection with the `index`.
         * @private
         */
        this.pdfPageCollectionIndex = new Dictionary();
        this.document = document;
    }
    Object.defineProperty(PdfDocumentPageCollection.prototype, "count", {
        //Property
        /**
         * Gets the total `number of the pages`.
         * @private
         */
        get: function () {
            return this.countPages();
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PdfDocumentPageCollection.prototype, "pageCollectionIndex", {
        /**
         * Gets a `page index` from the document.
         * @private
         */
        get: function () {
            return this.pdfPageCollectionIndex;
        },
        enumerable: true,
        configurable: true
    });
    PdfDocumentPageCollection.prototype.add = function (page) {
        if (typeof page === 'undefined') {
            var page_1 = new PdfPage();
            this.add(page_1);
            return page_1;
        }
        else {
            var section = this.getLastSection();
            section.add(page);
        }
    };
    /**
     * Returns `last section` in the document.
     * @private
     */
    PdfDocumentPageCollection.prototype.getLastSection = function () {
        var sc = this.document.sections;
        if (sc.section.length === 0) {
            sc.add();
        }
        var section = sc.section[sc.section.length - 1];
        return section;
    };
    /**
     * Called when `new page has been added`.
     * @private
     */
    PdfDocumentPageCollection.prototype.onPageAdded = function (args) {
        // if (PageAdded !== null)
        // {
        //     PageAdded(this, args);
        // }
    };
    /**
     * Gets the `total number of pages`.
     * @private
     */
    PdfDocumentPageCollection.prototype.countPages = function () {
        var sc = this.document.sections;
        var count = 0;
        for (var index = 0; index < sc.section.length; index++) {
            count += sc.section[index].count;
        }
        return count;
    };
    /**
     * Gets the `page object` from page index.
     * @private
     */
    PdfDocumentPageCollection.prototype.getPageByIndex = function (index) {
        return this.getPage(index);
    };
    /**
     * Gets a page by its `index` in the document.
     * @private
     */
    PdfDocumentPageCollection.prototype.getPage = function (index) {
        if ((index < 0) || (index >= this.count)) {
            throw Error('ArgumentOutOfRangeException("index", "Value can not be less 0")');
        }
        var page = null;
        var sectionStartIndex = 0;
        var sectionCount = 0;
        var pageIndex = 0;
        var length = this.document.sections.count;
        for (var i = 0; i < length; i++) {
            var section = this.document.sections.section[i];
            sectionCount = section.count;
            pageIndex = index - sectionStartIndex;
            // We found a section containing the page.
            if ((index >= sectionStartIndex && pageIndex < sectionCount)) {
                page = section.getPages()[pageIndex];
                break;
            }
            sectionStartIndex += sectionCount;
        }
        return page;
    };
    /**
     * Gets the `index of` the page in the document.
     * @private
     */
    PdfDocumentPageCollection.prototype.indexOf = function (page) {
        var index = -1;
        if (page == null) {
            throw new Error('ArgumentNullException: page');
        }
        else {
            var numPages = 0;
            for (var i = 0, len = this.document.sections.count; i < len; i++) {
                var section = this.document.sections.pdfSectionCollection(i);
                index = section.indexOf(page);
                if (index >= 0) {
                    index += numPages;
                    break;
                }
                else {
                    index = -1;
                }
                numPages += section.count;
            }
        }
        return index;
    };
    /**
     * `Removes` the specified page.
     * @private
     */
    PdfDocumentPageCollection.prototype.remove = function (page) {
        if (page == null) {
            throw Error('ArgumentNullException("page")');
        }
        var section = null;
        var len;
        for (var i = 0, len_1 = this.document.sections.count; i < len_1; i++) {
            section = this.document.sections.pdfSectionCollection(i);
            if (section.pages.contains(page)) {
                section.pages.remove(page);
                break;
            }
        }
        return section;
    };
    return PdfDocumentPageCollection;
}());
export { PdfDocumentPageCollection };
