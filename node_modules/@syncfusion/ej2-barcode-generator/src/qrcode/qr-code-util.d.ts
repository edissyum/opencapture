import { MarginModel } from '../barcode/primitives/margin-model';
import { QRCodeVersion, ErrorCorrectionLevel } from '../barcode/enum/enum';
import { DisplayTextModel } from '../barcode/primitives/displaytext-model';
/**
 * Qrcode used to calculate the Qrcode control
 */
export declare class QRCode {
    private mVersion;
    private mInputMode;
    private validInput;
    /**
     * Total bits required in mixing mode.
     */
    private totalBits;
    /**
     * Holds the data of Function Pattern.
     */
    private mModuleValue;
    private mDataAllocationValues;
    private mQrBarcodeValues;
    /**
     * Set version for mixing mode.
     */
    private mixVersionERC;
    /**
     * Data to be currently encoded in Mixing Mode
     */
    private mixExecutablePart;
    /**
     * Count of mixing mode blocks.
     */
    private mixDataCount;
    /**
     * Holds the Number of Modules.
     */
    private mNoOfModules;
    /**
     * Check if User Mentioned Mode
     */
    private mIsUserMentionedMode;
    private chooseDefaultMode;
    /** @private */
    text: string;
    private mixRemainingPart;
    private isXdimension;
    private mXDimension;
    /**
     * Get or Private set the XDimension values.
     *
     * @returns {number}Get or Private set the XDimension values..
     * @private
     */
    /**
    *  Get or Private set the XDimension values.
    *
    * @param {number} value - Get or Private set the XDimension values.
    * @private
    */
    XDimension: number;
    private inputMode;
    /**
     *Get or Private set the version
     *
     * @returns {QRCodeVersion}Get or Private set the version
     * @private
     */
    /**
    *  Get or Private set the version
    *
    * @param {QRCodeVersion} value - Get or Private set the version
    * @private
    */
    version: QRCodeVersion;
    private mIsEci;
    /** @private */
    mIsUserMentionedErrorCorrectionLevel: boolean;
    private isSvgMode;
    private mEciAssignmentNumber;
    /** @private */
    mIsUserMentionedVersion: boolean;
    /** @private */
    mErrorCorrectionLevel: ErrorCorrectionLevel;
    private textList;
    private mode;
    private getBaseAttributes;
    private getInstance;
    private drawImage;
    /**
     * Draw the QR cpde in SVG.\
     *
     * @returns {boolean} Draw the barcode SVG .
     *  @param {HTMLElement} char - Provide the char to render .
     *  @param {HTMLElement} canvas - Provide the canvas element .
     *  @param {HTMLElement} height - Provide the height for the canvas element .
     *  @param {HTMLElement} width - Provide the width for the canvas element .
     *  @param {HTMLElement} margin - Provide the margin for thecanvas element .
     *  @param {HTMLElement} displayText - Provide display text for the canvas element .
     *  @param {HTMLElement} mode - Provide the mode to render .
     *  @param {HTMLElement} foreColor - Provide the color for the barcode to render.
     * @private
     */
    draw(char: string, canvas: HTMLElement, height: number, width: number, margin?: MarginModel, displayText?: DisplayTextModel, mode?: boolean, foreColor?: string): boolean;
    private drawText;
    private drawDisplayText;
    private generateValues;
    /**
     * Draw the PDP in the given location
     *
     * @returns {void} Draw the PDP in the given location.
     * @param {string} x - The x co-ordinate.
     * @param {string} y - The y co-ordinate.
     * @private
     */
    private drawPDP;
    /**
     * Draw the Timing Pattern
     *
     * @returns {void} Draw the PDP in the given location.
     * @private
     */
    private drawTimingPattern;
    private initialize;
    /**
     * Adds quietzone to the QR Barcode..\
     *
     * @returns {void}  Adds quietzone to the QR Barcode. .
     * @private
     */
    private addQuietZone;
    /**
     * Draw the Format Information.\
     *
     * @returns {void} Draw the Format Information .
     * @private
     */
    private drawFormatInformation;
    /**
     * Allocates the Encoded Data and then Mask
     *
     * @param Data - Encoded Data
     */
    private dataAllocationAndMasking;
    /**
     *  Allocates Format and Version Information.\
     *
     * @returns {void}  Allocates Format and Version Information.
     * @private
     */
    private allocateFormatAndVersionInformation;
    /**
     *Draw the Alignment Pattern in the given location.\
     *
     * @returns {void} Draw the Alignment Pattern in the given location .
     *  @param {HTMLElement} x - Provide the canvas element .
     *  @param {HTMLElement} y - Provide the canvas element .
     * @private
     */
    private drawAlignmentPattern;
    /**
     *Gets the Allignment pattern coordinates of the current version.\
     *
     * @returns {number[]}Gets the Allignment pattern coordinates of the current version. .
     * @private
     */
    private getAlignmentPatternCoOrdinates;
    /**
     * Encode the Input Data
     */
    private encodeData;
    /**
     *  Converts string value to Boolean\
     *
     * @returns {boolean[]}  Converts string value to Boolean .
     *  @param {HTMLElement} numberInString - Provide the canvas element .
     *  @param {number} noOfBits - Provide the canvas element .
     * @private
     */
    private stringToBoolArray;
    /**
     *  Converts Integer value to Boolean\
     *
     * @returns {boolean[]}  Converts Integer value to Boolean .
     * @param {HTMLElement} number -The Integer value .
     * @param {number} noOfBits - Number of Bits .
     * @private
     */
    private intToBoolArray;
    /**
     *  Splits the Code words\
     *
     * @returns {boolean[]}  Splits the Code words .
     * @param {HTMLElement} ds -The Encoded value Blocks .
     * @param {number} blk - Index of Block Number .
     * @param {number} count -  Length of the Block .
     * @private
     */
    private splitCodeWord;
    /**
     *  Creates the Blocks\
     *
     * @returns {boolean[]} Creates the Blocks .
     * @param {HTMLElement} encodeData -The Encoded value. .
     * @param {number} noOfBlocks -Number of Blocks .
     * @private
     */
    private createBlocks;
}
/** @private */
export declare class ModuleValue {
    isBlack: boolean;
    isFilled: boolean;
    isPdp: boolean;
    constructor();
}
