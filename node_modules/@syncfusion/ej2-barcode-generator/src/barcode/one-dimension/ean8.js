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
 * EAN8 class is  used to calculate the barcode of type EAN8 barcode
 */
var Ean8 = /** @class */ (function (_super) {
    __extends(Ean8, _super);
    function Ean8() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    /**
     * Validate the given input.
     *
     * @returns {string} Validate the given input.
     * @param {string} value - provide the input values .
     * @private
     */
    Ean8.prototype.validateInput = function (value) {
        if (value.search(/^[0-9]{8}$/) !== -1 && Number(value[7]) === this.checkSumData(value)) {
            return undefined;
        }
        else {
            return 'Accepts 8 numeric characters.';
        }
    };
    // eslint-disable-next-line
    Ean8.prototype.getCodeValueRight = function (right) {
        // eslint-disable-next-line
        var codes;
        if (right) {
            codes = {
                '0': '0001101',
                '1': '0011001',
                '2': '0010011',
                '3': '0111101',
                '4': '0100011',
                '5': '0110001',
                '6': '0101111',
                '7': '0111011',
                '8': '0110111',
                '9': '0001011'
            };
        }
        else {
            codes = {
                '0': '1110010',
                '1': '1100110',
                '2': '1101100',
                '3': '1000010',
                '4': '1011100',
                '5': '1001110',
                '6': '1010000',
                '7': '1000100',
                '8': '1001000',
                '9': '1110100'
            };
        }
        return codes;
    };
    Ean8.prototype.checkSumData = function (value) {
        for (var i = 0; i < value.length; i++) {
            var sum1 = Number(value[1]) + Number(value[3]) + Number(value[5]);
            var sum2 = 3 * (Number(value[0]) + Number(value[2]) + Number(value[4]) + Number(value[6]));
            var checkSumValue = sum1 + sum2;
            var checkSumDigit = 10 - (checkSumValue % 10);
            return checkSumDigit === 0 ? checkSumDigit = 0 : checkSumDigit;
        }
        return 0;
    };
    /**
     * Draw the barcode SVG.\
     *
     * @returns {void} Draw the barcode SVG .
     * @param {HTMLElement} canvas - Provide the canvas element .
     * @private
     */
    Ean8.prototype.draw = function (canvas) {
        var endBars = '101';
        var middleBar = '01010';
        var codes = this.getCodeValueRight(true);
        var code = [];
        code.push(endBars);
        code.push(this.leftValue(codes, true));
        code.push(middleBar);
        codes = this.getCodeValueRight(false);
        code.push(this.leftValue(codes, false));
        code.push(endBars);
        this.calculateBarCodeAttributes(code, canvas);
    };
    Ean8.prototype.leftValue = function (codes, isLeft) {
        var code;
        for (var i = isLeft ? 0 : this.value.length - 4; i < (isLeft ? this.value.length - 4 : this.value.length); i++) {
            if (i === 0 || i === 4) {
                code = codes[this.value[i]];
            }
            else {
                code += codes[this.value[i]];
            }
        }
        return code;
    };
    return Ean8;
}(OneDimension));
export { Ean8 };
