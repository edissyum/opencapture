/**
 * PdfMainObjectCollection.ts class for EJ2-PDF
 */
import { Dictionary } from './../collections/dictionary';
import { ObjectStatus } from './enum';
/**
 * The collection of all `objects` within a PDF document.
 * @private
 */
var PdfMainObjectCollection = /** @class */ (function () {
    function PdfMainObjectCollection() {
        //Fields
        /**
         * The collection of the `indirect objects`.
         * @default []
         * @private
         */
        this.objectCollections = [];
        /**
         * The collection of the `Indirect objects`.
         * @default new Dictionary<number, ObjectInfo>()
         * @private
         */
        this.mainObjectCollection = new Dictionary();
        /**
         * The collection of `primitive objects`.
         * @private
         */
        this.primitiveObjectCollection = new Dictionary();
    }
    Object.defineProperty(PdfMainObjectCollection.prototype, "count", {
        //Properties
        /**
         * Gets the `count`.
         * @private
         */
        get: function () {
            return this.objectCollections.length;
        },
        enumerable: true,
        configurable: true
    });
    /**
     * Gets the value of `ObjectInfo` from object collection.
     * @private
     */
    PdfMainObjectCollection.prototype.items = function (index) {
        return this.objectCollections[index];
    };
    Object.defineProperty(PdfMainObjectCollection.prototype, "outIsNew", {
        //Methods
        /**
         * Specifies the value of `IsNew`.
         * @private
         */
        get: function () {
            return this.isNew;
        },
        enumerable: true,
        configurable: true
    });
    /**
     * `Adds` the specified element.
     * @private
     */
    PdfMainObjectCollection.prototype.add = function (element) {
        var objInfo = new ObjectInfo(element);
        this.objectCollections.push(objInfo);
        if (!this.primitiveObjectCollection.containsKey(element)) {
            this.primitiveObjectCollection.setValue(element, this.objectCollections.length - 1);
        }
        element.position = this.index = this.objectCollections.length - 1;
        element.status = ObjectStatus.Registered;
    };
    /**
     * `Looks` through the collection for the object specified.
     * @private
     */
    PdfMainObjectCollection.prototype.lookFor = function (obj) {
        var index = -1;
        if (obj.position !== -1) {
            return obj.position;
        }
        if (this.primitiveObjectCollection.containsKey(obj) && this.count === this.primitiveObjectCollection.size()) {
            index = this.primitiveObjectCollection.getValue(obj);
        }
        else {
            for (var i = this.count - 1; i >= 0; i--) {
                var oi = this.objectCollections[i];
                if (oi.object === obj) {
                    index = i;
                    break;
                }
            }
        }
        return index;
    };
    /**
     * Gets the `reference of the object`.
     * @private
     */
    PdfMainObjectCollection.prototype.getReference = function (index, isNew) {
        this.index = this.lookFor(index);
        var reference;
        this.isNew = false;
        var oi = this.objectCollections[this.index];
        reference = oi.reference;
        var obj = { reference: reference, wasNew: isNew };
        return obj;
    };
    /**
     * Tries to set the `reference to the object`.
     * @private
     */
    PdfMainObjectCollection.prototype.trySetReference = function (obj, reference, found) {
        var result = true;
        found = true;
        this.index = this.lookFor(obj);
        var oi = this.objectCollections[this.index];
        oi.setReference(reference);
        return result;
    };
    PdfMainObjectCollection.prototype.destroy = function () {
        for (var _i = 0, _a = this.objectCollections; _i < _a.length; _i++) {
            var obj = _a[_i];
            if (obj !== undefined) {
                obj.pdfObject.position = -1;
                obj.pdfObject.isSaving = undefined;
                obj.pdfObject.objectCollectionIndex = undefined;
                obj.pdfObject.position = undefined;
            }
        }
        this.objectCollections = [];
        this.mainObjectCollection = new Dictionary();
        this.primitiveObjectCollection = new Dictionary();
    };
    return PdfMainObjectCollection;
}());
export { PdfMainObjectCollection };
var ObjectInfo = /** @class */ (function () {
    function ObjectInfo(obj, reference) {
        this.pdfObject = obj;
        this.pdfReference = reference;
    }
    Object.defineProperty(ObjectInfo.prototype, "object", {
        //Properties
        /**
         * Gets the `object`.
         * @private
         */
        get: function () {
            return this.pdfObject;
        },
        set: function (value) {
            this.pdfObject = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ObjectInfo.prototype, "reference", {
        /**
         * Gets the `reference`.
         * @private
         */
        get: function () {
            return this.pdfReference;
        },
        enumerable: true,
        configurable: true
    });
    /**
     * Sets the `reference`.
     * @private
     */
    ObjectInfo.prototype.setReference = function (reference) {
        this.pdfReference = reference;
    };
    return ObjectInfo;
}());
export { ObjectInfo };
