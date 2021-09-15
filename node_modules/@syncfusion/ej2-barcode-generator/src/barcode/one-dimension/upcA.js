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
 * This class is  used to calculate the barcode of type Universal Product Code barcode
 */
var UpcA = /** @class */ (function (_super) {
    __extends(UpcA, _super);
    function UpcA() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    /**
     * Validate the given input.
     *
     * @returns {string} Validate the given input.
     * @param {string} value - provide the input values .
     * @private
     */
    UpcA.prototype.validateInput = function (value) {
        if (value.search(/^[0-9]{11}$/) !== -1 && this.enableCheckSum) {
            this.value += this.checkSumData(this.value);
        }
        if (this.value.search(/^[0-9]{12}$/) !== -1 && (Number(this.value[11]) === this.checkSumData(this.value))) {
            return undefined;
        }
        else {
            return 'Accepts 11 numeric characters.';
        }
    };
    UpcA.prototype.checkSumData = function (value) {
        var sum1 = 3 * (Number(value[0]) + Number(value[2]) + Number(value[4])
            + Number(value[6]) + Number(value[8]) + Number(value[10]));
        var sum2 = (Number(value[9]) + Number(value[7]) + Number(value[5]) + Number(value[3]) + Number(value[1]));
        var checkSumValue = (sum1 + sum2);
        return (10 - checkSumValue % 10) % 10;
    };
    // eslint-disable-next-line
    UpcA.prototype.getBinaries = function () {
        return {
            'L': [
                '0001101', '0011001', '0010011', '0111101', '0100011',
                '0110001', '0101111', '0111011', '0110111', '0001011'
            ],
            'R': [
                '1110010', '1100110', '1101100', '1000010', '1011100',
                '1001110', '1010000', '1000100', '1001000', '1110100'
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
    UpcA.prototype.draw = function (canvas) {
        var endDigits = '00000000';
        var middleBar = '01010';
        var code = [];
        code.push(endDigits);
        code.push('101' + this.leftValue(true, 'L', this.value[0]));
        code.push(this.leftValue(true, 'LLLLL', this.value.substr(1, 5)));
        code.push(middleBar);
        code.push(this.leftValue(true, 'RRRRR', this.value.substr(6, 5)));
        code.push(this.leftValue(true, 'R', this.value[11]) + '101');
        code.push(endDigits);
        this.calculateBarCodeAttributes(code, canvas);
    };
    UpcA.prototype.leftValue = function (isLeft, structure, leftString) {
        var code;
        var tempValue;
        // eslint-disable-next-line
        var codes = this.getBinaries();
        for (var i = 0; i < leftString.length; i++) {
            tempValue = codes[structure[i]];
            if (i === 0) {
                code = tempValue[leftString[i]];
            }
            else {
                code += tempValue[leftString[i]];
            }
        }
        return code;
    };
    return UpcA;
}(OneDimension));
export { UpcA };
