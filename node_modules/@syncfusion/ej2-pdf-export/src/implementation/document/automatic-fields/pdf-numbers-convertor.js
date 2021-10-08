/**
 * PdfNumbersConvertor.ts class for EJ2-PDF
 * @private
 */
import { PdfNumberStyle } from './../../pages/enum';
/**
 * `PdfNumbersConvertor` for convert page number into numbers, roman letters, etc.,
 * @private
 */
var PdfNumbersConvertor = /** @class */ (function () {
    function PdfNumbersConvertor() {
    }
    // Static methods
    /**
     * Convert string value from page number with correct format.
     * @private
     */
    PdfNumbersConvertor.convert = function (intArabic, numberStyle) {
        var result = '';
        switch (numberStyle) {
            case PdfNumberStyle.None:
                result = '';
                break;
            case PdfNumberStyle.Numeric:
                result = intArabic.toString();
                break;
            case PdfNumberStyle.LowerLatin:
                result = this.arabicToLetter(intArabic).toLowerCase();
                break;
            case PdfNumberStyle.LowerRoman:
                result = this.arabicToRoman(intArabic).toLowerCase();
                break;
            case PdfNumberStyle.UpperLatin:
                result = this.arabicToLetter(intArabic);
                break;
            case PdfNumberStyle.UpperRoman:
                result = this.arabicToRoman(intArabic);
                break;
        }
        return result;
    };
    /**
     * Converts `arabic to roman` letters.
     * @private
     */
    PdfNumbersConvertor.arabicToRoman = function (intArabic) {
        var retval = '';
        var retvalM = this.generateNumber(intArabic, 1000, 'M');
        retval += retvalM.returnValue;
        intArabic = retvalM.intArabic;
        var retvalCM = this.generateNumber(intArabic, 900, 'CM');
        retval += retvalCM.returnValue;
        intArabic = retvalCM.intArabic;
        var retvalD = this.generateNumber(intArabic, 500, 'D');
        retval += retvalD.returnValue;
        intArabic = retvalD.intArabic;
        var retvalCD = this.generateNumber(intArabic, 400, 'CD');
        retval += retvalCD.returnValue;
        intArabic = retvalCD.intArabic;
        var retvalC = this.generateNumber(intArabic, 100, 'C');
        retval += retvalC.returnValue;
        intArabic = retvalC.intArabic;
        var retvalXC = this.generateNumber(intArabic, 90, 'XC');
        retval += retvalXC.returnValue;
        intArabic = retvalXC.intArabic;
        var retvalL = this.generateNumber(intArabic, 50, 'L');
        retval += retvalL.returnValue;
        intArabic = retvalL.intArabic;
        var retvalXL = this.generateNumber(intArabic, 40, 'XL');
        retval += retvalXL.returnValue;
        intArabic = retvalXL.intArabic;
        var retvalX = this.generateNumber(intArabic, 10, 'X');
        retval += retvalX.returnValue;
        intArabic = retvalX.intArabic;
        var retvalIX = this.generateNumber(intArabic, 9, 'IX');
        retval += retvalIX.returnValue;
        intArabic = retvalIX.intArabic;
        var retvalV = this.generateNumber(intArabic, 5, 'V');
        retval += retvalV.returnValue;
        intArabic = retvalV.intArabic;
        var retvalIV = this.generateNumber(intArabic, 4, 'IV');
        retval += retvalIV.returnValue;
        intArabic = retvalIV.intArabic;
        var retvalI = this.generateNumber(intArabic, 1, 'I');
        retval += retvalI.returnValue;
        intArabic = retvalI.intArabic;
        return retval.toString();
    };
    /**
     * Converts `arabic to normal letters`.
     * @private
     */
    PdfNumbersConvertor.arabicToLetter = function (arabic) {
        var stack = this.convertToLetter(arabic);
        var result = '';
        while (stack.length > 0) {
            var num = stack.pop();
            result = this.appendChar(result, num);
        }
        return result.toString();
    };
    /**
     * Generate a string value of an input number.
     * @private
     */
    PdfNumbersConvertor.generateNumber = function (value, magnitude, letter) {
        var numberstring = '';
        while (value >= magnitude) {
            value -= magnitude;
            numberstring += letter;
        }
        return { returnValue: numberstring.toString(), intArabic: value };
    };
    /**
     * Convert a input number into letters.
     * @private
     */
    PdfNumbersConvertor.convertToLetter = function (arabic) {
        if (arabic <= 0) {
            throw Error('ArgumentOutOfRangeException-arabic, Value can not be less 0');
        }
        var stack = [];
        while (arabic > this.letterLimit) {
            var remainder = arabic % this.letterLimit;
            if (remainder === 0.0) {
                arabic = arabic / this.letterLimit - 1;
                remainder = this.letterLimit;
            }
            else {
                arabic /= this.letterLimit;
            }
            stack.push(remainder);
        }
        stack.push(arabic);
        return stack;
    };
    /**
     * Convert number to actual string value.
     * @private
     */
    PdfNumbersConvertor.appendChar = function (builder, value) {
        var letter = String.fromCharCode(PdfNumbersConvertor.acsiiStartIndex + value);
        builder += letter;
        return builder;
    };
    // Fields
    /**
     * numbers of letters in english [readonly].
     * @default = 26.0
     * @private
     */
    PdfNumbersConvertor.letterLimit = 26.0;
    /**
     * Resturns `acsii start index` value.
     * @default 64
     * @private
     */
    PdfNumbersConvertor.acsiiStartIndex = (65 - 1);
    return PdfNumbersConvertor;
}());
export { PdfNumbersConvertor };
