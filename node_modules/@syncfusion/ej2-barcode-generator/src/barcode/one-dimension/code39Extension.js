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
import { Code39 } from './code39';
/**
 * code39 used to calculate the barcode of type 39
 */
var Code39Extension = /** @class */ (function (_super) {
    __extends(Code39Extension, _super);
    function Code39Extension() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    // eslint-disable-next-line
    Code39Extension.prototype.code39ExtensionValues = function () {
        // eslint-disable-next-line
        var codes = {
            '0': '%U', '1': '$A', '2': '$B', '3': '$C', '4': '$D',
            '5': '$E', '6': '$F', '7': '$G', '8': '$H', '9': '$I',
            '10': '$J', '11': '$K', '12': '$L', '13': '$M', '14': '$N',
            '15': '$O', '16': '$P', '17': '$Q', '18': '$R', '19': '$S',
            '20': '$T', '21': '$U', '22': '$V', '23': '$W', '24': '$X',
            '25': '$Y', '26': '$Z', '27': '%A', '28': '%B', '29': '%C',
            '30': '%D', '31': '%E', '32': ' ', '33': '/A', '34': '/B',
            '35': '/C', '36': '/D', '37': '/E', '38': '/F', '39': '/G',
            '40': '/H', '41': '/I', '42': '/J', '43': '/K', '44': '/L',
            '45': '-', '46': '.', '47': '/O', '48': '0', '49': '1',
            '50': '2', '51': '3', '52': '4', '53': '5', '54': '6', '55': '7',
            '56': '8',
            '57': '9',
            '58': '/Z',
            '59': '%F',
            '60': '%G',
            '61': '%H',
            '62': '%I',
            '63': '%J',
            '64': '%V',
            '65': 'A',
            '66': 'B',
            '67': 'C',
            '68': 'D',
            '69': 'E',
            '70': 'F',
            '71': 'G',
            '72': 'H',
            '73': 'I',
            '74': 'J',
            '75': 'K',
            '76': 'L',
            '77': 'M',
            '78': 'N',
            '79': 'O',
            '80': 'P',
            '81': 'Q',
            '82': 'R',
            '83': 'S',
            '84': 'T',
            '85': 'U',
            '86': 'V',
            '87': 'W',
            '88': 'X',
            '89': 'Y',
            '90': 'Z',
            '91': '%K',
            '92': '%L',
            '93': '%M',
            '94': '%N',
            '95': '%O',
            '96': '%W',
            '97': '+A',
            '98': '+B',
            '99': '+C',
            '100': '+D',
            '101': '+E',
            '102': '+F',
            '103': '+G',
            '104': '+H',
            '105': '+I',
            '106': '+J',
            '107': '+K',
            '108': '+L',
            '109': '+M',
            '110': '+N',
            '111': '+O',
            '112': '+P',
            '113': '+Q',
            '114': '+R',
            '115': '+S',
            '116': '+T',
            '117': '+U',
            '118': '+V',
            '119': '+W',
            '120': '+X',
            '121': '+Y',
            '122': '+Z',
            '123': '%P',
            '124': '%Q',
            '125': '	%R',
            '126': '%S',
            '127': '%T'
        };
        return codes;
    };
    /**
     * Validate the given input.
     *
     * @returns {string} Validate the given input.
     * @param {string} char - Provide the canvas element .
     * @private
     */
    Code39Extension.prototype.validateInput = function (char) {
        var asciiCheck = this.checkText(char);
        if (asciiCheck) {
            return undefined;
        }
        else {
            return 'Supports 128 characters of ASCII.';
        }
    };
    Code39Extension.prototype.checkText = function (char) {
        for (var i = 0; i < char.length; i++) {
            if (char.charCodeAt(i) > 127) {
                return false;
            }
        }
        return true;
    };
    Code39Extension.prototype.code39Extension = function (givenCharacter) {
        var encodedString = '';
        // eslint-disable-next-line
        var code = this.code39ExtensionValues();
        var asciivalue;
        for (var i = 0; i < givenCharacter.length; i++) {
            asciivalue = givenCharacter[i].charCodeAt(0);
            encodedString += code[asciivalue];
        }
        return encodedString;
    };
    /**
     * Draw the barcode SVG.\
     *
     * @returns {void} Draw the barcode SVG .
     *  @param {HTMLElement} canvas - Provide the canvas element .
     * @private
     */
    Code39Extension.prototype.drawCode39 = function (canvas) {
        var givenCharacter = this.value;
        var encodedCharacter = this.code39Extension(givenCharacter);
        this.drawCode39Extension(canvas, encodedCharacter);
    };
    return Code39Extension;
}(Code39));
export { Code39Extension };
