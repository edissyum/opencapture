var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
import { PdfPageBase } from './pdf-page-base';
import { PdfDictionary, SaveTemplateEventHandler } from './../primitives/pdf-dictionary';
import { PdfName } from './../primitives/pdf-name';
import { PdfReferenceHolder } from './../primitives/pdf-reference';
import { SizeF } from './../drawing/pdf-drawing';
import { PdfAnnotationCollection } from './../annotations/annotation-collection';
import { PdfPageLayer } from './pdf-page-layer';
/**
 * Provides methods and properties to create pages and its elements.
 * `PdfPage` class inherited from the `PdfPageBase` class.
 * ```typescript
 * // create a new PDF document
 * let document : PdfDocument = new PdfDocument();
 * //
 * // add a new page to the document
 * let page1 : PdfPage = document.pages.add();
 * //
 * // set the font
 * let font : PdfStandardFont = new PdfStandardFont(PdfFontFamily.Helvetica, 20);
 * // create black brush
 * let blackBrush : PdfSolidBrush = new PdfSolidBrush(new PdfColor(0, 0, 0));
 * // draw the text
 * page1.graphics.drawString('Hello World', font, blackBrush, new PointF(0, 0));
 * // save the document
 * document.save('output.pdf');
 * // destroy the document
 * document.destroy();
 * ```
 */
var PdfPage = /** @class */ (function (_super) {
    __extends(PdfPage, _super);
    //constructors
    /**
     * Initialize the new instance for `PdfPage` class.
     * @private
     */
    function PdfPage() {
        var _this = _super.call(this, new PdfDictionary()) || this;
        /**
         * Stores the instance of `PdfAnnotationCollection` class.
         * @hidden
         * @default null
         * @private
         */
        _this.annotationCollection = null;
        /**
         * Stores the instance of `PageBeginSave` event for Page Number Field.
         * @default null
         * @private
         */
        _this.beginSave = null;
        _this.initialize();
        return _this;
    }
    Object.defineProperty(PdfPage.prototype, "document", {
        //Properties
        /**
         * Gets current `document`.
         * @private
         */
        get: function () {
            if (this.section !== null && this.section.parent !== null) {
                return this.section.parent.document;
            }
            else {
                return null;
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PdfPage.prototype, "graphics", {
        /**
         * Get the current `graphics`.
         * ```typescript
         * // create a new PDF document
         * let document : PdfDocument = new PdfDocument();
         * // add a new page to the document
         * let page1 : PdfPage = document.pages.add();
         * //
         * // get graphics
         * let graphics : PdfGraphics = page1.graphics;
         * //
         * // set the font
         * let font : PdfStandardFont = new PdfStandardFont(PdfFontFamily.Helvetica, 20);
         * // create black brush
         * let blackBrush : PdfSolidBrush = new PdfSolidBrush(new PdfColor(0, 0, 0));
         * // draw the text
         * graphics.drawString('Hello World', font, blackBrush, new PointF(0, 0));
         * // save the document
         * document.save('output.pdf');
         * // destroy the document
         * document.destroy();
         * ```
         */
        get: function () {
            var result = this.defaultLayer.graphics;
            result.currentPage = this;
            return result;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PdfPage.prototype, "crossTable", {
        /**
         * Gets the `cross table`.
         * @private
         */
        get: function () {
            if (this.section === null) {
                throw new Error('PdfDocumentException : Page is not created');
            }
            return this.section.parent === null ? this.section.parentDocument.crossTable : this.section.parent.document.crossTable;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PdfPage.prototype, "size", {
        /**
         * Gets the size of the PDF page- Read only.
         * @public
         */
        get: function () {
            return this.section.pageSettings.size;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PdfPage.prototype, "origin", {
        /**
         * Gets the `origin` of the page.
         * @private
         */
        get: function () {
            return this.section.pageSettings.origin;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PdfPage.prototype, "annotations", {
        /**
         * Gets a collection of the `annotations` of the page- Read only.
         * @private
         */
        get: function () {
            if (this.annotationCollection == null) {
                this.annotationCollection = new PdfAnnotationCollection(this);
                // if (!this.Dictionary.ContainsKey(this.dictionaryProperties.annots)) {
                this.dictionary.items.setValue(this.dictionaryProperties.annots, this.annotationCollection.element);
                // }
                this.annotationCollection.annotations = this.dictionary.items.getValue(this.dictionaryProperties.annots);
            }
            return this.annotationCollection;
        },
        enumerable: true,
        configurable: true
    });
    //Implementation
    /**
     * `Initializes` a page.
     * @private
     */
    PdfPage.prototype.initialize = function () {
        this.dictionary.items.setValue(this.dictionaryProperties.type, new PdfName('Page'));
        this.dictionary.pageBeginDrawTemplate = new SaveTemplateEventHandler(this);
    };
    /**
     * Sets parent `section` to the page.
     * @private
     */
    PdfPage.prototype.setSection = function (section) {
        this.section = section;
        this.dictionary.items.setValue(this.dictionaryProperties.parent, new PdfReferenceHolder(section));
    };
    /**
     * `Resets the progress`.
     * @private
     */
    PdfPage.prototype.resetProgress = function () {
        this.isProgressOn = false;
    };
    /**
     * Get the page size reduced by page margins and page template dimensions.
     * ```typescript
     * // create a new PDF document
     * let document : PdfDocument = new PdfDocument();
     * // add a pages to the document
     * let page1 : PdfPage = document.pages.add();
     * // create new standard font
     * let font : PdfStandardFont = new PdfStandardFont(PdfFontFamily.Helvetica, 20);
     * // set brush
     * let blackBrush : PdfSolidBrush = new PdfSolidBrush(new PdfColor(0, 0, 0));
     * //
     * // set the specified point using `getClientSize` method
     * let point : PointF = new PointF(page1.getClientSize().width - 200, page1.getClientSize().height - 200);
     * // draw the text
     * page1.graphics.drawString('Hello World', font, blackBrush, point);
     * //
     * // save the document
     * document.save('output.pdf');
     * // destroy the document
     * document.destroy();
     * ```
     */
    PdfPage.prototype.getClientSize = function () {
        var returnValue = this.section.getActualBounds(this, true);
        return new SizeF(returnValue.width, returnValue.height);
    };
    /**
     * Helper method to retrive the instance of `PageBeginSave` event for header and footer elements.
     * @private
     */
    PdfPage.prototype.pageBeginSave = function () {
        var doc = this.document;
        if (typeof doc !== undefined && doc != null) {
            this.drawPageTemplates(doc);
        }
        if (this.beginSave != null && typeof this.beginSave !== 'undefined') {
            this.beginSave(this);
        }
    };
    /**
     * Helper method to draw template elements.
     * @private
     */
    PdfPage.prototype.drawPageTemplates = function (document) {
        // Draw Background templates.
        var hasBackTemplates = this.section.containsTemplates(document, this, false);
        if (hasBackTemplates) {
            var backLayer = new PdfPageLayer(this, false);
            this.layers.insert(0, backLayer);
            this.section.drawTemplates(this, backLayer, document, false);
            if (backLayer.graphics !== null && typeof backLayer.graphics !== 'undefined') {
                for (var i = 0; i < backLayer.graphics.automaticFields.automaticFields.length; i++) {
                    var fieldInfo = backLayer.graphics.automaticFields.automaticFields[i];
                    fieldInfo.field.performDraw(backLayer.graphics, fieldInfo.location, fieldInfo.scalingX, fieldInfo.scalingY);
                }
            }
        }
        // Draw Foreground templates.
        var hasFrontTemplates = this.section.containsTemplates(document, this, true);
        if (hasFrontTemplates) {
            var frontLayer = new PdfPageLayer(this, false);
            this.layers.add(frontLayer);
            this.section.drawTemplates(this, frontLayer, document, true);
        }
    };
    return PdfPage;
}(PdfPageBase));
export { PdfPage };
