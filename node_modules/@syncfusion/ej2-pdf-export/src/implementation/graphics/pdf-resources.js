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
/**
 * PdfResources.ts class for EJ2-PDF
 */
import { PdfDictionary } from './../primitives/pdf-dictionary';
import { TemporaryDictionary } from './../collections/object-object-pair/dictionary';
import { PdfName } from './../primitives/pdf-name';
import { PdfArray } from './../primitives/pdf-array';
import { PdfReferenceHolder } from './../primitives/pdf-reference';
import { PdfCrossTable } from './../input-output/pdf-cross-table';
import { PdfFont } from './fonts/pdf-font';
import { PdfTemplate } from './figures/pdf-template';
import { PdfBrush } from './brushes/pdf-brush';
import { PdfTransparency } from './pdf-transparency';
import { PdfBitmap } from './../graphics/images/pdf-bitmap';
import { PdfImage } from './../graphics/images/pdf-image';
import { PdfGradientBrush } from './brushes/pdf-gradient-brush';
import { PdfTilingBrush } from './brushes/pdf-tiling-brush';
/**
 * `PdfResources` class used to set resource contents like font, image.
 * @private
 */
var PdfResources = /** @class */ (function (_super) {
    __extends(PdfResources, _super);
    function PdfResources(baseDictionary) {
        var _this = _super.call(this, baseDictionary) || this;
        /**
         * Dictionary for the `properties names`.
         * @private
         */
        _this.properties = new PdfDictionary();
        return _this;
    }
    Object.defineProperty(PdfResources.prototype, "names", {
        //Properties
        /**
         * Gets the `font names`.
         * @private
         */
        get: function () {
            return this.getNames();
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PdfResources.prototype, "document", {
        /**
         * Get or set the `page document`.
         * @private
         */
        get: function () {
            return this.pdfDocument;
        },
        set: function (value) {
            this.pdfDocument = value;
        },
        enumerable: true,
        configurable: true
    });
    //Public Methods
    /**
     * `Generates name` for the object and adds to the resource if the object is new.
     * @private
     */
    PdfResources.prototype.getName = function (obj) {
        var primitive = obj.element;
        var name = null;
        if (this.names.containsKey(primitive)) {
            name = this.names.getValue(primitive);
        }
        // Object is new.
        if (name == null) {
            var sName = this.generateName();
            name = new PdfName(sName);
            this.names.setValue(primitive, name);
            if (obj instanceof PdfFont) {
                this.add(obj, name);
            }
            else if (obj instanceof PdfTemplate) {
                this.add(obj, name);
            }
            else if (obj instanceof PdfGradientBrush || obj instanceof PdfTilingBrush) {
                this.add(obj, name);
            }
            else if (obj instanceof PdfTransparency) {
                this.add(obj, name);
            }
            else if (obj instanceof PdfImage || obj instanceof PdfBitmap) {
                this.add(obj, name);
            }
        }
        return name;
    };
    /**
     * Gets `resource names` to font dictionaries.
     * @private
     */
    PdfResources.prototype.getNames = function () {
        if (this.pdfNames == null) {
            this.pdfNames = new TemporaryDictionary();
        }
        var fonts = this.items.getValue(this.dictionaryProperties.font);
        if (fonts != null) {
            var reference = fonts;
            var dictionary = fonts;
            dictionary = PdfCrossTable.dereference(fonts);
        }
        return this.pdfNames;
    };
    /**
     * Add `RequireProcedureSet` into procset array.
     * @private
     */
    PdfResources.prototype.requireProcedureSet = function (procedureSetName) {
        if (procedureSetName == null) {
            throw new Error('ArgumentNullException:procedureSetName');
        }
        var procSets = this.items.getValue(this.dictionaryProperties.procset);
        if (procSets == null) {
            procSets = new PdfArray();
            this.items.setValue(this.dictionaryProperties.procset, procSets);
        }
        var name = new PdfName(procedureSetName);
        if (!procSets.contains(name)) {
            procSets.add(name);
        }
    };
    //Helper Methods
    /**
     * `Remove font` from array.
     * @private
     */
    PdfResources.prototype.removeFont = function (name) {
        var key = null;
        var keys = this.pdfNames.keys();
        for (var index = 0; index < this.pdfNames.size(); index++) {
            if (this.pdfNames.getValue(keys[index]) === new PdfName(name)) {
                key = keys[index];
                break;
            }
        }
        if (key != null) {
            this.pdfNames.remove(key);
        }
    };
    /**
     * Generates `Unique string name`.
     * @private
     */
    PdfResources.prototype.generateName = function () {
        var name = Guid.getNewGuidString();
        return name;
    };
    PdfResources.prototype.add = function (arg1, arg2) {
        if (arg1 instanceof PdfFont) {
            var dictionary = null;
            var fonts = this.items.getValue(this.dictionaryProperties.font);
            if (fonts != null) {
                var reference = fonts;
                dictionary = fonts;
                dictionary = fonts;
            }
            else {
                dictionary = new PdfDictionary();
                this.items.setValue(this.dictionaryProperties.font, dictionary);
            }
            dictionary.items.setValue(arg2.value, new PdfReferenceHolder(arg1.element));
        }
        else if (arg1 instanceof PdfTemplate) {
            var xobjects = void 0;
            xobjects = this.items.getValue(this.dictionaryProperties.xObject);
            // Create fonts dictionary.
            if (xobjects == null) {
                xobjects = new PdfDictionary();
                this.items.setValue(this.dictionaryProperties.xObject, xobjects);
            }
            xobjects.items.setValue(arg2.value, new PdfReferenceHolder(arg1.element));
        }
        else if (arg1 instanceof PdfBrush) {
            if (arg1 instanceof PdfGradientBrush || arg1 instanceof PdfTilingBrush) {
                var savable = arg1.element;
                if (savable != null) {
                    var pattern = this.items.getValue(this.dictionaryProperties.pattern);
                    // Create a new pattern dictionary.
                    if (pattern == null) {
                        pattern = new PdfDictionary();
                        this.items.setValue(this.dictionaryProperties.pattern, pattern);
                    }
                    pattern.items.setValue(arg2.value, new PdfReferenceHolder(savable));
                }
            }
        }
        else if (arg1 instanceof PdfTransparency) {
            var savable = arg1.element;
            var transDic = null;
            transDic = this.items.getValue(this.dictionaryProperties.extGState);
            // Create a new pattern dictionary.
            if (transDic == null) {
                transDic = new PdfDictionary();
                this.items.setValue(this.dictionaryProperties.extGState, transDic);
            }
            transDic.items.setValue(arg2.value, new PdfReferenceHolder(savable));
        }
        else {
            /* tslint:disable */
            var xobjects = this.Dictionary.items.getValue(this.dictionaryProperties.xObject);
            var parentXObjects = void 0;
            if (typeof this.pdfDocument !== 'undefined') {
                parentXObjects = this.pdfDocument.sections.element.items.getValue(this.dictionaryProperties.resources).items.getValue(this.dictionaryProperties.xObject);
            }
            var values = this.Dictionary.items.values();
            var hasSameImageStream = false;
            var oldReference = void 0;
            if (typeof this.pdfDocument !== 'undefined' && (typeof parentXObjects === undefined || parentXObjects == null)) {
                parentXObjects = new PdfDictionary();
                this.pdfDocument.sections.element.items.getValue(this.dictionaryProperties.resources).items.setValue(this.dictionaryProperties.xObject, parentXObjects);
            }
            else if (typeof this.pdfDocument !== 'undefined') {
                var values_1 = parentXObjects.items.values();
                for (var i = 0; i < values_1.length; i++) {
                    if (typeof values_1[i] !== 'undefined' && typeof values_1[i].element !== 'undefined') {
                        if (values_1[i].element.data[0] === arg1.element.data[0]) {
                            oldReference = values_1[i];
                            hasSameImageStream = true;
                        }
                    }
                }
            }
            if (xobjects == null) {
                xobjects = new PdfDictionary();
                this.Dictionary.items.setValue(this.dictionaryProperties.xObject, xobjects);
            }
            if (hasSameImageStream && typeof oldReference !== 'undefined') {
                xobjects.items.setValue(arg2.value, oldReference);
            }
            else {
                var reference = new PdfReferenceHolder(arg1.element);
                xobjects.items.setValue(arg2.value, reference);
                if (typeof this.pdfDocument !== 'undefined') {
                    parentXObjects.items.setValue(arg2.value, reference);
                }
            }
            /* tslint:enable */
        }
    };
    return PdfResources;
}(PdfDictionary));
export { PdfResources };
/* tslint:disable */
/**
 * Used to create new guid for resources.
 * @private
 */
var Guid = /** @class */ (function () {
    function Guid() {
    }
    /**
     * Generate `new GUID`.
     * @private
     */
    Guid.getNewGuidString = function () {
        return 'aaaaaaaa-aaaa-4aaa-baaa-aaaaaaaaaaaa'.replace(/[ab]/g, function (c) {
            var random = Math.random() * 16 | 0;
            var result = c === 'a' ? random : (random & 0x3 | 0x8);
            return result.toString(16);
        });
    };
    return Guid;
}());
export { Guid };
/* tslint:enable */ 
