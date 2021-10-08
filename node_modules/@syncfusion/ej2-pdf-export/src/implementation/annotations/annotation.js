import { PdfColor } from './../graphics/pdf-color';
import { RectangleF, PointF } from './../drawing/pdf-drawing';
import { PdfDictionary, SaveAnnotationEventHandler } from './../primitives/pdf-dictionary';
import { PdfArray } from './../primitives/pdf-array';
import { PdfNumber } from './../primitives/pdf-number';
import { PdfReferenceHolder } from './../primitives/pdf-reference';
import { PdfString } from './../primitives/pdf-string';
import { DictionaryProperties } from './../input-output/pdf-dictionary-properties';
import { PdfName } from './../primitives/pdf-name';
import { PdfSolidBrush } from './../graphics/brushes/pdf-solid-brush';
import { PdfStandardFont } from './../graphics/fonts/pdf-standard-font';
import { PdfFontFamily } from './../graphics/fonts/enum';
import { PdfStringFormat } from './../graphics/fonts/pdf-string-format';
import { PdfTextAlignment } from './../graphics/enum';
/**
 * `PdfAnnotation` class represents the base class for annotation objects.
 * @private
 */
var PdfAnnotation = /** @class */ (function () {
    function PdfAnnotation(arg1) {
        // Fields
        /**
         * Specifies the Internal variable to store fields of `PdfDictionaryProperties`.
         * @private
         */
        this.dictionaryProperties = new DictionaryProperties();
        /**
         * `Color` of the annotation
         * @private
         */
        this.pdfColor = new PdfColor(255, 255, 255);
        /**
         * `Bounds` of the annotation.
         * @private
         */
        this.rectangle = new RectangleF(0, 0, 0, 0);
        /**
         * Parent `page` of the annotation.
         * @private
         */
        this.pdfPage = null;
        /**
         * `Brush of the text` of the annotation.
         * @default new PdfSolidBrush(new PdfColor(0, 0, 0))
         * @private
         */
        this.textBrush = new PdfSolidBrush(new PdfColor(0, 0, 0));
        /**
         * `Font of the text` of the annotation.
         * @default new PdfStandardFont(PdfFontFamily.TimesRoman, 10)
         * @private
         */
        this.textFont = new PdfStandardFont(PdfFontFamily.TimesRoman, 10);
        /**
         * `StringFormat of the text` of the annotation.
         * @default new PdfStringFormat(PdfTextAlignment.Left)
         * @private
         */
        this.format = new PdfStringFormat(PdfTextAlignment.Left);
        /**
         * `Text` of the annotation.
         * @private
         */
        this.content = '';
        /**
         * Internal variable to store `dictionary`.
         * @private
         */
        this.pdfDictionary = new PdfDictionary();
        /**
         * To specifying the `Inner color` with which to fill the annotation
         * @private
         */
        this.internalColor = new PdfColor();
        /**
         * `opacity or darkness` of the annotation.
         * @private
         * @default 1.0
         */
        this.darkness = 1.0;
        if (typeof arg1 === 'undefined') {
            this.initialize();
        }
        else {
            this.initialize();
            this.bounds = arg1;
        }
    }
    Object.defineProperty(PdfAnnotation.prototype, "color", {
        // Properties
        /**
         * `Color` of the annotation
         * @private
         */
        get: function () {
            return this.pdfColor;
        },
        set: function (value) {
            this.pdfColor = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PdfAnnotation.prototype, "innerColor", {
        /**
         * To specifying the `Inner color` with which to fill the annotation
         * @private
         */
        get: function () {
            return this.internalColor;
        },
        set: function (value) {
            this.internalColor = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PdfAnnotation.prototype, "bounds", {
        /**
         * `bounds` of the annotation.
         * @private
         */
        get: function () {
            return this.rectangle;
        },
        set: function (value) {
            this.rectangle = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PdfAnnotation.prototype, "page", {
        /**
         * Parent `page` of the annotation.
         * @private
         */
        get: function () {
            return this.pdfPage;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PdfAnnotation.prototype, "font", {
        /**
         * To specifying the `Font of the text` in the annotation.
         * @private
         */
        get: function () {
            return this.textFont;
        },
        set: function (value) {
            this.textFont = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PdfAnnotation.prototype, "stringFormat", {
        /**
         * To specifying the `StringFormat of the text` in the annotation.
         * @private
         */
        get: function () {
            return this.format;
        },
        set: function (value) {
            this.format = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PdfAnnotation.prototype, "brush", {
        /**
         * To specifying the `Brush of the text` in the annotation.
         * @private
         */
        get: function () {
            return this.textBrush;
        },
        set: function (value) {
            this.textBrush = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PdfAnnotation.prototype, "text", {
        /**
         * `Text` of the annotation.
         * @private
         */
        get: function () {
            return this.content;
        },
        set: function (value) {
            this.content = value;
            this.dictionary.items.setValue(this.dictionaryProperties.contents, new PdfString(this.content));
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PdfAnnotation.prototype, "dictionary", {
        /**
         * Internal variable to store `dictionary`.
         * @hidden
         */
        get: function () {
            return this.pdfDictionary;
        },
        set: function (value) {
            this.pdfDictionary = value;
        },
        enumerable: true,
        configurable: true
    });
    // Implementation
    /**
     * `Initialize` the annotation event handler and specifies the type of the annotation.
     * @private
     */
    PdfAnnotation.prototype.initialize = function () {
        this.pdfDictionary.annotationBeginSave = new SaveAnnotationEventHandler(this);
        this.pdfDictionary.items.setValue(this.dictionaryProperties.type, new PdfName(this.dictionaryProperties.annot));
    };
    /**
     * Sets related `page` of the annotation.
     * @private
     */
    PdfAnnotation.prototype.setPage = function (page) {
        this.pdfPage = page;
        this.pdfDictionary.items.setValue(this.dictionaryProperties.p, new PdfReferenceHolder(this.pdfPage));
    };
    /**
     * Handles the `BeginSave` event of the Dictionary.
     * @private
     */
    PdfAnnotation.prototype.beginSave = function () {
        this.save();
    };
    /**
     * `Saves` an annotation.
     * @private
     */
    /* tslint:disable */
    PdfAnnotation.prototype.save = function () {
        var nativeRectangle = new RectangleF(this.rectangle.x, this.rectangle.y, this.rectangle.width, this.rectangle.height);
        var section = this.pdfPage.section;
        var initialHeight = nativeRectangle.height;
        var tempLoacation = section.pointToNativePdf(this.page, new PointF(nativeRectangle.x, nativeRectangle.y));
        nativeRectangle.x = tempLoacation.x;
        nativeRectangle.width = tempLoacation.x + nativeRectangle.width;
        nativeRectangle.y = (tempLoacation.y - this.page.document.pageSettings.margins.top);
        nativeRectangle.height = nativeRectangle.y - initialHeight;
        this.pdfDictionary.items.setValue(this.dictionaryProperties.rect, PdfArray.fromRectangle(nativeRectangle));
        this.dictionary.items.setValue(this.dictionaryProperties.ca, new PdfNumber(this.darkness));
    };
    Object.defineProperty(PdfAnnotation.prototype, "element", {
        /* tslint:enable */
        // IPdfWrapper Members
        /**
         * Gets the `element`.
         * @private
         */
        get: function () {
            return this.pdfDictionary;
        },
        enumerable: true,
        configurable: true
    });
    return PdfAnnotation;
}());
export { PdfAnnotation };
