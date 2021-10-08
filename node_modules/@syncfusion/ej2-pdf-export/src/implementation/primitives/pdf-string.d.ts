/**
 * PdfString.ts class for EJ2-PDF
 */
import { IPdfPrimitive } from './../../interfaces/i-pdf-primitives';
import { IPdfWriter } from './../../interfaces/i-pdf-writer';
import { ObjectStatus } from './../input-output/enum';
import { PdfCrossTable } from './../input-output/pdf-cross-table';
/**
 * `PdfString` class is used to perform string related primitive operations.
 * @private
 */
export declare namespace InternalEnum {
    /**
     * public Enum for `ForceEncoding`.
     * @private
     */
    enum ForceEncoding {
        /**
         * Specifies the type of `None`.
         * @private
         */
        None = 0,
        /**
         * Specifies the type of `Ascii`.
         * @private
         */
        Ascii = 1,
        /**
         * Specifies the type of `Unicode`.
         * @private
         */
        Unicode = 2
    }
}
export declare class PdfString implements IPdfPrimitive {
    /**
     * `General markers` for string.
     * @private
     */
    static readonly stringMark: string;
    /**
     * `Hex markers` for string.
     * @private
     */
    static readonly hexStringMark: string;
    /**
     * Format of password data.
     * @private
     */
    private static readonly hexFormatPattern;
    /**
     * Value of the object.
     * @private
     */
    private stringValue;
    /**
     * The byte data of the string.
     * @private
     */
    private data;
    /**
     * Value indicating whether the string was converted to hex.
     * @default false
     * @private
     */
    private bHex;
    /**
     * Shows the type of object `status` whether it is object registered or other status;
     * @private
     */
    private status1;
    /**
     * Indicates if the object is currently in `saving state or not`.
     * @private
     */
    private isSaving1;
    /**
     * Internal variable to store the `position`.
     * @default -1
     * @private
     */
    private position1;
    /**
     * Internal variable to hold `PdfCrossTable` reference.
     * @private
     */
    private crossTable;
    /**
     * Internal variable to hold `cloned object`.
     * @default null
     * @private
     */
    private clonedObject1;
    /**
     * Indicates whether to check if the value `has unicode characters`.
     * @private
     */
    private bConverted;
    /**
     * Indicates whether we should convert `data to Unicode`.
     * @private
     */
    private bForceEncoding;
    /**
     * `Shows` if the data of the stream was decrypted.
     * @default false
     * @private
     */
    private bDecrypted;
    /**
     * Holds the `index` number of the object.
     * @private
     */
    private index1;
    /**
     * Shows if the data of the stream `was decrypted`.
     * @default false
     * @private
     */
    private isParentDecrypted;
    /**
     * Gets a value indicating whether the object is `packed or not`.
     * @default false
     * @private
     */
    private isPacked;
    /**
     * @hidden
     * @private
     */
    isFormField: boolean;
    /**
     * @hidden
     * @private
     */
    isColorSpace: boolean;
    /**
     * @hidden
     * @private
     */
    isHexString: boolean;
    /**
     * @hidden
     * @private
     */
    private encodedBytes;
    /**
     * Initializes a new instance of the `PdfString` class.
     * @private
     */
    constructor();
    /**
     * Initializes a new instance of the `PdfString` class.
     * @private
     */
    constructor(value: string);
    /**
     * Gets a value indicating whether string is in `hex`.
     * @private
     */
    readonly hex: boolean;
    /**
     * Gets or sets string `value` of the object.
     * @private
     */
    value: string;
    /**
     * Gets or sets the `Status` of the specified object.
     * @private
     */
    status: ObjectStatus;
    /**
     * Gets or sets a value indicating whether this document `is saving` or not.
     * @private
     */
    isSaving: boolean;
    /**
     * Gets or sets the `index` value of the specified object.
     * @private
     */
    objectCollectionIndex: number;
    /**
     * Returns `cloned object`.
     * @private
     */
    readonly clonedObject: IPdfPrimitive;
    /**
     * Gets or sets the `position` of the object.
     * @private
     */
    position: number;
    /**
     * Returns `PdfCrossTable` associated with the object.
     * @private
     */
    readonly CrossTable: PdfCrossTable;
    /**
     * Gets a value indicating whether to check if the value has unicode characters.
     * @private
     */
    /**
    * sets a value indicating whether to check if the value has unicode characters.
    * @private
    */
    converted: boolean;
    /**
     * Gets value indicating whether we should convert data to Unicode.
     */
    encode: InternalEnum.ForceEncoding;
    /**
     * Converts `bytes to string using hex format` for representing string.
     * @private
     */
    static bytesToHex(bytes: number[]): string;
    /**
     * `Saves` the object using the specified writer.
     * @private
     */
    save(writer: IPdfWriter): void;
    pdfEncode(): string;
    private escapeSymbols;
    /**
     * Creates a `copy of PdfString`.
     * @private
     */
    clone(crossTable: PdfCrossTable): IPdfPrimitive;
    /**
     * Converts string to array of unicode symbols.
     */
    static toUnicodeArray(value: string, bAddPrefix: boolean): number[];
    /**
     * Converts byte data to string.
     */
    static byteToString(data: number[]): string;
}
