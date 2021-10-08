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
var UpcE = /** @class */ (function (_super) {
    __extends(UpcE, _super);
    function UpcE() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    /**
     * Validate the given input.
     *
     * @returns {string} Validate the given input.
     * @param {string} value - provide the input values .
     * @private
     */
    UpcE.prototype.validateInput = function (value) {
        if (value.search(/^[0-9]{6}$/) !== -1) {
            return undefined;
        }
        else {
            return 'Accepts 6 numeric characters.';
        }
    };
    UpcE.prototype.checkSum = function (value) {
        var result = 0;
        var i;
        for (i = 1; i < 11; i += 2) {
            // eslint-disable-next-line
            result += parseInt(value[i], undefined);
        }
        for (i = 0; i < 11; i += 2) {
            // eslint-disable-next-line
            result += parseInt(value[i], undefined) * 3;
        }
        return (10 - (result % 10)) % 10;
    };
    // eslint-disable-next-line
    UpcE.prototype.getStructure = function () {
        return {
            '0': 'EEEOOO',
            '1': 'EEOEOO',
            '2': 'EEOOEO',
            '3': 'EEOOOE',
            '4': 'EOEEOO',
            '5': 'EOOEEO',
            '6': 'EOOOEE',
            '7': 'EOEOEO',
            '8': 'EOEOOE',
            '9': 'EOOEOE'
        };
    };
    UpcE.prototype.getValue = function () {
        return ['XX00000XXX',
            'XX10000XXX',
            'XX20000XXX',
            'XXX00000XX',
            'XXXX00000X',
            'XXXXX00005',
            'XXXXX00006',
            'XXXXX00007',
            'XXXXX00008',
            'XXXXX00009'];
    };
    UpcE.prototype.getExpansion = function (lastDigit) {
        var value = this.getValue();
        return value[lastDigit];
    };
    UpcE.prototype.getUpcValue = function () {
        var lastDigit = this.value[this.value.length - 1];
        var expansionValue = this.getExpansion(lastDigit);
        var result = '';
        var index = 0;
        for (var i = 0; i < expansionValue.length; i++) {
            var value = expansionValue[i];
            if (value === 'X') {
                result += this.value[index++];
            }
            else {
                result += value;
            }
        }
        result = '' + '0' + result;
        var encodingValue = '' + result;
        if (this.enableCheckSum) {
            encodingValue += this.checkSum(result);
        }
        return encodingValue;
    };
    // eslint-disable-next-line
    UpcE.prototype.getBinaries = function () {
        return {
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
    UpcE.prototype.encoding = function (upcAValue, string, structure) {
        var code;
        var tempValue;
        // eslint-disable-next-line
        var codes = this.getBinaries();
        for (var i = 0; i < string.length; i++) {
            tempValue = codes[structure[i]];
            if (i === 0) {
                code = tempValue[string[i]];
            }
            else {
                code += tempValue[string[i]];
            }
        }
        return code;
    };
    /**
     * Draw the barcode SVG.\
     *
     * @returns {void} Draw the barcode SVG .
     * @param {HTMLElement} canvas - Provide the canvas element .
     * @private
     */
    UpcE.prototype.draw = function (canvas) {
        var endBars = '101';
        var middleBar = '010101';
        var endDigits = '00000000';
        var code = [];
        var upcAValue = this.getUpcValue();
        // eslint-disable-next-line
        var structureValue = this.getStructure();
        var structure = structureValue[upcAValue[upcAValue.length - 1]];
        code.push(endDigits);
        code.push(endBars);
        code.push(this.encoding(upcAValue, this.value, structure));
        code.push(middleBar);
        code.push(endDigits);
        var renderText = upcAValue[0] + this.value + upcAValue[upcAValue.length - 1];
        this.calculateBarCodeAttributes(code, canvas, this.displayText.text === '' ? renderText : undefined);
    };
    return UpcE;
}(OneDimension));
export { UpcE };
