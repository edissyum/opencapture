/**
 * PdfStream.ts class for EJ2-PDF
 */
import { IPdfWriter } from './../../interfaces/i-pdf-writer';
import { PdfDictionary } from './pdf-dictionary';
import { UnicodeTrueTypeFont } from './../graphics/fonts/unicode-true-type-font';
/**
 * `PdfStream` class is used to perform stream related primitive operations.
 * @private
 */
export declare class PdfStream extends PdfDictionary {
    /**
     * @hidden
     * @private
     */
    private readonly dicPrefix;
    /**
     * @hidden
     * @private
     */
    private readonly dicSuffix;
    /**
     * @hidden
     * @private
     */
    private dataStream2;
    /**
     * @hidden
     * @private
     */
    private blockEncryption2;
    /**
     * @hidden
     * @private
     */
    private bDecrypted2;
    /**
     * @hidden
     * @private
     */
    private bCompress2;
    /**
     * @hidden
     * @private
     */
    private bEncrypted2;
    /**
     * Internal variable to hold `cloned object`.
     * @private
     */
    private clonedObject2;
    /**
     * @hidden
     * @private
     */
    private bCompress;
    /**
     * @hidden
     * @private
     */
    private isImageStream;
    /**
     * @hidden
     * @private
     */
    private isFontStream;
    /**
     * Event. Raise `before the object saves`.
     * @private
     */
    cmapBeginSave: SaveCmapEventHandler;
    /**
     * Event. Raise `before the object saves`.
     * @private
     */
    fontProgramBeginSave: SaveFontProgramEventHandler;
    /**
     * Initialize an instance for `PdfStream` class.
     * @private
     */
    constructor();
    /**
     * Initialize an instance for `PdfStream` class.
     * @private
     */
    constructor(dictionary: PdfDictionary, data: string[]);
    /**
     * Gets the `internal` stream.
     * @private
     */
    internalStream: string[];
    /**
     * Gets or sets 'is image' flag.
     * @private
     */
    isImage: boolean;
    /**
     * Gets or sets 'is font' flag.
     * @private
     */
    isFont: boolean;
    /**
     * Gets or sets `compression` flag.
     * @private
     */
    compress: boolean;
    /**
     * Gets or sets the `data`.
     * @private
     */
    data: string[];
    /**
     * `Clear` the internal stream.
     * @private
     */
    clearStream(): void;
    /**
     * `Writes` the specified string.
     * @private
     */
    write(text: string): void;
    /**
     * `Writes` the specified bytes.
     * @private
     */
    writeBytes(data: number[]): void;
    /**
     * Raises event `Cmap BeginSave`.
     * @private
     */
    onCmapBeginSave(): void;
    /**
     * Raises event `Font Program BeginSave`.
     * @private
     */
    protected onFontProgramBeginSave(): void;
    /**
     * `Compresses the content` if it's required.
     * @private
     */
    private compressContent;
    /**
     * `Adds a filter` to the filter array.
     * @private
     */
    addFilter(filterName: string): void;
    /**
     * `Saves` the object using the specified writer.
     * @private
     */
    save(writer: IPdfWriter): void;
    /**
     * Converts `bytes to string`.
     * @private
     */
    static bytesToString(byteArray: number[]): string;
}
export declare class SaveCmapEventHandler {
    /**
     * @hidden
     * @private
     */
    sender: UnicodeTrueTypeFont;
    /**
     * New instance for `save section collection event handler` class.
     * @private
     */
    constructor(sender: UnicodeTrueTypeFont);
}
export declare class SaveFontProgramEventHandler {
    /**
     * @hidden
     * @private
     */
    sender: UnicodeTrueTypeFont;
    /**
     * New instance for `save section collection event handler` class.
     * @private
     */
    constructor(sender: UnicodeTrueTypeFont);
}
