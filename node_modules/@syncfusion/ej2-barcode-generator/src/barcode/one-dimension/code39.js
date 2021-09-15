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
 * code39 used to calculate the barcode of type 39
 */
var Code39 = /** @class */ (function (_super) {
    __extends(Code39, _super);
    function Code39() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    /**
     * get the code value.
     *
     * @returns {string[]} return the code value.
     * @private
     */
    Code39.prototype.getCodeValue = function () {
        var codes = ['111221211', '211211112', '112211112',
            '212211111', '111221112', '211221111', '112221111', '111211212',
            '211211211', '112211211', '211112112', '112112112', '212112111', '111122112', '211122111', '112122111',
            '111112212', '211112211', '112112211', '111122211', '211111122', '112111122', '212111121', '111121122',
            '211121121', '112121121', '111111222', '211111221', '112111221', '111121221', '221111112', '122111112',
            '222111111', '121121112', '221121111', '122121111', '121111212', '221111211', '122111211', '121121211',
            '121212111', '121211121', '121112121', '111212121'];
        return codes;
    };
    /**
     * Provide the string value.
     *
     * @returns {string} Provide the string value.
     * @private
     */
    Code39.prototype.getCharacter = function () {
        var characters = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ-. *$/+%';
        return characters;
    };
    /**
     *Check sum method for the code 39 bar code
     *
     * @param {string} char - Provide the canvas element .
     * @param {string} characters - Provide the canvas element .
     * @returns {number}Check sum method for the code 39 bar code
     * @private
     */
    Code39.prototype.checkSum = function (char, characters) {
        var checksum = 0;
        for (var i = 0; i < char.length; i++) {
            var codeNumber = characters.indexOf(char[i]);
            checksum += codeNumber;
        }
        checksum = checksum % 43;
        return checksum;
    };
    /**
     * Validate the given input.
     *
     * @returns {string} Validate the given input.
     * @param {string} char - Provide the canvas element .
     * @private
     */
    Code39.prototype.validateInput = function (char) {
        // eslint-disable-next-line
        if (char.search(/^[0-9A-Z\-\.\ \$\/\+\%]+$/) === -1) {
            return 'Supports A-Z, 0-9, and symbols ( - . $ / + % SPACE).';
        }
        else {
            return undefined;
        }
    };
    Code39.prototype.getPatternCollection = function (givenChar, characters) {
        var codeNumber;
        var code = [];
        var codes = this.getCodeValue();
        for (var i = 0; i < givenChar.length; i++) {
            codeNumber = characters.indexOf(givenChar.charAt(i));
            code.push(codes[codeNumber]);
        }
        return code;
    };
    Code39.prototype.appendStartStopCharacters = function (char) {
        return '*' + char + '*';
    };
    /**
     * Draw the barcode SVG.\
     *
     * @returns {void} Draw the barcode SVG .
     *  @param {HTMLElement} canvas - Provide the canvas element .
     *  @param {HTMLElement} encodedCharacter - Provide the canvas element .
     * @private
     */
    Code39.prototype.drawCode39Extension = function (canvas, encodedCharacter) {
        this.draw(canvas, encodedCharacter);
    };
    /**
     * Draw the barcode SVG.\
     *
     * @returns {void} Draw the barcode SVG .
     *  @param {HTMLElement} canvas - Provide the canvas element .
     *  @param {HTMLElement} encodedCharacter - Provide the canvas element .
     * @private
     */
    Code39.prototype.draw = function (canvas, encodedCharacter) {
        var givenCharacter = encodedCharacter ? encodedCharacter : this.value;
        var characters = this.getCharacter();
        if (this.enableCheckSum) {
            var checkSum = this.checkSum(givenCharacter, characters);
            givenCharacter += checkSum;
        }
        givenCharacter = this.appendStartStopCharacters(givenCharacter);
        var code = this.getPatternCollection(givenCharacter, characters);
        this.calculateBarCodeAttributes(code, canvas);
    };
    return Code39;
}(OneDimension));
export { Code39 };
