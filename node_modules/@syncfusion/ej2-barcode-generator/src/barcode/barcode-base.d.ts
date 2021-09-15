import { BaseAttributes } from './rendering/canvas-interface';
import { Rect } from './primitives/rect';
import { MarginModel } from './primitives/margin-model';
import { DisplayTextModel } from './primitives/displaytext-model';
import { BarcodeType, Alignment, DataMatrixEncoding, DataMatrixSize } from './enum/enum';
/**
 * defines the common methods for the barcode
 */
export declare abstract class BarcodeBase {
    abstract validateInput(char: string, characters: string): boolean | string;
    abstract drawImage(canvas: HTMLCanvasElement, options: BaseAttributes[], labelPosition: number, barcodeSize: Rect, endValue: number, textRender: string): void;
    abstract getDrawableSize(margin: MarginModel, widthValue: number, height: number): void;
    height: string | number;
    width: string | number;
    margin: MarginModel;
    displayText: DisplayTextModel;
    value: string;
    foreColor: string;
    type: BarcodeType;
    isSvgMode: boolean;
    alignment: Alignment;
    enableCheckSum: boolean;
    encodingValue: DataMatrixEncoding;
    size: DataMatrixSize;
}
