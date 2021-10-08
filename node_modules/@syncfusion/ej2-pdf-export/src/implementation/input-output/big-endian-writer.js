/**
 * Writes data in BigEndian order.
 */
var BigEndianWriter = /** @class */ (function () {
    //Constructors
    /**
     * Creates a new writer.
     */
    function BigEndianWriter(capacity) {
        //Constants
        /**
         * Size of Int32 type.
         */
        this.int32Size = 4;
        /**
         * Size of Int16 type.
         */
        this.int16Size = 2;
        /**
         * Size of long type.
         */
        this.int64Size = 8;
        this.bufferLength = capacity;
        this.buffer = [];
    }
    Object.defineProperty(BigEndianWriter.prototype, "data", {
        //Properties
        /**
         * Gets data written to the writer.
         */
        get: function () {
            if (this.buffer.length < this.bufferLength) {
                var length_1 = this.bufferLength - this.buffer.length;
                for (var i = 0; i < length_1; i++) {
                    this.buffer.push(0);
                }
            }
            return this.buffer;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(BigEndianWriter.prototype, "position", {
        /// <summary>
        /// Gets position of the internal buffer.
        /// </summary>
        get: function () {
            if (this.internalPosition === undefined || this.internalPosition === null) {
                this.internalPosition = 0;
            }
            return this.internalPosition;
        },
        enumerable: true,
        configurable: true
    });
    /**
     * Writes short value.
     */
    BigEndianWriter.prototype.writeShort = function (value) {
        var bytes = [((value & 0x0000ff00) >> 8), value & 0x000000ff];
        this.flush(bytes);
    };
    /**
     * Writes int value.
     */
    BigEndianWriter.prototype.writeInt = function (value) {
        var i1 = (value & 0xff000000) >> 24;
        i1 = i1 < 0 ? 256 + i1 : i1;
        var i2 = (value & 0x00ff0000) >> 16;
        i2 = i2 < 0 ? 256 + i2 : i2;
        var i3 = (value & 0x0000ff00) >> 8;
        i3 = i3 < 0 ? 256 + i3 : i3;
        var i4 = value & 0x000000ff;
        i4 = i4 < 0 ? 256 + i4 : i4;
        var bytes = [(value & 0xff000000) >> 24, (value & 0x00ff0000) >> 16, (value & 0x0000ff00) >> 8, value & 0x000000ff];
        this.flush(bytes);
    };
    /**
     * Writes u int value.
     */
    BigEndianWriter.prototype.writeUInt = function (value) {
        var buff = [(value & 0xff000000) >> 24, (value & 0x00ff0000) >> 16, (value & 0x0000ff00) >> 8, value & 0x000000ff];
        this.flush(buff);
    };
    /**
     * Writes string value.
     */
    BigEndianWriter.prototype.writeString = function (value) {
        if (value == null) {
            throw new Error('Argument Null Exception : value');
        }
        var bytes = [];
        for (var i = 0; i < value.length; i++) {
            bytes.push(value.charCodeAt(i));
        }
        this.flush(bytes);
    };
    /**
     * Writes byte[] value.
     */
    BigEndianWriter.prototype.writeBytes = function (value) {
        this.flush(value);
    };
    // //Implementation
    BigEndianWriter.prototype.flush = function (buff) {
        if (buff === null) {
            throw new Error('Argument Null Exception : buff');
        }
        var position = this.position;
        for (var i = 0; i < buff.length; i++) {
            this.buffer[position] = buff[i];
            position++;
        }
        this.internalPosition += buff.length;
    };
    return BigEndianWriter;
}());
export { BigEndianWriter };
