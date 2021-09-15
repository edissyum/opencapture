import { QRCodeVersion, ErrorCorrectionLevel } from '../barcode/enum/enum';
/**
 * Qrcode used to calculate the Qrcode control
 */
export declare class ErrorCorrectionCodewords {
    /**
     * Holds the length
     */
    private mLength;
    /**
     * Holds the Error Correction Code Word
     */
    private eccw;
    /**
     * Holds the databits
     */
    private databits;
    /**
     * Holds the Data Code word
     */
    private mDataCodeWord;
    /**
     * Holds G(x)
     */
    private gx;
    /**
     * Holds all the values of Alpha
     */
    private alpha;
    /**
     * Holds the Decimal value
     */
    private decimalValue;
    /**
     * Holds the values of QR Barcode
     */
    private mQrBarcodeValues;
    /**
     * Sets and Gets the Data code word
     *
     * @param {string} value - Sets and Gets the Data code word
     * @private
     */
    DC: string[];
    /**
     * Sets and Gets the DataBits
     *
     * @param {string} value - Sets and Gets the DataBits
     * @private
     */
    DataBits: number;
    /**
     * Sets and Gets the Error Correction Code Words
     *
     * @param {string} value - Sets and Gets the Error Correction Code Words
     * @private
     */
    Eccw: number;
    /**
     * Initializes Error correction code word
     *
     * @param {QRCodeVersion} version - version of the qr code
     * @param {ErrorCorrectionLevel} correctionLevel - defines the level of error correction.
     */
    constructor(version: QRCodeVersion, correctionLevel: ErrorCorrectionLevel);
    /**
     *  Gets the Error correction code word
     *
     * @returns { number} Gets the Error correction code word
     * @private
     */
    getErcw(): string[];
    /**
     * Convert to decimal
     *
     * @returns {void}Convert to decimal.
     * @param {string[]} inString - Provide the version for the QR code
     * @private
     */
    private toDecimal;
    /**
     * Convert decimal to binary.
     *
     * @returns {string[]}Convert decimal to binary.
     * @param {number[]} decimalRepresentation - Provide the version for the QR code
     * @private
     */
    private toBinary;
    /**
     * Polynomial division.
     *
     * @returns {string[]}Polynomial division.
     * @private
     */
    private divide;
    private xORPolynoms;
    private multiplyGeneratorPolynomByLeadterm;
    private convertToDecNotation;
    private convertToAlphaNotation;
    private findLargestExponent;
    private getIntValFromAlphaExp;
    /**
     * Find the element in the alpha
     *
     * @returns {number}Find the element in the alpha.
     * @param {QRCodeVersion} element - Provide the element for the Qr code
     * @param {ErrorCorrectionLevel} alpha -provide the number
     * @private
     */
    private findElement;
    /**
     * Gets g(x) of the element
     */
    /**
     * Gets g(x) of the element
     *
     * @returns {number}Gets g(x) of the element .
     * @param {QRCodeVersion} element - Provide the element for the Qr code
     * @param {ErrorCorrectionLevel} alpha -provide the number
     * @private
     */
    private getElement;
}
