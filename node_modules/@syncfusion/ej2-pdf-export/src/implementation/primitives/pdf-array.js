import { PdfNumber } from './pdf-number';
import { Operators } from './../input-output/pdf-operators';
/**
 * `PdfArray` class is used to perform array related primitive operations.
 * @private
 */
var PdfArray = /** @class */ (function () {
    function PdfArray(array) {
        //Fields
        /**
         * `startMark` - '['
         * @private
         */
        this.startMark = '[';
        /**
         * `endMark` - ']'.
         * @private
         */
        this.endMark = ']';
        /**
         * Internal variable to store the `position`.
         * @default -1
         * @private
         */
        this.position9 = -1;
        /**
         * Internal variable to hold `cloned object`.
         * @default null
         * @private
         */
        this.clonedObject9 = null;
        /**
         * Represents the Font dictionary.
         * @hidden
         * @private
         */
        this.isFont = false;
        if (typeof array === 'undefined') {
            this.internalElements = [];
        }
        else {
            if (typeof array !== 'undefined' && !(array instanceof PdfArray)) {
                var tempNumberArray = array;
                for (var index = 0; index < tempNumberArray.length; index++) {
                    var pdfNumber = new PdfNumber(tempNumberArray[index]);
                    this.add(pdfNumber);
                }
                // } else if (typeof array !== 'undefined' && (array instanceof PdfArray)) {
            }
            else {
                var tempArray = array;
                // if (tempArray.Elements.length > 0) {
                this.internalElements = [];
                for (var index = 0; index < tempArray.elements.length; index++) {
                    this.internalElements.push(tempArray.elements[index]);
                }
                // }
            }
        }
    }
    //property
    /**
     * Gets the `IPdfSavable` at the specified index.
     * @private
     */
    PdfArray.prototype.items = function (index) {
        // if (index < 0 || index >= this.Count) {
        //     throw new Error('ArgumentOutOfRangeException : index, The index can"t be less then zero or greater then Count.');
        // }
        return this.internalElements[index];
    };
    Object.defineProperty(PdfArray.prototype, "count", {
        /**
         * Gets the `count`.
         * @private
         */
        get: function () {
            return this.internalElements.length;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PdfArray.prototype, "status", {
        /**
         * Gets or sets the `Status` of the specified object.
         * @private
         */
        get: function () {
            return this.status9;
        },
        set: function (value) {
            this.status9 = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PdfArray.prototype, "isSaving", {
        /**
         * Gets or sets a value indicating whether this document `is saving` or not.
         * @private
         */
        get: function () {
            return this.isSaving9;
        },
        set: function (value) {
            this.isSaving9 = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PdfArray.prototype, "clonedObject", {
        /**
         * Returns `cloned object`.
         * @private
         */
        get: function () {
            return this.clonedObject9;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PdfArray.prototype, "position", {
        /**
         * Gets or sets the `position` of the object.
         * @private
         */
        get: function () {
            return this.position9;
        },
        set: function (value) {
            this.position9 = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PdfArray.prototype, "objectCollectionIndex", {
        /**
         * Gets or sets the `index` value of the specified object.
         * @private
         */
        get: function () {
            return this.index9;
        },
        set: function (value) {
            this.index9 = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PdfArray.prototype, "CrossTable", {
        /**
         * Returns `PdfCrossTable` associated with the object.
         * @private
         */
        get: function () {
            return this.pdfCrossTable;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PdfArray.prototype, "elements", {
        /**
         * Gets the `elements` of the Pdf Array.
         * @private
         */
        get: function () {
            return this.internalElements;
        },
        enumerable: true,
        configurable: true
    });
    /**
     * `Adds` the specified element to the PDF array.
     * @private
     */
    PdfArray.prototype.add = function (element) {
        // if (element === null) {
        //     throw new Error('ArgumentNullException : obj');
        // }
        if (typeof this.internalElements === 'undefined') {
            this.internalElements = [];
        }
        this.internalElements.push(element);
        this.markedChange();
    };
    /**
     * `Marks` the object changed.
     * @private
     */
    PdfArray.prototype.markedChange = function () {
        this.bChanged = true;
    };
    /**
     * `Determines` whether the specified element is within the array.
     * @private
     */
    PdfArray.prototype.contains = function (element) {
        var returnValue = false;
        for (var index = 0; index < this.internalElements.length; index++) {
            var tempElement = this.internalElements[index];
            var inputElement = element;
            if (tempElement != null && typeof tempElement !== 'undefined' && inputElement != null && typeof inputElement !== 'undefined') {
                if (tempElement.value === inputElement.value) {
                    return true;
                }
            }
            // if (this.internalElements[index] === element) {
            //     returnValue = true;
            // }
        }
        return returnValue;
    };
    /**
     * Returns the `primitive object` of input index.
     * @private
     */
    PdfArray.prototype.getItems = function (index) {
        // if (index < 0 || index >= this.Count) {
        //     throw new Error('ArgumentOutOfRangeException : index , The index can"t be less then zero or greater then Count.');
        // }
        return this.internalElements[index];
    };
    /**
     * `Saves` the object using the specified writer.
     * @private
     */
    PdfArray.prototype.save = function (writer) {
        // if (writer === null) {
        //     throw new Error('ArgumentNullException : writer');
        // }
        writer.write(this.startMark);
        for (var i = 0, len = this.count; i < len; i++) {
            this.getItems(i).save(writer);
            if (i + 1 !== len) {
                writer.write(Operators.whiteSpace);
            }
        }
        writer.write(this.endMark);
    };
    /**
     * Creates a `copy of PdfArray`.
     * @private
     */
    PdfArray.prototype.clone = function (crossTable) {
        // if (this.clonedObject9 !== null && this.clonedObject9.CrossTable === crossTable) {
        //     return this.clonedObject9;
        // } else {
        this.clonedObject9 = null;
        // Else clone the object.
        var newArray = new PdfArray();
        for (var index = 0; index < this.internalElements.length; index++) {
            var obj = this.internalElements[index];
            newArray.add(obj.clone(crossTable));
        }
        newArray.pdfCrossTable = crossTable;
        this.clonedObject9 = newArray;
        return newArray;
    };
    /**
     * Creates filled PDF array `from the rectangle`.
     * @private
     */
    PdfArray.fromRectangle = function (bounds) {
        var values = [bounds.x, bounds.y, bounds.width, bounds.height];
        var array = new PdfArray(values);
        return array;
    };
    // /**
    //  * Creates the rectangle from filled PDF array.
    //  * @private
    //  */
    // public ToRectangle() : RectangleF {
    //     if (this.Count < 4) {
    //         throw Error('InvalidOperationException-Can not convert to rectangle.');
    //     }
    //     let x1 : number;
    //     let x2 : number;
    //     let y1 : number;
    //     let y2 : number;
    //     let num : PdfNumber = this.getItems(0) as PdfNumber;
    //     x1 = num.IntValue;
    //     num = this.getItems(1) as PdfNumber;
    //     y1 = num.IntValue;
    //     num = this.getItems(2) as PdfNumber;
    //     x2 = num.IntValue;
    //     num = this.getItems(3) as PdfNumber;
    //     y2 = num.IntValue;
    //     let x : number = Math.min(x1, x2);
    //     let y : number = Math.min(y1, y2);
    //     let width : number = Math.abs(x1 - x2);
    //     let height : number = Math.abs(y1 - y2);
    //     let rect : RectangleF = new RectangleF(new PointF(x, y), new SizeF(width, height));
    //     return rect;
    // }
    /**
     * `Inserts` the element into the array.
     * @private
     */
    PdfArray.prototype.insert = function (index, element) {
        if (index < this.internalElements.length && index > 0) {
            var tempElements = [];
            for (var i = 0; i < index; i++) {
                tempElements.push(this.internalElements[i]);
            }
            tempElements.push(element);
            for (var i = index; i < this.internalElements.length; i++) {
                tempElements.push(this.internalElements[i]);
            }
            this.internalElements = tempElements;
        }
        else {
            this.internalElements.push(element);
        }
        this.markChanged();
    };
    /**
     * `Checks whether array contains the element`.
     * @private
     */
    PdfArray.prototype.indexOf = function (element) {
        return this.internalElements.indexOf(element);
    };
    /**
     * `Removes` element from the array.
     * @private
     */
    PdfArray.prototype.remove = function (element) {
        // if (element === null) {
        //     throw new Error('ArgumentNullException : element');
        // }
        var index = this.internalElements.indexOf(element);
        // if (index >= 0 && index < this.internalElements.length) {
        this.internalElements[index] = null;
        // }
        this.markChanged();
    };
    /**
     * `Remove` the element from the array by its index.
     * @private
     */
    PdfArray.prototype.removeAt = function (index) {
        // this.internalElements.RemoveAt(index);
        if (this.internalElements.length > index) {
            var tempArray = [];
            for (var i = 0; i < index; i++) {
                tempArray.push(this.internalElements[i]);
            }
            for (var i = index + 1; i < this.internalElements.length; i++) {
                tempArray.push(this.internalElements[i]);
            }
            this.internalElements = tempArray;
        }
        this.markChanged();
    };
    /**
     * `Clear` the array.
     * @private
     */
    PdfArray.prototype.clear = function () {
        this.internalElements = [];
        this.markChanged();
    };
    /**
     * `Marks` the object changed.
     * @private
     */
    PdfArray.prototype.markChanged = function () {
        this.bChanged = true;
    };
    return PdfArray;
}());
export { PdfArray };
