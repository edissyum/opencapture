/**
 * `PdfString` class is used to perform string related primitive operations.
 * @private
 */
export var InternalEnum;
(function (InternalEnum) {
    //Internals
    /**
     * public Enum for `ForceEncoding`.
     * @private
     */
    var ForceEncoding;
    (function (ForceEncoding) {
        /**
         * Specifies the type of `None`.
         * @private
         */
        ForceEncoding[ForceEncoding["None"] = 0] = "None";
        /**
         * Specifies the type of `Ascii`.
         * @private
         */
        ForceEncoding[ForceEncoding["Ascii"] = 1] = "Ascii";
        /**
         * Specifies the type of `Unicode`.
         * @private
         */
        ForceEncoding[ForceEncoding["Unicode"] = 2] = "Unicode";
    })(ForceEncoding = InternalEnum.ForceEncoding || (InternalEnum.ForceEncoding = {}));
    /**
     * public Enum for `SourceType`.
     * @private
     */
    var SourceType;
    (function (SourceType) {
        /**
         * Specifies the type of `StringValue`.
         * @private
         */
        SourceType[SourceType["StringValue"] = 0] = "StringValue";
        /**
         * Specifies the type of `ByteBuffer`.
         * @private
         */
        SourceType[SourceType["ByteBuffer"] = 1] = "ByteBuffer";
    })(SourceType || (SourceType = {}));
})(InternalEnum || (InternalEnum = {}));
var PdfString = /** @class */ (function () {
    function PdfString(value) {
        /**
         * Value indicating whether the string was converted to hex.
         * @default false
         * @private
         */
        this.bHex = false;
        /**
         * Internal variable to store the `position`.
         * @default -1
         * @private
         */
        this.position1 = -1;
        /**
         * Internal variable to hold `cloned object`.
         * @default null
         * @private
         */
        this.clonedObject1 = null;
        /**
         * `Shows` if the data of the stream was decrypted.
         * @default false
         * @private
         */
        this.bDecrypted = false;
        /**
         * Shows if the data of the stream `was decrypted`.
         * @default false
         * @private
         */
        this.isParentDecrypted = false;
        /**
         * Gets a value indicating whether the object is `packed or not`.
         * @default false
         * @private
         */
        this.isPacked = false;
        /**
         * @hidden
         * @private
         */
        this.isFormField = false;
        /**
         * @hidden
         * @private
         */
        this.isColorSpace = false;
        /**
         * @hidden
         * @private
         */
        this.isHexString = true;
        if (typeof value === 'undefined') {
            this.bHex = false;
        }
        else {
            if (!(value.length > 0 && value[0] === '0xfeff')) {
                this.stringValue = value;
                this.data = [];
                for (var i = 0; i < value.length; ++i) {
                    this.data.push(value.charCodeAt(i));
                }
            }
        }
    }
    Object.defineProperty(PdfString.prototype, "hex", {
        //Property
        /**
         * Gets a value indicating whether string is in `hex`.
         * @private
         */
        get: function () {
            return this.bHex;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PdfString.prototype, "value", {
        /**
         * Gets or sets string `value` of the object.
         * @private
         */
        get: function () {
            return this.stringValue;
        },
        set: function (value) {
            this.stringValue = value;
            this.data = null;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PdfString.prototype, "status", {
        /**
         * Gets or sets the `Status` of the specified object.
         * @private
         */
        get: function () {
            return this.status1;
        },
        set: function (value) {
            this.status1 = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PdfString.prototype, "isSaving", {
        /**
         * Gets or sets a value indicating whether this document `is saving` or not.
         * @private
         */
        get: function () {
            return this.isSaving1;
        },
        set: function (value) {
            this.isSaving1 = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PdfString.prototype, "objectCollectionIndex", {
        /**
         * Gets or sets the `index` value of the specified object.
         * @private
         */
        get: function () {
            return this.index1;
        },
        set: function (value) {
            this.index1 = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PdfString.prototype, "clonedObject", {
        /**
         * Returns `cloned object`.
         * @private
         */
        get: function () {
            return this.clonedObject1;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PdfString.prototype, "position", {
        /**
         * Gets or sets the `position` of the object.
         * @private
         */
        get: function () {
            return this.position1;
        },
        set: function (value) {
            this.position1 = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PdfString.prototype, "CrossTable", {
        /**
         * Returns `PdfCrossTable` associated with the object.
         * @private
         */
        get: function () {
            return this.crossTable;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PdfString.prototype, "converted", {
        /**
         * Gets a value indicating whether to check if the value has unicode characters.
         * @private
         */
        get: function () {
            return this.bConverted;
        },
        /**
         * sets a value indicating whether to check if the value has unicode characters.
         * @private
         */
        set: function (value) {
            this.bConverted = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PdfString.prototype, "encode", {
        /**
         * Gets value indicating whether we should convert data to Unicode.
         */
        get: function () {
            return this.bForceEncoding;
        },
        set: function (value) {
            this.bForceEncoding = value;
        },
        enumerable: true,
        configurable: true
    });
    //Methods
    /**
     * Converts `bytes to string using hex format` for representing string.
     * @private
     */
    PdfString.bytesToHex = function (bytes) {
        if (bytes == null) {
            return '';
        }
        var builder = '';
        return builder;
    };
    /**
     * `Saves` the object using the specified writer.
     * @private
     */
    PdfString.prototype.save = function (writer) {
        if (writer === null) {
            throw new Error('ArgumentNullException : writer');
        }
        if (this.encode !== undefined && this.encode === InternalEnum.ForceEncoding.Ascii) {
            writer.write(this.pdfEncode());
        }
        else {
            writer.write(PdfString.stringMark[0] + this.value + PdfString.stringMark[1]);
        }
    };
    PdfString.prototype.pdfEncode = function () {
        var result = '';
        if (this.encode !== undefined && this.encode === InternalEnum.ForceEncoding.Ascii) {
            var data = this.escapeSymbols(this.value);
            for (var i = 0; i < data.length; i++) {
                result += String.fromCharCode(data[i]);
            }
            result = PdfString.stringMark[0] + result + PdfString.stringMark[1];
        }
        else {
            result = this.value;
        }
        return result;
    };
    PdfString.prototype.escapeSymbols = function (value) {
        var data = [];
        for (var i = 0; i < value.length; i++) {
            var currentData = value.charCodeAt(i);
            switch (currentData) {
                case 40:
                case 41:
                    data.push(92);
                    data.push(currentData);
                    break;
                case 13:
                    data.push(92);
                    data.push(114);
                    break;
                case 92:
                    data.push(92);
                    data.push(currentData);
                    break;
                default:
                    data.push(currentData);
                    break;
            }
        }
        return data;
    };
    /**
     * Creates a `copy of PdfString`.
     * @private
     */
    PdfString.prototype.clone = function (crossTable) {
        if (this.clonedObject1 !== null && this.clonedObject1.CrossTable === crossTable) {
            return this.clonedObject1;
        }
        else {
            this.clonedObject1 = null;
        }
        var newString = new PdfString(this.stringValue);
        newString.bHex = this.bHex;
        newString.crossTable = crossTable;
        newString.isColorSpace = this.isColorSpace;
        this.clonedObject1 = newString;
        return newString;
    };
    /**
     * Converts string to array of unicode symbols.
     */
    PdfString.toUnicodeArray = function (value, bAddPrefix) {
        if (value == null) {
            throw new Error('Argument Null Exception : value');
        }
        var startIndex = 0;
        var output = [];
        for (var i = 0; i < value.length; i++) {
            var code = value.charCodeAt(i);
            output.push(code / 256 >>> 0);
            output.push(code & 0xff);
        }
        return output;
    };
    /**
     * Converts byte data to string.
     */
    PdfString.byteToString = function (data) {
        if (data == null) {
            throw new Error('Argument Null Exception : stream');
        }
        var result = '';
        for (var i = 0; i < data.length; ++i) {
            result += String.fromCharCode(data[i]);
        }
        return result;
    };
    //constants = ;
    /**
     * `General markers` for string.
     * @private
     */
    PdfString.stringMark = '()';
    /**
     * `Hex markers` for string.
     * @private
     */
    PdfString.hexStringMark = '<>';
    /**
     * Format of password data.
     * @private
     */
    PdfString.hexFormatPattern = '{0:X2}';
    return PdfString;
}());
export { PdfString };
