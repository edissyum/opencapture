/**
 * PdfNumbersConvertor.ts class for EJ2-PDF
 * @private
 */
import { PdfNumberStyle } from './../../pages/enum';
/**
 * `PdfNumbersConvertor` for convert page number into numbers, roman letters, etc.,
 * @private
 */
export declare class PdfNumbersConvertor {
    /**
     * numbers of letters in english [readonly].
     * @default = 26.0
     * @private
     */
    private static readonly letterLimit;
    /**
     * Resturns `acsii start index` value.
     * @default 64
     * @private
     */
    private static readonly acsiiStartIndex;
    /**
     * Convert string value from page number with correct format.
     * @private
     */
    static convert(intArabic: number, numberStyle: PdfNumberStyle): string;
    /**
     * Converts `arabic to roman` letters.
     * @private
     */
    private static arabicToRoman;
    /**
     * Converts `arabic to normal letters`.
     * @private
     */
    private static arabicToLetter;
    /**
     * Generate a string value of an input number.
     * @private
     */
    private static generateNumber;
    /**
     * Convert a input number into letters.
     * @private
     */
    private static convertToLetter;
    /**
     * Convert number to actual string value.
     * @private
     */
    private static appendChar;
}
