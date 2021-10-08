import { StreamWriter } from '@syncfusion/ej2-file-utils';
import { Encoding } from '@syncfusion/ej2-file-utils';
import { PdfDocument } from './pdf-document';
/**
 * `PdfDocumentBase` class represent common properties of PdfDocument classes.
 * @private
 */
var PdfDocumentBase = /** @class */ (function () {
    function PdfDocumentBase(document) {
        /**
         * If the stream is copied,  then it specifies true.
         * @private
         */
        this.isStreamCopied = false;
        if (document instanceof PdfDocument) {
            this.document = document;
        }
    }
    Object.defineProperty(PdfDocumentBase.prototype, "pdfObjects", {
        //Prpperties
        /**
         * Gets the `PDF objects` collection, which stores all objects and references to it..
         * @private
         */
        get: function () {
            return this.objects;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PdfDocumentBase.prototype, "crossTable", {
        /**
         * Gets the `cross-reference` table.
         * @private
         */
        get: function () {
            return this.pdfCrossTable;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PdfDocumentBase.prototype, "currentSavingObj", {
        /**
         * Gets or sets the current saving `object number`.
         * @private
         */
        get: function () {
            return this.currentSavingObject;
        },
        set: function (value) {
            this.currentSavingObject = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PdfDocumentBase.prototype, "catalog", {
        /**
         * Gets the PDF document `catalog`.
         * @private
         */
        get: function () {
            return this.pdfCatalog;
        },
        set: function (value) {
            this.pdfCatalog = value;
        },
        enumerable: true,
        configurable: true
    });
    //Public methods
    /**
     * Sets the `main object collection`.
     * @private
     */
    PdfDocumentBase.prototype.setMainObjectCollection = function (mainObjectCollection) {
        this.objects = mainObjectCollection;
    };
    /**
     * Sets the `cross table`.
     * @private
     */
    PdfDocumentBase.prototype.setCrossTable = function (cTable) {
        this.pdfCrossTable = cTable;
    };
    /**
     * Sets the `catalog`.
     * @private
     */
    PdfDocumentBase.prototype.setCatalog = function (catalog) {
        this.pdfCatalog = catalog;
    };
    PdfDocumentBase.prototype.save = function (filename) {
        var _this = this;
        var encoding = new Encoding(true);
        var SW = new StreamWriter(encoding);
        if (typeof filename === 'undefined') {
            var encoding_1 = new Encoding(true);
            var SW_1 = new StreamWriter(encoding_1);
            return new Promise(function (resolve, reject) {
                /* tslint:disable-next-line:no-any */
                var obj = {};
                obj.blobData = new Blob([_this.document.docSave(SW_1, true)], { type: 'application/pdf' });
                resolve(obj);
            });
        }
        else {
            this.document.docSave(SW, filename, true);
        }
    };
    /**
     * `Clone` of parent object - PdfDocument.
     * @private
     */
    PdfDocumentBase.prototype.clone = function () {
        return this.document;
    };
    return PdfDocumentBase;
}());
export { PdfDocumentBase };
