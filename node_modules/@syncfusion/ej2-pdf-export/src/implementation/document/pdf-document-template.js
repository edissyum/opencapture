import { TemplateType } from './../pages/enum';
// import { PdfStampCollection } from `./../Pages/PdfStampCollection`;
/**
 * `PdfDocumentTemplate` class encapsulates a page template for all the pages in the document.
 * @private
 */
var PdfDocumentTemplate = /** @class */ (function () {
    // Constructors
    /**
     * Initializes a new instance of the `PdfDocumentTemplate` class.
     * @public
     */
    function PdfDocumentTemplate() {
        //
    }
    Object.defineProperty(PdfDocumentTemplate.prototype, "left", {
        // private m_stamps : PdfStampCollection;
        // Properties
        /**
         * `Left` page template object.
         * @public
         */
        get: function () {
            return this.leftTemplate;
        },
        set: function (value) {
            this.leftTemplate = this.checkElement(value, TemplateType.Left);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PdfDocumentTemplate.prototype, "top", {
        /**
         * `Top` page template object.
         * @public
         */
        get: function () {
            return this.topTemplate;
        },
        set: function (value) {
            this.topTemplate = this.checkElement(value, TemplateType.Top);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PdfDocumentTemplate.prototype, "right", {
        /**
         * `Right` page template object.
         * @public
         */
        get: function () {
            return this.rightTemplate;
        },
        set: function (value) {
            this.rightTemplate = this.checkElement(value, TemplateType.Right);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PdfDocumentTemplate.prototype, "bottom", {
        /**
         * `Bottom` page template object.
         * @public
         */
        get: function () {
            return this.bottomTemplate;
        },
        set: function (value) {
            this.bottomTemplate = this.checkElement(value, TemplateType.Bottom);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PdfDocumentTemplate.prototype, "EvenLeft", {
        /**
         * `EvenLeft` page template object.
         * @public
         */
        get: function () {
            return this.evenLeft;
        },
        set: function (value) {
            this.evenLeft = this.checkElement(value, TemplateType.Left);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PdfDocumentTemplate.prototype, "EvenTop", {
        /**
         * `EvenTop` page template object.
         * @public
         */
        get: function () {
            return this.evenTop;
        },
        set: function (value) {
            this.evenTop = this.checkElement(value, TemplateType.Top);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PdfDocumentTemplate.prototype, "EvenRight", {
        /**
         * `EvenRight` page template object.
         * @public
         */
        get: function () {
            return this.evenRight;
        },
        set: function (value) {
            this.evenRight = this.checkElement(value, TemplateType.Right);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PdfDocumentTemplate.prototype, "EvenBottom", {
        /**
         * `EvenBottom` page template object.
         * @public
         */
        get: function () {
            return this.evenBottom;
        },
        set: function (value) {
            this.evenBottom = this.checkElement(value, TemplateType.Bottom);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PdfDocumentTemplate.prototype, "OddLeft", {
        /**
         * `OddLeft` page template object.
         * @public
         */
        get: function () {
            return this.oddLeft;
        },
        set: function (value) {
            this.oddLeft = this.checkElement(value, TemplateType.Left);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PdfDocumentTemplate.prototype, "OddTop", {
        /**
         * `OddTop` page template object.
         * @public
         */
        get: function () {
            return this.oddTop;
        },
        set: function (value) {
            this.oddTop = this.checkElement(value, TemplateType.Top);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PdfDocumentTemplate.prototype, "OddRight", {
        /**
         * `OddRight` page template object.
         * @public
         */
        get: function () {
            return this.oddRight;
        },
        set: function (value) {
            this.oddRight = this.checkElement(value, TemplateType.Right);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PdfDocumentTemplate.prototype, "OddBottom", {
        /**
         * `OddBottom` page template object.
         * @public
         */
        get: function () {
            return this.oddBottom;
        },
        set: function (value) {
            this.oddBottom = this.checkElement(value, TemplateType.Bottom);
        },
        enumerable: true,
        configurable: true
    });
    // Implementation
    /**
     * Returns `left` template.
     * @public
     */
    PdfDocumentTemplate.prototype.getLeft = function (page) {
        if (page == null) {
            throw new Error('ArgumentNullException:page');
        }
        var template = null;
        // if (page.Document.Pages != null) {
        var even = this.isEven(page);
        if (even) {
            template = (this.EvenLeft != null) ? this.EvenLeft : this.left;
        }
        else {
            template = (this.OddLeft != null) ? this.OddLeft : this.left;
        }
        // }
        return template;
    };
    /**
     * Returns `top` template.
     * @public
     */
    PdfDocumentTemplate.prototype.getTop = function (page) {
        if (page == null) {
            throw new Error('ArgumentNullException:page');
        }
        var template = null;
        // if (page.Document.Pages != null) {
        var even = this.isEven(page);
        if (even) {
            template = (this.EvenTop != null) ? this.EvenTop : this.top;
        }
        else {
            template = (this.OddTop != null) ? this.OddTop : this.top;
        }
        // }
        return template;
    };
    /**
     * Returns `right` template.
     * @public
     */
    PdfDocumentTemplate.prototype.getRight = function (page) {
        if (page == null) {
            throw new Error('ArgumentNullException:page');
        }
        var template = null;
        // if (page.Document.Pages != null) {
        var even = this.isEven(page);
        if (even) {
            template = (this.EvenRight != null) ? this.EvenRight : this.right;
        }
        else {
            template = (this.OddRight != null) ? this.OddRight : this.right;
        }
        // }
        return template;
    };
    /**
     * Returns `bottom` template.
     * @public
     */
    PdfDocumentTemplate.prototype.getBottom = function (page) {
        if (page == null) {
            throw new Error('ArgumentNullException:page');
        }
        var template = null;
        // if (page.Document.Pages != null) {
        var even = this.isEven(page);
        if (even) {
            template = (this.EvenBottom != null) ? this.EvenBottom : this.bottom;
        }
        else {
            template = (this.OddBottom != null) ? this.OddBottom : this.bottom;
        }
        // }
        return template;
    };
    /**
     * Checks whether the page `is even`.
     * @private
     */
    PdfDocumentTemplate.prototype.isEven = function (page) {
        var pages = page.section.document.pages;
        var index = 0;
        if (pages.pageCollectionIndex.containsKey(page)) {
            index = pages.pageCollectionIndex.getValue(page) + 1;
        }
        else {
            index = pages.indexOf(page) + 1;
        }
        var even = ((index % 2) === 0);
        return even;
    };
    /**
     * Checks a `template element`.
     * @private
     */
    PdfDocumentTemplate.prototype.checkElement = function (templateElement, type) {
        if (templateElement != null) {
            if ((typeof templateElement.type !== 'undefined') && (templateElement.type !== TemplateType.None)) {
                throw new Error('NotSupportedException:Can not reassign the template element. Please, create new one.');
            }
            templateElement.type = type;
        }
        return templateElement;
    };
    return PdfDocumentTemplate;
}());
export { PdfDocumentTemplate };
