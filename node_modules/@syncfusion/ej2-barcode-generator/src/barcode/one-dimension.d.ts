import { BarcodeBase } from './barcode-base';
import { BaseAttributes } from './rendering/canvas-interface';
import { Rect } from './primitives/rect';
import { MarginModel } from './primitives/margin-model';
/**
 * onedimension class is used to render all type of one dimensional shapes
 */
export declare abstract class OneDimension extends BarcodeBase {
    private getInstance;
    /**
     * Return the drawable size of the rectangle .
     *
     * @returns {Rect} Return the drawable size of the rectangle.
     *  @param {MarginModel} margin - Specifies the filename of the barcode image to be download.
     *  @param {number} w - Specifies the filename of the barcode image to be download.
     *  @param {number} h - Defines the format of the barcode to be exported
     * @private
     */
    getDrawableSize(margin: MarginModel, w: number, h: number): Rect;
    private getBaseAttributes;
    private getBarLineRatio;
    private multipleWidth;
    private barCodeType;
    private checkStartValueCondition;
    private checkEndValueCondition;
    private getDisplayText;
    private checkExtraHeight;
    private getWidthValue;
    /**
     * Returns the module name of the barcode
     *
     * @param {number[] | string[]} code - Returns the code as string or number collection.
     * @param {HTMLElement} canvas - Returns the canvas.
     * @param {string} isUpcE - Returns the UPCE values as string.
     * @returns {void}  Calculate the barcode attribute
     * @private
     */
    calculateBarCodeAttributes(code: number[] | string[], canvas: HTMLElement, isUpcE?: string): void;
    private canIncrementCheck;
    private verticalTextMargin;
    private getAlignmentPosition;
    /**
     *Will draw the image for the barcode .
     *
     * @param {HTMLCanvasElement} canvas  Barcode canvas element.
     * @param {BaseAttributes []} options Barcode attributes .
     * @function drawImage
     * @returns {void} Export the barcode as an image in the specified image type and downloads it in the browser.
     * @memberof Barcode
     * @private
     */
    drawImage(canvas: HTMLCanvasElement, options: BaseAttributes[]): void;
    private updateDisplayTextSize;
    private alignDisplayText;
    private updateOverlappedTextPosition;
    private drawText;
}
