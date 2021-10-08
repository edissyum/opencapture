import { DictionaryProperties } from './../input-output/pdf-dictionary-properties';
import { PdfStream } from './../primitives/pdf-stream';
import { PdfArray } from './../primitives/pdf-array';
import { PdfNumber } from './../primitives/pdf-number';
import { PdfName } from './../primitives/pdf-name';
import { PdfDictionary } from './../primitives/pdf-dictionary';
import { PdfString } from './../primitives/pdf-string';
/**
 * `PdfReference` class is used to perform reference related primitive operations.
 * @private
 */
var PdfReference = /** @class */ (function () {
    function PdfReference(objNumber, genNumber) {
        /**
         * Holds the `index` number of the object.
         * @default -1
         * @private
         */
        this.index3 = -1;
        /**
         * Internal variable to store the `position`.
         * @default -1
         * @private
         */
        this.position3 = -1;
        /**
         * Holds the `object number`.
         * @default 0
         * @private
         */
        this.objNumber = 0;
        /**
         * Holds the `generation number` of the object.
         * @default 0
         * @private
         */
        this.genNumber = 0;
        if (typeof objNumber === 'number' && typeof genNumber === 'number') {
            this.objNumber = objNumber;
            this.genNumber = genNumber;
            // } else if (typeof objNum === 'string' && typeof genNum === 'string') {
        }
        else {
            this.objNumber = Number(objNumber);
            this.genNumber = Number(genNumber);
        }
    }
    Object.defineProperty(PdfReference.prototype, "status", {
        //Property
        /**
         * Gets or sets the `Status` of the specified object.
         * @private
         */
        get: function () {
            return this.status3;
        },
        set: function (value) {
            this.status3 = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PdfReference.prototype, "isSaving", {
        /**
         * Gets or sets a value indicating whether this document `is saving` or not.
         * @private
         */
        get: function () {
            return this.isSaving3;
        },
        set: function (value) {
            this.isSaving3 = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PdfReference.prototype, "objectCollectionIndex", {
        /**
         * Gets or sets the `index` value of the specified object.
         * @private
         */
        get: function () {
            return this.index3;
        },
        set: function (value) {
            this.index3 = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PdfReference.prototype, "position", {
        /**
         * Gets or sets the `position` of the object.
         * @private
         */
        get: function () {
            return this.position3;
        },
        set: function (value) {
            this.position3 = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PdfReference.prototype, "clonedObject", {
        /**
         * Returns `cloned object`.
         * @private
         */
        get: function () {
            var returnObject3 = null;
            return returnObject3;
        },
        enumerable: true,
        configurable: true
    });
    //IPdfPrimitives methods
    /**
     * `Saves` the object.
     * @private
     */
    PdfReference.prototype.save = function (writer) {
        writer.write(this.toString());
    };
    /**
     * Returns a `string` representing the object.
     * @private
     */
    PdfReference.prototype.toString = function () {
        return this.objNumber.toString() + ' ' + this.genNumber.toString() + ' R';
    };
    /**
     * Creates a `deep copy` of the IPdfPrimitive object.
     * @private
     */
    PdfReference.prototype.clone = function (crossTable) {
        return null;
    };
    return PdfReference;
}());
export { PdfReference };
/**
 * `PdfReferenceHolder` class is used to perform reference holder related primitive operations.
 * @private
 */
var PdfReferenceHolder = /** @class */ (function () {
    function PdfReferenceHolder(obj1, obj2) {
        /**
         * Holds the `index` number of the object.
         * @default -1
         * @private
         */
        this.index4 = -1;
        /**
         * Internal variable to store the `position`.
         * @default -1
         * @private
         */
        this.position4 = -1;
        /**
         * The `index` of the object within the object collection.
         * @default -1
         * @private
         */
        this.objectIndex = -1;
        /**
         * @hidden
         * @private
         */
        this.dictionaryProperties = new DictionaryProperties();
        // if (typeof obj2 === 'undefined') {
        this.initialize(obj1);
        // }
        // else {
        //     if (obj2 === null) {
        //         throw new Error('ArgumentNullException : crossTable');
        //     }
        //     if (obj1 === null) {
        //         throw new Error('ArgumentNullException : reference');
        //     }
        //     this.crossTable = obj2;
        //     let tempObj1 : PdfReference = <PdfReference>obj1;
        //     this.reference = tempObj1;
        // }
    }
    Object.defineProperty(PdfReferenceHolder.prototype, "status", {
        //Properties
        /**
         * Gets or sets the `Status` of the specified object.
         * @private
         */
        get: function () {
            return this.status4;
        },
        set: function (value) {
            this.status4 = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PdfReferenceHolder.prototype, "isSaving", {
        /**
         * Gets or sets a value indicating whether this document `is saving` or not.
         * @private
         */
        get: function () {
            return this.isSaving4;
        },
        set: function (value) {
            this.isSaving4 = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PdfReferenceHolder.prototype, "objectCollectionIndex", {
        /**
         * Gets or sets the `index` value of the specified object.
         * @private
         */
        get: function () {
            return this.index4;
        },
        set: function (value) {
            this.index4 = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PdfReferenceHolder.prototype, "position", {
        /**
         * Gets or sets the `position` of the object.
         * @private
         */
        get: function () {
            return this.position4;
        },
        set: function (value) {
            this.position4 = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PdfReferenceHolder.prototype, "clonedObject", {
        /**
         * Returns `cloned object`.
         * @private
         */
        get: function () {
            return null;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PdfReferenceHolder.prototype, "object", {
        /**
         * Gets the `object` the reference is of.
         * @private
         */
        get: function () {
            // if ((this.reference != null) || (this.object == null)) {
            //     this.object = this.GetterObject();
            // }
            return this.primitiveObject;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PdfReferenceHolder.prototype, "reference", {
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
    Object.defineProperty(PdfReferenceHolder.prototype, "index", {
        /**
         * Gets the `index` of the object.
         * @private
         */
        get: function () {
            // let items : PdfMainObjectCollection = this.crossTable.PdfObjects;
            // this.objectIndex = items.GetObjectIndex(this.reference);
            // if (this.objectIndex < 0) {
            //     let obj : IPdfPrimitive = this.crossTable.GetObject(this.reference);
            //     this.objectIndex = items.Count - 1;
            // }
            return this.objectIndex;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PdfReferenceHolder.prototype, "element", {
        /**
         * Gets the `element`.
         * @private
         */
        get: function () {
            return this.primitiveObject;
        },
        enumerable: true,
        configurable: true
    });
    PdfReferenceHolder.prototype.initialize = function (obj1) {
        if (obj1 instanceof PdfArray
            || obj1 instanceof PdfDictionary
            || obj1 instanceof PdfName
            || obj1 instanceof PdfNumber
            || obj1 instanceof PdfStream
            || obj1 instanceof PdfReference
            || obj1 instanceof PdfString) {
            this.primitiveObject = obj1;
        }
        else {
            var tempObj = obj1;
            this.initialize(tempObj.element);
        }
    };
    /**
     * `Writes` a reference into a PDF document.
     * @private
     */
    PdfReferenceHolder.prototype.save = function (writer) {
        // if (writer == null) {
        //     throw new Error('ArgumentNullException : writer');
        // }
        var position = writer.position;
        var cTable = writer.document.crossTable;
        // if (cTable.Document instanceof PdfDocument) {
        this.object.isSaving = true;
        // }
        var reference = null;
        // if (writer.Document.FileStructure.IncrementalUpdate === true && writer.Document.isStreamCopied === true) {
        //     if (this.reference === null) {
        //         reference = cTable.GetReference(this.Object);
        //     } else {
        //         reference = this.reference;
        //     }
        // } else {
        //     reference = cTable.GetReference(this.Object);
        // }
        // if (!(writer.Document.FileStructure.IncrementalUpdate === true && writer.Document.isStreamCopied === true)) {
        reference = cTable.getReference(this.object);
        // }
        // if (writer.Position !== position) {
        //     writer.Position = position;
        // }
        reference.save(writer);
    };
    /**
     * Creates a `copy of PdfReferenceHolder`.
     * @private
     */
    PdfReferenceHolder.prototype.clone = function (crossTable) {
        var refHolder = null;
        var temp = null;
        var refNum = '';
        var reference = null;
        // Restricts addition of same object multiple time.
        /* if (this.Reference != null && this.crossTable != null && this.crossTable.PageCorrespondance.containsKey(this.Reference)) {
            refHolder = new PdfReferenceHolder(this.crossTable.PageCorrespondance.getValue(this.Reference) as PdfReference, crossTable);
            return refHolder;
        }
        if (Object instanceof PdfNumber) {
            return new PdfNumber((Object as PdfNumber).IntValue);
        }
        */
        // if (Object instanceof PdfDictionary) {
        //     // Meaning the referenced page is not available for import.
        //     let type : PdfName = new PdfName(this.dictionaryProperties.type);
        //     let dict : PdfDictionary = Object as PdfDictionary;
        //     if (dict.ContainsKey(type)) {
        //         let pageName : PdfName = dict.Items.getValue(type.Value) as PdfName;
        //         if (pageName !== null) {
        //             if (pageName.Value === 'Page') {
        //                 return new PdfNull();
        //             }
        //         }
        //     }
        // }
        /* if (Object instanceof PdfName) {
            return new PdfName ((Object as PdfName ).Value);
        }
        */
        // Resolves circular references.
        // if (crossTable.PrevReference !== null && (crossTable.PrevReference.indexOf(this.Reference) !== -1)) {
        //     let obj : IPdfPrimitive = this.crossTable.GetObject(this.Reference).ClonedObject;
        //     if (obj !== null) {
        //         reference = crossTable.GetReference(obj);
        //         return new PdfReferenceHolder(reference, crossTable);
        //     } else {
        //         return new PdfNull();
        //     }
        // }
        /*if (this.Reference !== null) {
            crossTable.PrevReference.push(this.Reference);
        }
        reference = crossTable.GetReference(temp);
        refHolder = new PdfReferenceHolder(reference, crossTable);
        return refHolder;
        */
        return null;
    };
    return PdfReferenceHolder;
}());
export { PdfReferenceHolder };
