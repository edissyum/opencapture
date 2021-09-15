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
import { PdfDictionary } from './pdf-dictionary';
import { PdfNumber } from './pdf-number';
import { Operators } from './../input-output/pdf-operators';
import { PdfName } from './pdf-name';
import { PdfArray } from './pdf-array';
import { PdfReferenceHolder } from './pdf-reference';
import { CompressedStreamWriter } from '@syncfusion/ej2-compression';
/**
 * `PdfStream` class is used to perform stream related primitive operations.
 * @private
 */
var PdfStream = /** @class */ (function (_super) {
    __extends(PdfStream, _super);
    function PdfStream(dictionary, data) {
        var _this = _super.call(this, dictionary) || this;
        //Constants
        /**
         * @hidden
         * @private
         */
        _this.dicPrefix = 'stream';
        /**
         * @hidden
         * @private
         */
        _this.dicSuffix = 'endstream';
        /**
         * Internal variable to hold `cloned object`.
         * @private
         */
        _this.clonedObject2 = null;
        /**
         * @hidden
         * @private
         */
        _this.bCompress = true;
        /**
         * @hidden
         * @private
         */
        _this.isImageStream = false;
        /**
         * @hidden
         * @private
         */
        _this.isFontStream = false;
        if (typeof dictionary !== 'undefined' || typeof data !== 'undefined') {
            _this.dataStream2 = [];
            _this.dataStream2 = data;
            _this.bCompress2 = false;
        }
        else {
            _this.dataStream2 = [];
            _this.bCompress2 = true;
            //Pending
        }
        return _this;
    }
    Object.defineProperty(PdfStream.prototype, "internalStream", {
        /**
         * Gets the `internal` stream.
         * @private
         */
        get: function () {
            return this.dataStream2;
        },
        set: function (value) {
            this.dataStream2 = [];
            this.dataStream2 = value;
            this.modify();
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PdfStream.prototype, "isImage", {
        /**
         * Gets or sets 'is image' flag.
         * @private
         */
        get: function () {
            return this.isImageStream;
        },
        set: function (value) {
            this.isImageStream = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PdfStream.prototype, "isFont", {
        /**
         * Gets or sets 'is font' flag.
         * @private
         */
        get: function () {
            return this.isFontStream;
        },
        set: function (value) {
            this.isFontStream = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PdfStream.prototype, "compress", {
        /**
         * Gets or sets `compression` flag.
         * @private
         */
        get: function () {
            return this.bCompress;
        },
        set: function (value) {
            this.bCompress = value;
            this.modify();
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PdfStream.prototype, "data", {
        /**
         * Gets or sets the `data`.
         * @private
         */
        get: function () {
            return this.dataStream2;
        },
        set: function (value) {
            this.dataStream2 = [];
            this.dataStream2 = value;
            this.modify();
        },
        enumerable: true,
        configurable: true
    });
    /**
     * `Clear` the internal stream.
     * @private
     */
    PdfStream.prototype.clearStream = function () {
        this.internalStream = [];
        if (this.items.containsKey(this.dictionaryProperties.filter)) {
            this.remove(this.dictionaryProperties.filter);
        }
        this.bCompress = true;
        this.modify();
    };
    /**
     * `Writes` the specified string.
     * @private
     */
    PdfStream.prototype.write = function (text) {
        if (text == null) {
            throw new Error('ArgumentNullException:text');
        }
        if (text.length <= 0) {
            throw new Error('ArgumentException: Can not write an empty string, text');
        }
        this.dataStream2.push(text);
        this.modify();
    };
    /**
     * `Writes` the specified bytes.
     * @private
     */
    PdfStream.prototype.writeBytes = function (data) {
        if (data === null) {
            throw new Error('ArgumentNullException:data');
        }
        if (data.length <= 0) {
            throw new Error('ArgumentException: Can not write an empty bytes, data');
        }
        var text = '';
        for (var i = 0; i < data.length; i++) {
            text += String.fromCharCode(data[i]);
        }
        this.dataStream2.push(text);
        this.modify();
    };
    /**
     * Raises event `Cmap BeginSave`.
     * @private
     */
    PdfStream.prototype.onCmapBeginSave = function () {
        this.cmapBeginSave.sender.cmapBeginSave();
    };
    /**
     * Raises event `Font Program BeginSave`.
     * @private
     */
    PdfStream.prototype.onFontProgramBeginSave = function () {
        this.fontProgramBeginSave.sender.fontProgramBeginSave();
    };
    /**
     * `Compresses the content` if it's required.
     * @private
     */
    PdfStream.prototype.compressContent = function (data, writer) {
        if (this.bCompress) {
            var byteArray = [];
            for (var i = 0; i < data.length; i++) {
                byteArray.push(data.charCodeAt(i));
            }
            var dataArray = new Uint8Array(byteArray);
            var sw = new CompressedStreamWriter();
            // data = 'Hello World!!!';
            sw.write(dataArray, 0, dataArray.length);
            sw.close();
            data = sw.getCompressedString;
            this.addFilter(this.dictionaryProperties.flatedecode);
        }
        return data;
    };
    /**
     * `Adds a filter` to the filter array.
     * @private
     */
    PdfStream.prototype.addFilter = function (filterName) {
        var obj = this.items.getValue(this.dictionaryProperties.filter);
        if (obj instanceof PdfReferenceHolder) {
            var rh = obj;
            obj = rh.object;
        }
        var array = obj;
        var name = obj;
        if (name != null) {
            array = new PdfArray();
            array.insert(0, name);
            this.items.setValue(this.dictionaryProperties.filter, array);
        }
        name = new PdfName(filterName);
        if (array == null) {
            this.items.setValue(this.dictionaryProperties.filter, name);
        }
        else {
            array.insert(0, name);
        }
    };
    /**
     * `Saves` the object using the specified writer.
     * @private
     */
    PdfStream.prototype.save = function (writer) {
        if (typeof this.cmapBeginSave !== 'undefined') {
            this.onCmapBeginSave();
        }
        if (typeof this.fontProgramBeginSave !== 'undefined') {
            this.onFontProgramBeginSave();
        }
        var data = '';
        for (var i = 0; i < this.data.length; i++) {
            data = data + this.data[i];
        }
        if (data.length > 1 && !this.isImage && !this.isFont) {
            data = 'q\r\n' + data + 'Q\r\n';
        }
        data = this.compressContent(data, writer);
        var length = data.length;
        this.items.setValue(this.dictionaryProperties.length, new PdfNumber(length));
        _super.prototype.save.call(this, writer, false);
        writer.write(this.dicPrefix);
        writer.write(Operators.newLine);
        if (data.length > 0) {
            writer.write(data);
        }
        writer.write(Operators.newLine);
        writer.write(this.dicSuffix);
        writer.write(Operators.newLine);
    };
    /**
     * Converts `bytes to string`.
     * @private
     */
    PdfStream.bytesToString = function (byteArray) {
        var output = '';
        for (var i = 0; i < byteArray.length; i++) {
            output = output + String.fromCharCode(byteArray[i]);
        }
        return output;
    };
    return PdfStream;
}(PdfDictionary));
export { PdfStream };
var SaveCmapEventHandler = /** @class */ (function () {
    /**
     * New instance for `save section collection event handler` class.
     * @private
     */
    function SaveCmapEventHandler(sender) {
        this.sender = sender;
    }
    return SaveCmapEventHandler;
}());
export { SaveCmapEventHandler };
var SaveFontProgramEventHandler = /** @class */ (function () {
    /**
     * New instance for `save section collection event handler` class.
     * @private
     */
    function SaveFontProgramEventHandler(sender) {
        this.sender = sender;
    }
    return SaveFontProgramEventHandler;
}());
export { SaveFontProgramEventHandler };
