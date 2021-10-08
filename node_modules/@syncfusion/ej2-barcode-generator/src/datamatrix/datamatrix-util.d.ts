import { DataMatrixEncoding, DataMatrixSize } from '../barcode/enum/enum';
import { DisplayTextModel } from '../barcode/primitives/displaytext-model';
import { MarginModel } from '../barcode/primitives/margin-model';
/**
 * DataMatrix used to calculate the DataMatrix barcode
 */
export declare class DataMatrix {
    /** @private */
    encodingValue: DataMatrixEncoding;
    /** @private */
    height: string | number;
    /** @private */
    width: string | number;
    /** @private */
    margin: MarginModel;
    /** @private */
    displayText: DisplayTextModel;
    /** @private */
    foreColor: string;
    /** @private */
    isSvgMode: boolean;
    /** @private */
    value: string;
    private barcodeRenderer;
    /** @private */
    size: DataMatrixSize;
    private mXDimension;
    private mDataMatrixArray;
    private actualColumns;
    private actualRows;
    /** @private */
    XDimension: number;
    private encodedCodeword;
    private mSymbolAttribute;
    private GetData;
    private fillZero;
    private DataMatrixNumericEncoder;
    private ComputeBase256Codeword;
    private DataMatrixBaseEncoder;
    private copy;
    private DataMatrixEncoder;
    private PrepareDataCodeword;
    private PdfDataMatrixSymbolAttribute;
    private getmSymbolAttributes;
    private PadCodewords;
    private EccProduct;
    /**
     *  Validate the given input to check whether the input is valid one or not.\
     *
     * @returns {boolean | string}  Validate the given input to check whether the input is valid one or not .
     * @param {HTMLElement} char - Provide the canvas element .
     * @param {HTMLElement} characters - Provide the canvas element .
     * @private
     */
    private validateInput;
    private ComputeErrorCorrection;
    private CreateLogArrays;
    private EccSum;
    private EccDoublify;
    private CreateRSPolynomial;
    private PrepareCodeword;
    private copyArray;
    private ecc200placementbit;
    private ecc200placementblock;
    private ecc200placementcornerD;
    private ecc200placementcornerA;
    private ecc200placementcornerB;
    private ecc200placementcornerC;
    private ecc200placement;
    private getActualRows;
    private getActualColumns;
    private AddQuiteZone;
    private drawImage;
    private CreateMatrix;
    private create1DMatrixArray;
    private create2DMartixArray;
    /**
     * Build the datamatrix.\
     *
     * @returns {number[] | string} Build the datamatrix .
     * @private
     */
    BuildDataMatrix(): number[] | string;
    private drawText;
    private getInstance;
    private drawDisplayText;
    private getDrawableSize;
    /**
     * Draw the barcode SVG.\
     *
     * @returns {void} Draw the barcode SVG .
     *  @param {HTMLElement} canvas - Provide the canvas element .
     * @private
     */
    draw(canvas: HTMLElement): void;
}
