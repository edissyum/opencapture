/**
 * ByteArray class
 * Used to keep information about image stream as byte array.
 * @private
 */
var ByteArray = /** @class */ (function () {
    /**
     * Initialize the new instance for `byte-array` class
     * @hidden
     * @private
     */
    function ByteArray(length) {
        /**
         * Current stream `position`.
         * @default 0
         * @private
         */
        this.mPosition = 0;
        this.buffer = new Uint8Array(length);
        this.dataView = new DataView(this.buffer.buffer);
    }
    Object.defineProperty(ByteArray.prototype, "position", {
        /**
         * Gets and Sets a current `position` of byte array.
         * @hidden
         * @private
         */
        get: function () {
            return this.mPosition;
        },
        set: function (value) {
            this.mPosition = value;
        },
        enumerable: true,
        configurable: true
    });
    /**
     * `Read` from current stream position.
     * @default 0
     * @hidden
     * @private
     */
    ByteArray.prototype.read = function (buffer, offset, count) {
        for (var index = offset; index < count; index++) {
            var position = this.position;
            buffer.buffer[index] = this.readByte(position);
            this.position++;
        }
    };
    /**
     * @hidden
     */
    ByteArray.prototype.getBuffer = function (index) {
        return this.buffer[index];
    };
    /**
     * @hidden
     */
    ByteArray.prototype.writeFromBase64String = function (base64) {
        var arr = this.encodedString(base64);
        this.buffer = arr;
    };
    /**
     * @hidden
     */
    ByteArray.prototype.encodedString = function (input) {
        var keyStr = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
        var chr1;
        var chr2;
        var chr3;
        var enc1;
        var enc2;
        var enc3;
        var enc4;
        var i = 0;
        var resultIndex = 0;
        var dataUrlPrefix = 'data:';
        input = input.replace(/[^A-Za-z0-9\+\/\=]/g, '');
        var totalLength = input.length * 3 / 4;
        if (input.charAt(input.length - 1) === keyStr.charAt(64)) {
            totalLength--;
        }
        var output = new Uint8Array(totalLength | 0);
        while (i < input.length) {
            enc1 = keyStr.indexOf(input.charAt(i++));
            enc2 = keyStr.indexOf(input.charAt(i++));
            enc3 = keyStr.indexOf(input.charAt(i++));
            enc4 = keyStr.indexOf(input.charAt(i++));
            chr1 = (enc1 << 2) | (enc2 >> 4);
            chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
            chr3 = ((enc3 & 3) << 6) | enc4;
            output[resultIndex++] = chr1;
            output[resultIndex++] = chr2;
            output[resultIndex++] = chr3;
        }
        return output;
    };
    /**
     * @hidden
     */
    ByteArray.prototype.readByte = function (offset) {
        return (this.buffer[offset]);
    };
    Object.defineProperty(ByteArray.prototype, "internalBuffer", {
        /**
         * @hidden
         */
        get: function () {
            return this.buffer;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ByteArray.prototype, "count", {
        /**
         * @hidden
         */
        get: function () {
            return this.buffer.byteLength;
        },
        enumerable: true,
        configurable: true
    });
    /**
     * 'readNextTwoBytes' stream
     * @hidden
     * @private
     */
    ByteArray.prototype.readNextTwoBytes = function (stream) {
        var data = stream.readByte(this.position);
        this.position++;
        data <<= 8;
        data |= stream.readByte(this.position);
        this.position++;
        return data;
    };
    return ByteArray;
}());
export { ByteArray };
