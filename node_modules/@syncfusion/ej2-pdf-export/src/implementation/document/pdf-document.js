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
import { PdfWriter } from './../input-output/pdf-writer';
import { PdfMainObjectCollection } from './../input-output/pdf-main-object-collection';
import { PdfDocumentBase } from './pdf-document-base';
import { PdfCrossTable } from './../input-output/pdf-cross-table';
import { PdfCatalog } from './pdf-catalog';
import { PdfPageSettings } from './../pages/pdf-page-settings';
import { PdfSectionCollection } from './../pages/pdf-section-collection';
import { PdfDocumentPageCollection } from './../pages/pdf-document-page-collection';
import { PdfCacheCollection } from './../general/pdf-cache-collection';
import { PdfColorSpace } from './../graphics/enum';
import { PdfDocumentTemplate } from './pdf-document-template';
import { PdfFontFamily } from './../graphics/fonts/enum';
import { PdfStandardFont } from './../graphics/fonts/pdf-standard-font';
/**
 * Represents a PDF document and can be used to create a new PDF document from the scratch.
 * ```typescript
 * // create a new PDF document
 * let document : PdfDocument = new PdfDocument();
 * // add a new page to the document
 * let page1 : PdfPage = document.pages.add();
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
var PdfDocument = /** @class */ (function (_super) {
    __extends(PdfDocument, _super);
    function PdfDocument(isMerging) {
        var _this = _super.call(this) || this;
        /**
         * Default `margin` value.
         * @default 40.0
         * @private
         */
        _this.defaultMargin = 40.0;
        /**
         * Internal variable to store instance of `StreamWriter` classes..
         * @default null
         * @private
         */
        _this.streamWriter = null;
        _this.document = _this;
        var isMerge = false;
        if (typeof isMerging === 'undefined') {
            PdfDocument.cacheCollection = new PdfCacheCollection();
            isMerge = false;
        }
        else {
            isMerge = isMerging;
        }
        var objects = new PdfMainObjectCollection();
        _this.setMainObjectCollection(objects);
        var crossTable = new PdfCrossTable();
        crossTable.isMerging = isMerge;
        crossTable.document = _this;
        _this.setCrossTable(crossTable);
        var catalog = new PdfCatalog();
        _this.setCatalog(catalog);
        objects.add(catalog);
        catalog.position = -1;
        _this.sectionCollection = new PdfSectionCollection(_this);
        _this.documentPageCollection = new PdfDocumentPageCollection(_this);
        catalog.pages = _this.sectionCollection;
        return _this;
    }
    Object.defineProperty(PdfDocument, "defaultFont", {
        //Properties
        /**
         * Gets the `default font`. It is used for complex objects when font is not explicitly defined.
         * @private
         */
        get: function () {
            if (this.defaultStandardFont == null) {
                this.defaultStandardFont = new PdfStandardFont(PdfFontFamily.Helvetica, 8);
            }
            return this.defaultStandardFont;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PdfDocument.prototype, "sections", {
        /**
         * Gets the collection of the `sections` in the document.
         * @private
         */
        get: function () {
            return this.sectionCollection;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PdfDocument.prototype, "pageSettings", {
        /**
         * Gets the document's page setting.
         * @public
         */
        get: function () {
            if (this.settings == null) {
                this.settings = new PdfPageSettings(this.defaultMargin);
            }
            return this.settings;
        },
        /**
         * Sets the document's page setting.
         * ```typescript
         * // create a new PDF document
         * let document : PdfDocument = new PdfDocument();
         *
         * // sets the right margin of the page
         * document.pageSettings.margins.right = 0;
         * // set the page size.
         * document.pageSettings.size = new SizeF(500, 500);
         * // change the page orientation to landscape
         * document.pageSettings.orientation = PdfPageOrientation.Landscape;
         * // apply 90 degree rotation on the page
         * document.pageSettings.rotate = PdfPageRotateAngle.RotateAngle90;
         *
         * // add a pages to the document
         * let page1 : PdfPage = document.pages.add();
         * // set font
         * let font : PdfStandardFont = new PdfStandardFont(PdfFontFamily.Helvetica, 20);
         * // set brush
         * let blackBrush : PdfSolidBrush = new PdfSolidBrush(new PdfColor(0, 0, 0));
         * // set the specified Point
         * let point : PointF = new PointF(page1.getClientSize().width - 200, page1.getClientSize().height - 200);
         * // draw the text
         * page1.graphics.drawString('Hello World', font, blackBrush, point);
         * // save the document
         * document.save('output.pdf');
         * // destroy the document
         * document.destroy();
         * ```
         */
        set: function (value) {
            this.settings = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PdfDocument.prototype, "pages", {
        /**
         * Represents the collection of pages in the PDF document.
         * ```typescript
         * // create a new PDF document
         * let document : PdfDocument = new PdfDocument();
         * //
         * // get the collection of pages in the document
         * let pageCollection : PdfDocumentPageCollection  = document.pages;
         * //
         * // add pages
         * let page1 : PdfPage = pageCollection.add();
         * // save the document
         * document.save('output.pdf');
         * // destroy the document
         * document.destroy();
         * ```
         */
        get: function () {
            return this.documentPageCollection;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PdfDocument, "cache", {
        /**
         * Gets collection of the `cached objects`.
         * @private
         */
        get: function () {
            if (typeof PdfDocument.cacheCollection === 'undefined' || PdfDocument.cacheCollection == null) {
                return new PdfCacheCollection();
            }
            return PdfDocument.cacheCollection;
        },
        /**
         * Sets collection of the `cached objects`.
         * @private
         */
        set: function (value) {
            this.cacheCollection = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PdfDocument, "enableCache", {
        /**
         * Gets the value of enable cache.
         * @private
         */
        get: function () {
            return this.isCacheEnabled;
        },
        /**
         * Sets thie value of enable cache.
         * @private
         */
        set: function (value) {
            this.isCacheEnabled = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PdfDocument.prototype, "colorSpace", {
        /* tslint:disable */
        /**
         * Gets or sets the `color space` of the document. This property can be used to create PDF document in RGB, Gray scale or CMYK color spaces.
         * @private
         */
        get: function () {
            if ((this.pdfColorSpace === PdfColorSpace.Rgb) || ((this.pdfColorSpace === PdfColorSpace.Cmyk)
                || (this.pdfColorSpace === PdfColorSpace.GrayScale))) {
                return this.pdfColorSpace;
            }
            else {
                return PdfColorSpace.Rgb;
            }
        },
        set: function (value) {
            if ((value === PdfColorSpace.Rgb) || ((value === PdfColorSpace.Cmyk) ||
                (value === PdfColorSpace.GrayScale))) {
                this.pdfColorSpace = value;
            }
            else {
                this.pdfColorSpace = PdfColorSpace.Rgb;
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PdfDocument.prototype, "template", {
        /* tslint:enable */
        /**
         * Gets or sets a `template` to all pages in the document.
         * @private
         */
        get: function () {
            if (this.pageTemplate == null) {
                this.pageTemplate = new PdfDocumentTemplate();
            }
            return this.pageTemplate;
        },
        set: function (value) {
            this.pageTemplate = value;
        },
        enumerable: true,
        configurable: true
    });
    PdfDocument.prototype.docSave = function (stream, arg2, arg3) {
        this.checkPagesPresence();
        if (stream === null) {
            throw new Error('ArgumentNullException : stream');
        }
        this.streamWriter = stream;
        var writer = new PdfWriter(stream);
        writer.document = this;
        if (typeof arg2 === 'boolean' && typeof arg3 === 'undefined') {
            return this.crossTable.save(writer);
        }
        else {
            this.crossTable.save(writer, arg2);
        }
    };
    /**
     * Checks the pages `presence`.
     * @private
     */
    PdfDocument.prototype.checkPagesPresence = function () {
        if (this.pages.count === 0) {
            this.pages.add();
        }
    };
    /**
     * disposes the current instance of `PdfDocument` class.
     * ```typescript
     * // create a new PDF document
     * let document : PdfDocument = new PdfDocument();
     * // add a new page to the document
     * let page1 : PdfPage = document.pages.add();
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
    PdfDocument.prototype.destroy = function () {
        this.catalog = undefined;
        this.colorSpace = undefined;
        this.currentSavingObj = undefined;
        this.documentPageCollection = undefined;
        this.isStreamCopied = undefined;
        this.pageSettings = undefined;
        this.pageTemplate = undefined;
        this.pdfColorSpace = undefined;
        this.sectionCollection = undefined;
        PdfDocument.cache.destroy();
        this.crossTable.pdfObjects.destroy();
        PdfDocument.cache = undefined;
        this.streamWriter.destroy();
    };
    /**
     * `Font` used in complex objects to draw strings and text when it is not defined explicitly.
     * @default null
     * @private
     */
    PdfDocument.defaultStandardFont = null;
    /**
     * Indicates whether enable cache or not
     * @default true
     * @private
     */
    PdfDocument.isCacheEnabled = true;
    return PdfDocument;
}(PdfDocumentBase));
export { PdfDocument };
