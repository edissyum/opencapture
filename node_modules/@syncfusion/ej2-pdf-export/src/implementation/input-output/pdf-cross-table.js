import { ObjectStatus } from './../input-output/enum';
import { PdfDictionary } from './../primitives/pdf-dictionary';
import { DictionaryProperties } from './pdf-dictionary-properties';
import { Operators } from './pdf-operators';
import { Dictionary } from './../collections/dictionary';
import { PdfReference } from './../primitives/pdf-reference';
import { ObjectType } from './cross-table';
import { PdfStream } from './../primitives/pdf-stream';
import { PdfNumber } from './../primitives/pdf-number';
import { PdfCatalog } from './../document/pdf-catalog';
/**
 * `PdfCrossTable` is responsible for intermediate level parsing
 * and savingof a PDF document.
 * @private
 */
var PdfCrossTable = /** @class */ (function () {
    function PdfCrossTable() {
        /**
         * The modified `objects` that should be saved.
         * @private
         */
        this.objects = new Dictionary();
        /**
         * Holds `maximal generation number` or offset to object.
         * @default 0
         * @private
         */
        this.maxGenNumIndex = 0;
        /**
         * The `number of the objects`.
         * @default 0
         * @private
         */
        this.objectCount = 0;
        /**
         * Internal variable for accessing fields from `DictionryProperties` class.
         * @default new PdfDictionaryProperties()
         * @private
         */
        this.dictionaryProperties = new DictionaryProperties();
    }
    Object.defineProperty(PdfCrossTable.prototype, "isMerging", {
        //Properties
        /**
         * Gets or sets if the document `is merged`.
         * @private
         */
        get: function () {
            return this.merging;
        },
        set: function (value) {
            this.merging = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PdfCrossTable.prototype, "trailer", {
        /**
         * Gets the `trailer`.
         * @private
         */
        get: function () {
            if (this.internalTrailer == null) {
                this.internalTrailer = new PdfStream();
            }
            return this.internalTrailer;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PdfCrossTable.prototype, "document", {
        /**
         * Gets or sets the main `PdfDocument` class instance.
         * @private
         */
        get: function () {
            return this.pdfDocument;
        },
        set: function (value) {
            this.pdfDocument = value;
            this.items = this.pdfDocument.pdfObjects;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PdfCrossTable.prototype, "pdfObjects", {
        /**
         * Gets the catched `PDF object` main collection.
         * @private
         */
        get: function () {
            return this.items;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PdfCrossTable.prototype, "objectCollection", {
        /**
         * Gets the `object collection`.
         * @private
         */
        get: function () {
            return this.pdfDocument.pdfObjects;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PdfCrossTable.prototype, "count", {
        /**
         * Gets or sets the `number of the objects` within the document.
         * @private
         */
        get: function () {
            return this.objectCount;
        },
        set: function (value) {
            this.objectCount = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PdfCrossTable.prototype, "nextObjNumber", {
        /**
         * Returns `next available object number`.
         * @private
         */
        get: function () {
            this.count = this.count + 1;
            return this.count;
        },
        enumerable: true,
        configurable: true
    });
    PdfCrossTable.prototype.save = function (writer, filename) {
        this.saveHead(writer);
        var state = false;
        this.mappedReferences = null;
        this.objects.clear();
        this.markTrailerReferences();
        this.saveObjects(writer);
        var saveCount = this.count;
        var xrefPos = writer.position;
        this.registerObject(0, new PdfReference(0, -1), true);
        var prevXRef = 0;
        writer.write(Operators.xref);
        writer.write(Operators.newLine);
        this.saveSections(writer);
        this.saveTrailer(writer, this.count, prevXRef);
        this.saveTheEndess(writer, xrefPos);
        this.count = saveCount;
        for (var i = 0; i < this.objectCollection.count; ++i) {
            var oi = this.objectCollection.items(i);
            oi.object.isSaving = false;
        }
        if (typeof filename === 'undefined') {
            return writer.stream.buffer;
        }
        else {
            writer.stream.save(filename);
        }
    };
    /**
     * `Saves the endess` of the file.
     * @private
     */
    PdfCrossTable.prototype.saveTheEndess = function (writer, xrefPos) {
        writer.write(Operators.newLine + Operators.startxref + Operators.newLine);
        writer.write(xrefPos.toString() + Operators.newLine);
        writer.write(Operators.eof + Operators.newLine);
    };
    /**
     * `Saves the new trailer` dictionary.
     * @private
     */
    PdfCrossTable.prototype.saveTrailer = function (writer, count, prevXRef) {
        writer.write(Operators.trailer + Operators.newLine);
        // Save the dictionary.
        var trailer = this.trailer;
        trailer.items.setValue(this.dictionaryProperties.size, new PdfNumber(this.objectCount + 1));
        trailer = new PdfDictionary(trailer); // Make it real dictionary.
        trailer.setEncrypt(false);
        trailer.save(writer);
    };
    /**
     * `Saves the xref section`.
     * @private
     */
    PdfCrossTable.prototype.saveSections = function (writer) {
        var objectNum = 0;
        var count = 0;
        do {
            count = this.prepareSubsection(objectNum);
            this.saveSubsection(writer, objectNum, count);
            objectNum += count;
        } while (count !== 0);
    };
    /**
     * `Saves a subsection`.
     * @private
     */
    PdfCrossTable.prototype.saveSubsection = function (writer, objectNum, count) {
        if (count <= 0 || objectNum >= this.count) {
            return;
        }
        var subsectionHead = '{0} {1}{2}';
        writer.write(objectNum + ' ' + (count + 1) + Operators.newLine);
        for (var i = objectNum; i <= objectNum + count; ++i) {
            var obj = this.objects.getValue(i);
            var str = '';
            if (obj.type === ObjectType.Free) {
                str = this.getItem(obj.offset, 65535, true);
            }
            else {
                str = this.getItem(obj.offset, obj.generation, false);
            }
            writer.write(str);
        }
    };
    /**
     * Generates string for `xref table item`.
     * @private
     */
    PdfCrossTable.prototype.getItem = function (offset, genNumber, isFree) {
        var returnString = '';
        var addOffsetLength = 10 - offset.toString().length;
        if (genNumber <= 0) {
            genNumber = 0;
        }
        var addGenNumberLength = (5 - genNumber.toString().length) <= 0 ? 0 : (5 - genNumber.toString().length);
        for (var index = 0; index < addOffsetLength; index++) {
            returnString = returnString + '0';
        }
        returnString = returnString + offset.toString() + ' ';
        for (var index = 0; index < addGenNumberLength; index++) {
            returnString = returnString + '0';
        }
        returnString = returnString + genNumber.toString() + ' ';
        returnString = returnString + ((isFree) ? Operators.f : Operators.n) + Operators.newLine;
        return returnString;
    };
    /**
     * `Prepares a subsection` of the current section within the cross-reference table.
     * @private
     */
    PdfCrossTable.prototype.prepareSubsection = function (objectNum) {
        var count = 0;
        var i;
        var total = this.count;
        for (var k = 0; k < this.document.pdfObjects.count; k++) {
            var reference = this.document.pdfObjects.items(k).reference;
            var refString = reference.toString();
            var refArray = refString.split(' ');
        }
        if (objectNum >= total) {
            return count;
        }
        // search for first changed indirect object.
        for (i = objectNum; i < total; ++i) {
            break;
        }
        objectNum = i;
        // look up for all indirect objects in one subsection.
        for (; i < total; ++i) {
            ++count;
        }
        return count;
    };
    /**
     * `Marks the trailer references` being saved.
     * @private
     */
    PdfCrossTable.prototype.markTrailerReferences = function () {
        var tempArray;
        var keys = this.trailer.items.keys();
        var values = this.trailer.items.values();
    };
    /**
     * `Saves the head`.
     * @private
     */
    PdfCrossTable.prototype.saveHead = function (writer) {
        var version = this.generateFileVersion(writer.document);
        writer.write('%PDF-' + version);
        writer.write(Operators.newLine);
    };
    /**
     * Generates the `version` of the file.
     * @private
     */
    PdfCrossTable.prototype.generateFileVersion = function (document) {
        var iVersion = 4;
        var version = '1.' + iVersion.toString();
        return version;
    };
    PdfCrossTable.prototype.getReference = function (obj, bNew) {
        if (typeof bNew === 'undefined') {
            var wasNew = false;
            return this.getReference(obj, wasNew);
        }
        else {
            //code splitted for reducing lines of code exceeds 100.
            return this.getSubReference(obj, bNew);
        }
    };
    /**
     * Retrieves the `reference` of the object given.
     * @private
     */
    PdfCrossTable.prototype.getSubReference = function (obj, bNew) {
        var isNew = false;
        var wasNew;
        var reference = null;
        // if (obj.IsSaving) {
        if (this.items.count > 0 && obj.objectCollectionIndex > 0 && this.items.count > obj.objectCollectionIndex - 1) {
            var tempObj = this.document.pdfObjects.getReference(obj, wasNew);
            reference = tempObj.reference;
            wasNew = tempObj.wasNew;
        }
        if (reference == null) {
            if (obj.status === ObjectStatus.Registered) {
                wasNew = false;
            }
            else {
                wasNew = true;
            }
        }
        else {
            wasNew = false;
        }
        // need to add mapped reference code
        if (reference == null) {
            var objnumber = this.nextObjNumber;
            reference = new PdfReference(objnumber, 0);
            var found = void 0;
            if (wasNew) {
                this.document.pdfObjects.add(obj);
                this.document.pdfObjects.trySetReference(obj, reference, found);
                var tempIndex = this.document.pdfObjects.count - 1;
                var tempkey = this.document.pdfObjects.objectCollections[tempIndex].reference.objNumber;
                var tempvalue = this.document.pdfObjects.objectCollections[this.document.pdfObjects.count - 1];
                this.document.pdfObjects.mainObjectCollection.setValue(tempkey, tempvalue);
                obj.position = -1;
            }
            else {
                this.document.pdfObjects.trySetReference(obj, reference, found);
            }
            obj.objectCollectionIndex = reference.objNumber;
            obj.status = ObjectStatus.None;
            isNew = true;
        }
        bNew = isNew || this.bForceNew;
        return reference;
    };
    /**
     * `Saves all objects` in the collection.
     * @private
     */
    PdfCrossTable.prototype.saveObjects = function (writer) {
        var objectCollection = this.objectCollection;
        for (var i = 0; i < objectCollection.count; ++i) {
            var oi = objectCollection.items(i);
            var obj = oi.object;
            obj.isSaving = true;
            this.saveIndirectObject(obj, writer);
        }
    };
    /**
     * `Saves indirect object`.
     * @private
     */
    PdfCrossTable.prototype.saveIndirectObject = function (obj, writer) {
        var reference = this.getReference(obj);
        if (obj instanceof PdfCatalog) {
            this.trailer.items.setValue(this.dictionaryProperties.root, reference);
        }
        // NOTE :  This is needed for correct string objects encryption.
        this.pdfDocument.currentSavingObj = reference;
        var tempArchive = false;
        tempArchive = obj.getArchive();
        var allowedType = !((obj instanceof PdfStream) || !tempArchive || (obj instanceof PdfCatalog));
        var sigFlag = false;
        this.registerObject(writer.position, reference);
        this.doSaveObject(obj, reference, writer);
    };
    /**
     * Performs `real saving` of the save object.
     * @private
     */
    PdfCrossTable.prototype.doSaveObject = function (obj, reference, writer) {
        var correctPosition = writer.length;
        writer.write(reference.objNumber.toString());
        writer.write(Operators.whiteSpace);
        writer.write(reference.genNumber.toString());
        writer.write(Operators.whiteSpace);
        writer.write(Operators.obj);
        writer.write(Operators.newLine);
        obj.save(writer);
        var stream = writer.stream;
        writer.write(Operators.endObj);
        writer.write(Operators.newLine);
    };
    PdfCrossTable.prototype.registerObject = function (offset, reference, free) {
        if (typeof free === 'boolean') {
            // Register the object by its number.
            this.objects.setValue(reference.objNumber, new RegisteredObject(offset, reference, free));
            this.maxGenNumIndex = Math.max(this.maxGenNumIndex, reference.genNumber);
        }
        else if (typeof free === 'undefined') {
            // Register the object by its number.
            this.objects.setValue(reference.objNumber, new RegisteredObject(offset, reference));
            this.maxGenNumIndex = Math.max(this.maxGenNumIndex, reference.genNumber);
        }
    };
    /**
     * `Dereferences` the specified primitive object.
     * @private
     */
    PdfCrossTable.dereference = function (obj) {
        var rh = obj;
        if (rh != null) {
            obj = rh.object;
        }
        return obj;
    };
    return PdfCrossTable;
}());
export { PdfCrossTable };
var RegisteredObject = /** @class */ (function () {
    function RegisteredObject(offset, reference, free) {
        var tempOffset = offset;
        this.offsetNumber = tempOffset;
        var tempReference = reference;
        this.generation = tempReference.genNumber;
        this.object = tempReference.objNumber;
        if (typeof free === 'undefined') {
            this.type = ObjectType.Normal;
        }
        else {
            this.type = ObjectType.Free;
        }
    }
    Object.defineProperty(RegisteredObject.prototype, "objectNumber", {
        //Properties
        /**
         * Gets the `object number`.
         * @private
         */
        get: function () {
            return this.object;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(RegisteredObject.prototype, "offset", {
        /**
         * Gets the `offset`.
         * @private
         */
        get: function () {
            var result;
            result = this.offsetNumber;
            return result;
        },
        enumerable: true,
        configurable: true
    });
    return RegisteredObject;
}());
export { RegisteredObject };
