/**
 * `PdfName` class is used to perform name (element names) related primitive operations.
 * @private
 */
var PdfName = /** @class */ (function () {
    function PdfName(value) {
        /**
         * `Start symbol` of the name object.
         * @default /
         * @private
         */
        this.stringStartMark = '/';
        /**
         * `Value` of the element.
         * @private
         */
        this.internalValue = '';
        /**
         * Indicates if the object is currently in `saving state or not`.
         * @default false
         * @private
         */
        this.isSaving6 = false;
        /**
         * Internal variable to store the `position`.
         * @default -1
         * @private
         */
        this.position6 = -1;
        this.internalValue = this.normalizeValue(value);
    }
    Object.defineProperty(PdfName.prototype, "status", {
        //property
        /**
         * Gets or sets the `Status` of the specified object.
         * @private
         */
        get: function () {
            return this.status6;
        },
        set: function (value) {
            this.status6 = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PdfName.prototype, "isSaving", {
        /**
         * Gets or sets a value indicating whether this document `is saving` or not.
         * @private
         */
        get: function () {
            return this.isSaving6;
        },
        set: function (value) {
            this.isSaving6 = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PdfName.prototype, "objectCollectionIndex", {
        /**
         * Gets or sets the `index` value of the specified object.
         * @private
         */
        get: function () {
            return this.index6;
        },
        set: function (value) {
            this.index6 = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PdfName.prototype, "position", {
        /**
         * Gets or sets the `position` of the object.
         * @private
         */
        get: function () {
            return this.position6;
        },
        set: function (value) {
            this.position6 = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PdfName.prototype, "clonedObject", {
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
    Object.defineProperty(PdfName.prototype, "value", {
        /**
         * Gets or sets the `value` of the object.
         * @private
         */
        get: function () {
            return this.internalValue;
        },
        set: function (value) {
            // if (value !== this.value) {
            var val = value;
            if (value !== null && value.length > 0) {
                // val = (value.substring(0, 1) === this.stringStartMark) ? value.substring(1) : value;
                val = value;
                this.internalValue = this.normalizeValue(val);
            }
            else {
                this.internalValue = val;
            }
            // }
        },
        enumerable: true,
        configurable: true
    });
    //public methods
    /**
     * `Saves` the name using the specified writer.
     * @private
     */
    PdfName.prototype.save = function (writer) {
        // if (writer === null) {
        //     throw new Error('ArgumentNullException : writer');
        // }
        writer.write(this.toString());
    };
    /**
     * Gets `string` representation of the primitive.
     * @private
     */
    PdfName.prototype.toString = function () {
        return (this.stringStartMark + this.escapeString(this.value));
    };
    /**
     * Creates a `copy of PdfName`.
     * @private
     */
    PdfName.prototype.clone = function (crossTable) {
        var newName = new PdfName();
        newName.value = this.internalValue;
        return newName;
    };
    /**
     * Replace some characters with its `escape sequences`.
     * @private
     */
    PdfName.prototype.escapeString = function (stringValue) {
        // if (str === null) {
        //     throw new Error('ArgumentNullException : str');
        // }
        // if (str === '') {
        //     return str;
        // }
        var result = '';
        var len = 0;
        for (var i = 0, len_1 = stringValue.length; i < len_1; i++) {
            var ch = stringValue[i];
            var index = PdfName.delimiters.indexOf(ch);
            // switch (ch) {
            //     case '\r' :
            //         result = result + '\\r';
            //         break;
            //     case '\n' :
            //         result = result + '\n';
            //         break;
            //     case '(' :
            //     case ')' :
            //     case '\\' :
            //         //result.Append( '\\' ).Append( ch );
            //         result = result + ch;
            //         break;
            //     default :
            //         result = result + ch;
            //         break;
            // }
            result = result + ch;
        }
        return result;
    };
    //methiods
    /**
     * Replace a symbol with its code with the precedence of the `sharp sign`.
     * @private
     */
    PdfName.prototype.normalizeValue = function (value, c) {
        // if (typeof c === undefined) {
        //     let str : string = value;
        //     for (let i : number = 0; i < PdfName.replacements.length; i++) {
        //         str = this.normalizeValue(str, c);
        //     }
        //     return str;
        // } else {
        var strFormat = '#{0:X}';
        //return value.replace(c.toString(),String.format(strFormat,c));
        return value;
        // }
    };
    /**
     * PDF `special characters`.
     * @private
     */
    PdfName.delimiters = '()<>[]{}/%}';
    /**
     * The symbols that are not allowed in PDF names and `should be replaced`.
     * @private
     */
    PdfName.replacements = [' ', '\t', '\n', '\r'];
    return PdfName;
}());
export { PdfName };
