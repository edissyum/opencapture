/**
 * StringTokenizer.ts class for EJ2-PDF
 * Utility class for working with strings.
 * @private
 */
var StringTokenizer = /** @class */ (function () {
    // Constructors
    /**
     * Initializes a new instance of the `StringTokenizer` class.
     * @private
     */
    function StringTokenizer(textValue) {
        /**
         * Current `position`.
         * @private
         */
        this.currentPosition = 0;
        if (textValue == null) {
            throw new Error('ArgumentNullException:text');
        }
        this.text = textValue;
    }
    Object.defineProperty(StringTokenizer.prototype, "length", {
        // Properties
        /**
         * Gets text `length`.
         * @private
         */
        get: function () {
            return this.text.length;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(StringTokenizer.prototype, "end", {
        get: function () {
            return (this.currentPosition === this.text.length);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(StringTokenizer.prototype, "position", {
        /**
         * Gets or sets the position.
         * @private
         */
        get: function () {
            return this.currentPosition;
        },
        set: function (value) {
            this.currentPosition = value;
        },
        enumerable: true,
        configurable: true
    });
    StringTokenizer.getCharsCount = function (text, symbols) {
        if (typeof symbols === 'string') {
            if (text == null) {
                throw new Error('ArgumentNullException:wholeText');
            }
            var numSymbols = 0;
            var curIndex = 0;
            for (;;) {
                curIndex = text.indexOf(symbols, curIndex);
                if (curIndex === -1) {
                    break;
                }
                else {
                    numSymbols++;
                    curIndex++;
                }
            }
            return numSymbols;
        }
        else {
            if (text == null) {
                throw new Error('ArgumentNullException:text');
            }
            if (symbols == null) {
                throw new Error('ArgumentNullException:symbols');
            }
            var count = 0;
            for (var i = 0, len = text.length; i < len; i++) {
                var ch = text[i];
                if (this.contains(symbols, ch)) {
                    count++;
                }
            }
            return count;
        }
    };
    /**
     * Reads line of the text.
     * @private
     */
    StringTokenizer.prototype.readLine = function () {
        var pos = this.currentPosition;
        while (pos < this.length) {
            var ch = this.text[pos];
            switch (ch) {
                case '\r':
                case '\n': {
                    var text = this.text.substr(this.currentPosition, pos - this.currentPosition);
                    this.currentPosition = pos + 1;
                    if (((ch === '\r') && (this.currentPosition < this.length)) && (this.text[this.currentPosition] === '\n')) {
                        this.currentPosition++;
                    }
                    return text;
                }
            }
            pos++;
        }
        // The remaining text.
        if (pos > this.currentPosition) {
            var text2 = this.text.substr(this.currentPosition, pos - this.currentPosition);
            this.currentPosition = pos;
            return text2;
        }
        return null;
    };
    /**
     * Reads line of the text.
     * @private
     */
    StringTokenizer.prototype.peekLine = function () {
        var pos = this.currentPosition;
        var line = this.readLine();
        this.currentPosition = pos;
        return line;
    };
    /**
     * Reads a word from the text.
     * @private
     */
    StringTokenizer.prototype.readWord = function () {
        var pos = this.currentPosition;
        while (pos < this.length) {
            var ch = this.text[pos];
            switch (ch) {
                case '\r':
                case '\n':
                    var textValue = this.text.substr(this.currentPosition, pos - this.currentPosition);
                    this.currentPosition = pos + 1;
                    if (((ch === '\r') && (this.currentPosition < this.length)) && (this.text[this.currentPosition] === '\n')) {
                        this.currentPosition++;
                    }
                    return textValue;
                case ' ':
                case '\t': {
                    if (pos === this.currentPosition) {
                        pos++;
                    }
                    var text = this.text.substr(this.currentPosition, pos - this.currentPosition);
                    this.currentPosition = pos;
                    return text;
                }
            }
            pos++;
        }
        // The remaining text.
        if (pos > this.currentPosition) {
            var text2 = this.text.substr(this.currentPosition, pos - this.currentPosition);
            this.currentPosition = pos;
            return text2;
        }
        return null;
    };
    /**
     * Peeks a word from the text.
     * @private
     */
    StringTokenizer.prototype.peekWord = function () {
        var pos = this.currentPosition;
        var word = this.readWord();
        this.currentPosition = pos;
        return word;
    };
    StringTokenizer.prototype.read = function (count) {
        if (typeof count === 'undefined') {
            var ch = '0';
            if (!this.end) {
                ch = this.text[this.currentPosition];
                this.currentPosition++;
            }
            return ch;
        }
        else {
            var num = 0;
            var builder = '';
            while (!this.end && num < count) {
                var ch = this.read();
                builder = builder + ch;
                num++;
            }
            return builder;
        }
    };
    /**
     * Peeks char form the data.
     * @private
     */
    StringTokenizer.prototype.peek = function () {
        var ch = '0';
        if (!this.end) {
            ch = this.text[this.currentPosition];
        }
        return ch;
    };
    /**
     * Closes a reader.
     * @private
     */
    StringTokenizer.prototype.close = function () {
        this.text = null;
    };
    StringTokenizer.prototype.readToEnd = function () {
        var text;
        if (this.currentPosition === 0) {
            text = this.text;
        }
        else {
            text = this.text.substr(this.currentPosition, this.length - this.currentPosition);
        }
        this.currentPosition = this.length;
        return text;
    };
    //Implementation
    /**
     * Checks whether array contains a symbol.
     * @private
     */
    StringTokenizer.contains = function (array, symbol) {
        var contains = false;
        for (var i = 0; i < array.length; i++) {
            if (array[i] === symbol) {
                contains = true;
                break;
            }
        }
        return contains;
    };
    // Constants
    /**
     * `Whitespace` symbol.
     * @private
     */
    StringTokenizer.whiteSpace = ' ';
    /**
     * `tab` symbol.
     * @private
     */
    StringTokenizer.tab = '\t';
    /**
     * Array of `spaces`.
     * @private
     */
    StringTokenizer.spaces = [StringTokenizer.whiteSpace, StringTokenizer.tab];
    /**
     * `Pattern` for WhiteSpace.
     * @private
     */
    StringTokenizer.whiteSpacePattern = '^[ \t]+$';
    return StringTokenizer;
}());
export { StringTokenizer };
