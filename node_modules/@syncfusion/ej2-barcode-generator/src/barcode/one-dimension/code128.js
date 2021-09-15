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
import { OneDimension } from '../one-dimension';
/**
 * code128 used to calculate the barcode of type 128
 */
var Code128 = /** @class */ (function (_super) {
    __extends(Code128, _super);
    function Code128() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    /**
     * Validate the given input.
     *
     * @returns {string} Validate the given input.
     *  @param {string} char - provide the input values .
     * @private
     */
    Code128.prototype.validateInput = function (char) {
        //if (char.search('/[a-zA-Z0-9]*/') === -1) {
        // eslint-disable-next-line
        if (char.search(/^[0-9A-Za-z\-\.\ \@\$\/\+\%\!\@\#\$\%\&\*\^\(\)\_\+\=\<\>\?\{\}\[\]\~\-\Ê]+$/) === -1) {
            return 'Supports only 128 characters of ASCII.';
        }
        else {
            return undefined;
        }
    };
    Code128.prototype.getCodeValue = function () {
        var codes = [11011001100, 11001101100, 11001100110, 10010011000, 10010001100,
            10001001100, 10011001000, 10011000100, 10001100100, 11001001000,
            11001000100, 11000100100, 10110011100, 10011011100, 10011001110,
            10111001100, 10011101100, 10011100110, 11001110010, 11001011100,
            11001001110, 11011100100, 11001110100, 11101101110, 11101001100,
            11100101100, 11100100110, 11101100100, 11100110100, 11100110010,
            11011011000, 11011000110, 11000110110, 10100011000, 10001011000,
            10001000110, 10110001000, 10001101000, 10001100010, 11010001000,
            11000101000, 11000100010, 10110111000, 10110001110, 10001101110,
            10111011000, 10111000110, 10001110110, 11101110110, 11010001110,
            11000101110, 11011101000, 11011100010, 11011101110, 11101011000,
            11101000110, 11100010110, 11101101000, 11101100010, 11100011010,
            11101111010, 11001000010, 11110001010, 10100110000, 10100001100,
            10010110000, 10010000110, 10000101100, 10000100110, 10110010000,
            10110000100, 10011010000, 10011000010, 10000110100, 10000110010,
            11000010010, 11001010000, 11110111010, 11000010100, 10001111010,
            10100111100, 10010111100, 10010011110, 10111100100, 10011110100,
            10011110010, 11110100100, 11110010100, 11110010010, 11011011110,
            11011110110, 11110110110, 10101111000, 10100011110, 10001011110,
            10111101000, 10111100010, 11110101000, 11110100010, 10111011110,
            10111101110, 11101011110, 11110101110, 11010000100, 11010010000,
            11010011100, 1100011101011];
        return codes;
    };
    Code128.prototype.getBytes = function (givenWord) {
        var bytes = [];
        for (var i = 0; i < givenWord.length; i++) {
            bytes.push(givenWord[i].charCodeAt(0));
        }
        return bytes;
    };
    Code128.prototype.appendStartStopCharacters = function (char) {
        var startChararcter;
        if (this.type === 'Code128A') {
            startChararcter = String.fromCharCode(208);
        }
        else if (this.type === 'Code128B') {
            startChararcter = String.fromCharCode(209);
        }
        else if (this.type === 'Code128C') {
            startChararcter = String.fromCharCode(210);
        }
        return startChararcter + char;
    };
    Code128.prototype.check128C = function (value) {
        return value.match(new RegExp('^' + '(\xCF*[0-9]{2}\xCF*)' + '*'))[0];
    };
    Code128.prototype.check128A = function (value) {
        return value.match(new RegExp('^' + '[\x00-\x5F\xC8-\xCF]' + '*'))[0];
    };
    Code128.prototype.check128B = function (value) {
        return value.match(new RegExp('^' + '[\x20-\x7F\xC8-\xCF]' + '*'))[0];
    };
    Code128.prototype.clipAB = function (value, code128A) {
        var ranges = code128A ? '[\x00-\x5F\xC8-\xCF]' : '[\x20-\x7F\xC8-\xCF]';
        // eslint-disable-next-line
        var untilC = value.match(new RegExp('^(' + ranges + '+?)(([0-9]{2}){2,})([^0-9]|$)'));
        if (untilC) {
            return untilC[1] + String.fromCharCode(204) + this.clipC(value.substring(untilC[1].length));
        }
        var chars = value.match(new RegExp('^' + ranges + '+'))[0];
        if (chars.length === value.length) {
            return value;
        }
        return value;
    };
    Code128.prototype.code128Clip = function () {
        var newString;
        var check128C = this.check128C(this.value).length;
        if (check128C >= 2) {
            return newString = String.fromCharCode(210) + this.clipC(this.value);
        }
        else {
            var code128A = this.check128A(this.value) > this.check128B(this.value);
            // eslint-disable-next-line
            return newString = (code128A ? String.fromCharCode(208) : String.fromCharCode(209)) + this.clipAB(this.value, code128A);
        }
    };
    Code128.prototype.clipC = function (string) {
        var cMatch = this.check128C(string);
        var length = cMatch.length;
        if (length === string.length) {
            return string;
        }
        string = string.substring(length);
        var code128A = this.check128A(string) >= this.check128B(string);
        return cMatch + String.fromCharCode(code128A ? 206 : 205) + this.clipAB(string, code128A);
    };
    /**
     * Draw the barcode SVG.\
     *
     * @returns {void} Draw the barcode SVG .
     *  @param {HTMLElement} canvas - Provide the canvas element .
     * @private
     */
    Code128.prototype.draw = function (canvas) {
        this.code128(canvas);
    };
    /**
     * Draw the barcode SVG.\
     *
     * @returns {void} Draw the barcode SVG .
     *  @param {HTMLElement} canvas - Provide the canvas element .
     * @private
     */
    Code128.prototype.code128 = function (canvas) {
        var givenCharacter = this.value;
        givenCharacter = this.type !== 'Code128' ? this.appendStartStopCharacters(givenCharacter) : this.code128Clip();
        var bytes = this.getBytes(givenCharacter);
        var startCharacterValue = bytes.shift() - 105;
        var set;
        if (startCharacterValue === 103) {
            set = '0';
        }
        else if (startCharacterValue === 104) {
            set = '1';
        }
        else {
            set = '2';
        }
        var encodingResult = this.encodeData(bytes, 1, set);
        var encodedData = this.encode(startCharacterValue, encodingResult);
        var code = [];
        code.push(encodedData);
        this.calculateBarCodeAttributes(code, canvas);
    };
    Code128.prototype.encodeData = function (byteValue, textPosition, set) {
        if (!byteValue.length) {
            return { result: '', checksum: 0 };
        }
        var nextCode;
        var index;
        if (byteValue[0] >= 200) {
            index = byteValue.shift() - 105;
            var nextSet = this.swap(index);
            if (nextSet !== undefined) {
                nextCode = this.encodeData(byteValue, textPosition + 1, nextSet);
            }
        }
        else {
            index = this.correctIndex(byteValue, set);
            nextCode = this.encodeData(byteValue, textPosition + 1, set);
        }
        var encodingValues = this.getCodes(index);
        var weight = index * textPosition;
        return {
            result: encodingValues + nextCode.result,
            checksum: weight + nextCode.checksum
        };
    };
    Code128.prototype.swap = function (index) {
        if (index === 99) {
            return '2';
        }
        else if (index === 100) {
            return '1';
        }
        else {
            return '0';
        }
    };
    Code128.prototype.encode = function (startIndex, encodingResult) {
        var moduloValue = 103;
        var stopvalue = 106;
        var encodeValue = this.getCodes(startIndex) + encodingResult.result;
        if (this.enableCheckSum) {
            encodeValue += this.getCodes((encodingResult.checksum + startIndex) % moduloValue);
        }
        encodeValue += this.getCodes(stopvalue);
        return encodeValue;
    };
    // Correct an index by a set and shift it from the bytes array
    Code128.prototype.correctIndex = function (bytes, set) {
        if (set === '0') {
            var charCode = bytes.shift();
            return charCode < 32 ? charCode + 64 : charCode - 32;
        }
        else if (set === '1') {
            return bytes.shift() - 32;
        }
        else {
            return (bytes.shift() - 48) * 10 + bytes.shift() - 48;
        }
    };
    // Get a bar symbol by index
    Code128.prototype.getCodes = function (index) {
        var codes = this.getCodeValue();
        return codes[index] ? codes[index].toString() : '';
    };
    return Code128;
}(OneDimension));
export { Code128 };
