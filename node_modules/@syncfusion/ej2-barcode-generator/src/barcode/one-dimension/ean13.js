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
 * EAN13 class is  used to calculate the barcode of type EAN13 barcode
 */
var Ean13 = /** @class */ (function (_super) {
    __extends(Ean13, _super);
    function Ean13() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    /**
     * Validate the given input.
     *
     * @returns {string} Validate the given input.
     * @param {string} value - provide the input values .
     * @private
     */
    Ean13.prototype.validateInput = function (value) {
        var checkSumValue = this.checksumValue(value);
        if (value.search(/^[0-9]{13}$/) !== -1 && (Number(value[12]) === this.checkSumData(value) || Number(value[12]) === checkSumValue)) {
            return undefined;
        }
        else if (value.search(/^[0-9]{12}$/) !== -1) {
            value += this.checkSumData(value);
            this.value = value;
            return undefined;
        }
        else {
            return 'Accepts 12 numeric characters.';
        }
    };
    Ean13.prototype.checksumValue = function (number) {
        var res = number
            .substr(0, 12)
            .split('')
            .map(function (n) { return +n; })
            .reduce(function (sum, a, idx) { return (idx % 2 ? sum + a * 3 : sum + a); }, 0);
        return (10 - (res % 10)) % 10;
    };
    Ean13.prototype.checkSumData = function (value) {
        var sum1 = 3 * (Number(value[11]) + Number(value[9]) + Number(value[7])
            + Number(value[5]) + Number(value[3]) + Number(value[1]));
        var sum2 = (Number(value[10]) + Number(value[8]) + Number(value[6])
            + Number(value[4])) + Number(value[2]) + Number(value[0]);
        var checkSumValue = (sum1 + sum2);
        var roundOffValue = Math.round(checkSumValue / 10) * 10;
        return roundOffValue - checkSumValue;
    };
    // eslint-disable-next-line
    Ean13.prototype.getStructure = function () {
        return {
            '0': 'LLLLLL',
            '1': 'LLGLGG',
            '2': 'LLGGLG',
            '3': 'LLGGGL',
            '4': 'LGLLGG',
            '5': 'LGGLLG',
            '6': 'LGGGLL',
            '7': 'LGLGLG',
            '8': 'LGLGGL',
            '9': 'LGGLGL'
        };
    };
    // eslint-disable-next-line
    Ean13.prototype.getBinaries = function () {
        return {
            'L': [
                '0001101', '0011001', '0010011', '0111101', '0100011',
                '0110001', '0101111', '0111011', '0110111', '0001011'
            ], 'G': [
                '0100111', '0110011', '0011011', '0100001', '0011101',
                '0111001', '0000101', '0010001', '0001001', '0010111'
            ],
            'R': [
                '1110010', '1100110', '1101100', '1000010', '1011100',
                '1001110', '1010000', '1000100', '1001000', '1110100'
            ],
            'O': [
                '0001101', '0011001', '0010011', '0111101', '0100011',
                '0110001', '0101111', '0111011', '0110111', '0001011'
            ],
            'E': [
                '0100111', '0110011', '0011011', '0100001', '0011101',
                '0111001', '0000101', '0010001', '0001001', '0010111'
            ]
        };
    };
    /**
     * Draw the barcode SVG.\
     *
     * @returns {void} Draw the barcode SVG .
     * @param {HTMLElement} canvas - Provide the canvas element .
     * @private
     */
    Ean13.prototype.draw = function (canvas) {
        var endBars = '101';
        var middleBar = '01010';
        var code = [];
        // eslint-disable-next-line
        var structureValue = this.getStructure();
        var structure = structureValue[this.value[0]];
        code.push(endBars);
        var leftString = this.value.substr(1, 6);
        code.push(this.leftValue(true, structure, leftString));
        code.push(middleBar);
        leftString = this.value.substr(7, 6);
        code.push(this.leftValue(false, 'RRRRRR', leftString));
        code.push(endBars);
        this.calculateBarCodeAttributes(code, canvas);
    };
    Ean13.prototype.leftValue = function (isLeft, structure, leftString) {
        var code;
        var tempCodes;
        // eslint-disable-next-line
        var codes = this.getBinaries();
        for (var i = 0; i < leftString.length; i++) {
            tempCodes = codes[structure[i]];
            if (i === 0) {
                code = tempCodes[leftString[i]];
            }
            else {
                code += tempCodes[leftString[i]];
            }
        }
        return code;
    };
    return Ean13;
}(OneDimension));
export { Ean13 };
