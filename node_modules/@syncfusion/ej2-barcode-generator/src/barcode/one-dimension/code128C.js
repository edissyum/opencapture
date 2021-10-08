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
 * code128C used to calculate the barcode of type 128C barcode
 */
var Code128C = /** @class */ (function (_super) {
    __extends(Code128C, _super);
    function Code128C() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    /**
     * Validate the given input.
     *
     * @returns {string} Validate the given input.
     * @param {string} char - provide the input values .
     * @private
     */
    Code128C.prototype.validateInput = function (char) {
        if ((new RegExp("^" + '(\xCF*[0-9]{2}\xCF*)' + "+$")).test(char)) {
            return undefined;
        }
        else {
            return 'Supports even number of numeric characters (00-99).';
        }
    };
    /**
     * Draw the barcode SVG.\
     *
     * @returns {void} Draw the barcode SVG .
     * @param {HTMLElement} canvas - Provide the canvas element .
     * @private
     */
    Code128C.prototype.draw = function (canvas) {
        this.code128(canvas);
    };
    return Code128C;
}(Code128));
export { Code128C };
