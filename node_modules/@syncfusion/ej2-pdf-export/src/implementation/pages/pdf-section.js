import { PdfPage } from './pdf-page';
import { PageAddedEventArgs } from './page-added-event-arguments';
import { PdfReferenceHolder } from './../primitives/pdf-reference';
import { PdfArray } from './../primitives/pdf-array';
import { PdfNumber } from './../primitives/pdf-number';
import { PdfName } from './../primitives/pdf-name';
import { PdfDictionary } from './../primitives/pdf-dictionary';
import { SaveSectionEventHandler } from './../primitives/pdf-dictionary';
import { DictionaryProperties } from './../input-output/pdf-dictionary-properties';
import { PdfSectionCollection } from './pdf-section-collection';
import { PdfSectionPageCollection } from './pdf-section-page-collection';
import { RectangleF } from './../drawing/pdf-drawing';
import { PdfSectionTemplate } from './pdf-section-templates';
/**
 * Represents a `section` entity. A section it's a set of the pages with similar page settings.
 */
var PdfSection = /** @class */ (function () {
    function PdfSection(document, pageSettings) {
        //Fields
        //public PageAdded() : PageAddedEventArgs.PageAddedEventHandler = new PageAddedEventArgs.PageAddedEventHandler(Object,args)
        /**
         * @hidden
         * @private
         */
        this.pageAdded = new PageAddedEventArgs();
        /**
         * @hidden
         * @private
         */
        this.pdfPages = [];
        /**
         * @hidden
         * @private
         */
        this.dictionaryProperties = new DictionaryProperties();
        this.pdfDocument = document;
        if (typeof pageSettings === 'undefined') {
            this.settings = document.pageSettings.clone();
            this.initialSettings = this.settings.clone();
        }
        else {
            this.settings = pageSettings.clone();
            this.initialSettings = this.settings.clone();
        }
        this.initialize();
    }
    Object.defineProperty(PdfSection.prototype, "parent", {
        //Property
        /**
         * Gets or sets the `parent`.
         * @private
         */
        get: function () {
            return this.sectionCollection;
        },
        set: function (value) {
            this.sectionCollection = value;
            this.section.items.setValue(this.dictionaryProperties.parent, new PdfReferenceHolder(value));
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PdfSection.prototype, "parentDocument", {
        /**
         * Gets the `parent document`.
         * @private
         */
        get: function () {
            return this.pdfDocument;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PdfSection.prototype, "pageSettings", {
        /**
         * Gets or sets the `page settings` of the section.
         * @private
         */
        get: function () {
            return this.settings;
        },
        set: function (value) {
            if (value != null) {
                this.settings = value;
            }
            else {
                throw Error('Value can not be null.');
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PdfSection.prototype, "element", {
        /**
         * Gets the wrapped `element`.
         * @private
         */
        get: function () {
            return this.section;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PdfSection.prototype, "count", {
        /**
         * Gets the `count` of the pages in the section.
         * @private
         */
        get: function () {
            return this.pagesReferences.count;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PdfSection.prototype, "template", {
        /**
         * Gets or sets a `template` for the pages in the section.
         * @private
         */
        get: function () {
            if (this.pageTemplate == null) {
                this.pageTemplate = new PdfSectionTemplate();
            }
            return this.pageTemplate;
        },
        set: function (value) {
            this.pageTemplate = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PdfSection.prototype, "document", {
        /**
         * Gets the `document`.
         * @private
         */
        get: function () {
            return this.sectionCollection.document;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PdfSection.prototype, "pages", {
        /**
         * Gets the collection of `pages` in a section (Read only)
         * @private
         */
        get: function () {
            if (this.pagesCollection == null || typeof this.pagesCollection === 'undefined') {
                this.pagesCollection = new PdfSectionPageCollection(this);
            }
            return this.pagesCollection;
        },
        enumerable: true,
        configurable: true
    });
    //methods
    /**
     * `Return the page collection` of current section.
     * @private
     */
    PdfSection.prototype.getPages = function () {
        return this.pdfPages;
    };
    /**
     * `Translates` point into native coordinates of the page.
     * @private
     */
    PdfSection.prototype.pointToNativePdf = function (page, point) {
        var bounds = this.getActualBounds(page, true);
        point.x += bounds.x;
        point.y = this.pageSettings.height - (point.y);
        return point;
    };
    /**
     * Sets the page setting of the current section.
     * @public
     * @param settings Instance of `PdfPageSettings`
     */
    PdfSection.prototype.setPageSettings = function (settings) {
        this.settings = settings;
        this.state.orientation = settings.orientation;
        this.state.rotate = settings.rotate;
        this.state.size = settings.size;
        this.state.origin = settings.origin;
    };
    /**
     * `Initializes` the object.
     * @private
     */
    PdfSection.prototype.initialize = function () {
        this.pagesReferences = new PdfArray();
        this.section = new PdfDictionary();
        this.state = new PageSettingsState(this.pdfDocument);
        this.section.sectionBeginSave = new SaveSectionEventHandler(this, this.state);
        this.pageCount = new PdfNumber(0);
        this.section.items.setValue(this.dictionaryProperties.count, this.pageCount);
        this.section.items.setValue(this.dictionaryProperties.type, new PdfName(this.dictionaryProperties.pages));
        this.section.items.setValue(this.dictionaryProperties.kids, this.pagesReferences);
    };
    /**
     * Checks whether any template should be printed on this layer.
     * @private
     * @param document The parent document.
     * @param page The parent page.
     * @param foreground Layer z-order.
     * @returns True - if some content should be printed on the layer, False otherwise.
     */
    PdfSection.prototype.containsTemplates = function (document, page, foreground) {
        var documentHeaders = this.getDocumentTemplates(document, page, foreground);
        var sectionTemplates = this.getSectionTemplates(page, foreground);
        return (documentHeaders.length > 0 || sectionTemplates.length > 0);
    };
    /**
     * Returns array of the document templates.
     * @private
     * @param document The parent document.
     * @param page The parent page.
     * @param headers If true - return headers/footers, if false - return simple templates.
     * @param foreground If true - return foreground templates, if false - return background templates.
     * @returns Returns array of the document templates.
     */
    /* tslint:disable */
    PdfSection.prototype.getDocumentTemplates = function (document, page, foreground) {
        var templates = [];
        if (this.template.applyDocumentTopTemplate && document.template.getTop(page) != null) {
            if ((!(document.template.getTop(page).foreground || foreground)) || (document.template.getTop(page).foreground && foreground)) {
                templates.push(document.template.getTop(page));
            }
        }
        if (this.template.applyDocumentBottomTemplate && document.template.getBottom(page) != null) {
            if ((!(document.template.getBottom(page).foreground || foreground)) || (document.template.getBottom(page).foreground && foreground)) {
                templates.push(document.template.getBottom(page));
            }
        }
        if (this.template.applyDocumentLeftTemplate && document.template.getLeft(page) != null) {
            if ((!(document.template.getLeft(page).foreground || foreground)) || (document.template.getLeft(page).foreground && foreground)) {
                templates.push(document.template.getLeft(page));
            }
        }
        if (this.template.applyDocumentRightTemplate && document.template.getRight(page) != null) {
            if ((!(document.template.getRight(page).foreground || foreground)) || (document.template.getRight(page).foreground && foreground)) {
                templates.push(document.template.getRight(page));
            }
        }
        return templates;
    };
    /**
     * Returns array of the section templates.
     * @private
     * @param page The parent page.
     * @param foreground If true - return foreground templates, if false - return background templates.
     * @returns Returns array of the section templates.
     */
    /* tslint:disable */
    PdfSection.prototype.getSectionTemplates = function (page, foreground) {
        var templates = [];
        if (this.template.getTop(page) != null) {
            var pageTemplate = this.template.getTop(page);
            if ((!(pageTemplate.foreground || foreground)) || (pageTemplate.foreground && foreground)) {
                templates.push(pageTemplate);
            }
        }
        if (this.template.getBottom(page) != null) {
            var pageTemplate = this.template.getBottom(page);
            if ((!(pageTemplate.foreground || foreground)) || (pageTemplate.foreground && foreground)) {
                templates.push(pageTemplate);
            }
        }
        if (this.template.getLeft(page) != null) {
            var pageTemplate = this.template.getLeft(page);
            if ((!(pageTemplate.foreground || foreground)) || (pageTemplate.foreground && foreground)) {
                templates.push(pageTemplate);
            }
        }
        if (this.template.getRight(page) != null) {
            var pageTemplate = this.template.getRight(page);
            if ((!(pageTemplate.foreground || foreground)) || (pageTemplate.foreground && foreground)) {
                templates.push(pageTemplate);
            }
        }
        return templates;
    };
    /* tslint:enable */
    /**
     * `Adds` the specified page.
     * @private
     */
    PdfSection.prototype.add = function (page) {
        if (typeof page === 'undefined') {
            var page_1 = new PdfPage();
            this.add(page_1);
            return page_1;
        }
        else {
            var r = this.checkPresence(page);
            this.pdfPages.push(page);
            this.pagesReferences.add(r);
            page.setSection(this);
            page.resetProgress();
            this.pageAddedMethod(page);
        }
    };
    /**
     * `Checks the presence`.
     * @private
     */
    PdfSection.prototype.checkPresence = function (page) {
        var rh = new PdfReferenceHolder(page);
        var contains = false;
        var sc = this.parent;
        for (var index = 0; index < sc.section.length; index++) {
            var section = sc.section[index];
            contains = contains || section.contains(page);
        }
        return rh;
    };
    /**
     * `Determines` whether the page in within the section.
     * @private
     */
    PdfSection.prototype.contains = function (page) {
        var index = this.indexOf(page);
        return (0 <= index);
    };
    /**
     * Get the `index of` the page.
     * @private
     */
    PdfSection.prototype.indexOf = function (page) {
        for (var index = 0; index < this.pdfPages.length; index++) {
            if (this.pdfPages[index] === page) {
                return this.pdfPages.indexOf(page);
            }
        }
        var r = new PdfReferenceHolder(page);
        return this.pagesReferences.indexOf(r);
    };
    /**
     * Call two event's methods.
     * @hidden
     * @private
     */
    PdfSection.prototype.pageAddedMethod = function (page) {
        //Create event's arguments
        var args = new PageAddedEventArgs(page);
        this.onPageAdded(args);
        var parent = this.parent;
        parent.document.pages.onPageAdded(args);
        this.pageCount.intValue = this.count;
    };
    /**
     * Called when the page has been added.
     * @hidden
     * @private
     */
    PdfSection.prototype.onPageAdded = function (args) {
        //
    };
    PdfSection.prototype.getActualBounds = function (arg1, arg2, arg3) {
        if (arg1 instanceof PdfPage && typeof arg2 === 'boolean') {
            var result = void 0;
            var document_1 = this.parent.document;
            result = this.getActualBounds(document_1, arg1, arg2);
            return result;
        }
        else {
            arg1 = arg1;
            arg2 = arg2;
            arg3 = arg3;
            var bounds = new RectangleF(0, 0, 0, 0);
            bounds.height = (arg3) ? this.pageSettings.size.height : this.pageSettings.getActualSize().height;
            bounds.width = (arg3) ? this.pageSettings.size.width : this.pageSettings.getActualSize().width;
            var left = this.getLeftIndentWidth(arg1, arg2, arg3);
            var top_1 = this.getTopIndentHeight(arg1, arg2, arg3);
            var right = this.getRightIndentWidth(arg1, arg2, arg3);
            var bottom = this.getBottomIndentHeight(arg1, arg2, arg3);
            bounds.x += left;
            bounds.y += top_1;
            bounds.width -= (left + right);
            bounds.height -= (top_1 + bottom);
            return bounds;
        }
    };
    /**
     * Calculates width of the `left indent`.
     * @private
     */
    PdfSection.prototype.getLeftIndentWidth = function (document, page, includeMargins) {
        if (document == null) {
            throw new Error('ArgumentNullException:document');
        }
        if (page == null) {
            throw new Error('ArgumentNullException:page');
        }
        var value = (includeMargins) ? this.pageSettings.margins.left : 0;
        var templateWidth = (this.template.getLeft(page) != null) ? this.template.getLeft(page).width : 0;
        var docTemplateWidth = (document.template.getLeft(page) != null) ? document.template.getLeft(page).width : 0;
        value += (this.template.applyDocumentLeftTemplate) ? Math.max(templateWidth, docTemplateWidth) : templateWidth;
        return value;
    };
    /**
     * Calculates `Height` of the top indent.
     * @private
     */
    PdfSection.prototype.getTopIndentHeight = function (document, page, includeMargins) {
        if (document == null) {
            throw new Error('ArgumentNullException:document');
        }
        if (page == null) {
            throw new Error('ArgumentNullException:page');
        }
        var value = (includeMargins) ? this.pageSettings.margins.top : 0;
        var templateHeight = (this.template.getTop(page) != null) ? this.template.getTop(page).height : 0;
        var docTemplateHeight = (document.template.getTop(page) != null) ? document.template.getTop(page).height : 0;
        value += (this.template.applyDocumentTopTemplate) ? Math.max(templateHeight, docTemplateHeight) : templateHeight;
        return value;
    };
    /**
     * Calculates `width` of the right indent.
     * @private
     */
    PdfSection.prototype.getRightIndentWidth = function (document, page, includeMargins) {
        if (document == null) {
            throw new Error('ArgumentNullException:document');
        }
        if (page == null) {
            throw new Error('ArgumentNullException:page');
        }
        var value = (includeMargins) ? this.pageSettings.margins.right : 0;
        var templateWidth = (this.template.getRight(page) != null) ? this.template.getRight(page).width : 0;
        var docTemplateWidth = (document.template.getRight(page) != null) ? document.template.getRight(page).width : 0;
        value += (this.template.applyDocumentRightTemplate) ? Math.max(templateWidth, docTemplateWidth) : templateWidth;
        return value;
    };
    /**
     * Calculates `Height` of the bottom indent.
     * @private
     */
    PdfSection.prototype.getBottomIndentHeight = function (document, page, includeMargins) {
        if (document == null) {
            throw new Error('ArgumentNullException:document');
        }
        if (page == null) {
            throw new Error('ArgumentNullException:page');
        }
        var value = (includeMargins) ? this.pageSettings.margins.bottom : 0;
        var templateHeight = (this.template.getBottom(page) != null) ? this.template.getBottom(page).height : 0;
        var docTemplateHeight = (document.template.getBottom(page) != null) ? document.template.getBottom(page).height : 0;
        value += (this.template.applyDocumentBottomTemplate) ? Math.max(templateHeight, docTemplateHeight) : templateHeight;
        return value;
    };
    /**
     * `Removes` the page from the section.
     * @private
     */
    PdfSection.prototype.remove = function (page) {
        if (page == null) {
            throw Error('ArgumentNullException("page")');
        }
        var index = this.pdfPages.indexOf(page);
        this.pagesReferences.removeAt(index);
        var temproaryPages = [];
        for (var j = 0; j < index; j++) {
            temproaryPages.push(this.pdfPages[j]);
        }
        for (var j = index + 1; j < this.pdfPages.length; j++) {
            temproaryPages.push(this.pdfPages[j]);
        }
        this.pdfPages = temproaryPages;
    };
    /**
     * In fills dictionary by the data from `Page settings`.
     * @private
     */
    PdfSection.prototype.applyPageSettings = function (container, parentSettings, state) {
        var bounds = new RectangleF(state.origin, state.size);
        container.items.setValue(this.dictionaryProperties.mediaBox, PdfArray.fromRectangle(bounds));
        var rotate = 0;
        rotate = PdfSectionCollection.rotateFactor * state.rotate;
        var angle = new PdfNumber(rotate);
        container.items.setValue(this.dictionaryProperties.rotate, angle);
    };
    /**
     * Catches the Save event of the dictionary.
     * @hidden
     * @private
     */
    PdfSection.prototype.beginSave = function (state, writer) {
        var doc = writer.document;
        this.applyPageSettings(this.section, doc.pageSettings, state);
    };
    /**
     * Draws page templates on the page.
     * @private
     */
    PdfSection.prototype.drawTemplates = function (page, layer, document, foreground) {
        var documentHeaders = this.getDocumentTemplates(document, page, foreground);
        var sectionHeaders = this.getSectionTemplates(page, foreground);
        this.drawTemplatesHelper(layer, document, documentHeaders);
        this.drawTemplatesHelper(layer, document, sectionHeaders);
    };
    /**
     * Draws page templates on the page.
     * @private
     */
    PdfSection.prototype.drawTemplatesHelper = function (layer, document, templates) {
        if (templates != null && templates.length > 0) {
            var len = templates.length;
            for (var i = 0; i < len; i++) {
                var template = templates[i];
                template.draw(layer, document);
            }
        }
    };
    return PdfSection;
}());
export { PdfSection };
var PageSettingsState = /** @class */ (function () {
    //Public Constructor
    /**
     * New instance to store the `PageSettings`.
     * @private
     */
    function PageSettingsState(document) {
        this.pageOrientation = document.pageSettings.orientation;
        this.pageRotate = document.pageSettings.rotate;
        this.pageSize = document.pageSettings.size;
        this.pageOrigin = document.pageSettings.origin;
    }
    Object.defineProperty(PageSettingsState.prototype, "orientation", {
        //public Properties
        /**
         * @hidden
         * @private
         */
        get: function () {
            return this.pageOrientation;
        },
        set: function (value) {
            this.pageOrientation = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PageSettingsState.prototype, "rotate", {
        /**
         * @hidden
         * @private
         */
        get: function () {
            return this.pageRotate;
        },
        set: function (value) {
            this.pageRotate = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PageSettingsState.prototype, "size", {
        /**
         * @hidden
         * @private
         */
        get: function () {
            return this.pageSize;
        },
        set: function (value) {
            this.pageSize = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PageSettingsState.prototype, "origin", {
        /**
         * @hidden
         * @private
         */
        get: function () {
            return this.pageOrigin;
        },
        set: function (value) {
            this.pageOrigin = value;
        },
        enumerable: true,
        configurable: true
    });
    return PageSettingsState;
}());
export { PageSettingsState };
