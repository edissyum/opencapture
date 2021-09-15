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
import { Code128 } from './code128';
/**
 * code128A used to calculate the barcode of type 1228A
 */
var Code128A = /** @class */ (function (_super) {
    __extends(Code128A, _super);
    function Code128A() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    /**
     * Validate the given input.
     *
     * @returns {string} Validate the given input.
     * @param {string} char - provide the input values .
     * @private
     */
    Code128A.prototype.validateInput = function (char) {
        if ((new RegExp("^" + '[\x00-\x5F\xC8-\xCF]' + "+$")).test(char)) {
            return undefined;
        }
        else {
            return 'Supports only ASCII characters 00 to 95 (0–9, A–Z and control codes) and special characters.';
        }
    };
    /**
     * Draw the barcode SVG.\
     *
     * @returns {void} Draw the barcode SVG .
     * @param {HTMLElement} canvas - Provide the canvas element .
     * @private
     */
    Code128A.prototype.draw = function (canvas) {
        this.code128(canvas);
    };
    return Code128A;
}(Code128));
export { Code128A };
