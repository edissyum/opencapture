/**
 * PdfWriter.ts class for EJ2-PDF
 */
import { StreamWriter } from '@syncfusion/ej2-file-utils';
import { PdfDocumentBase } from './../document/pdf-document-base';
import { IPdfWriter } from './../../interfaces/i-pdf-writer';
import { IPdfPrimitive } from './../../interfaces/i-pdf-primitives';
/**
 * Used to `write a string` into output file.
 * @private
 */
export declare class PdfWriter implements IPdfWriter {
    /**
     * Specifies the current `position`.
     * @private
     */
    private currentPosition;
    /**
     * Specifies the `length` of the stream.
     * @private
     */
    private streamLength;
    /**
     * Check wheather the stream `can seek` or not.
     * @private
     */
    private cannotSeek;
    /**
     * Specifies the parent `document`.
     * @private
     */
    private pdfDocument;
    /**
     * Specifies the `stream`.
     * @private
     */
    private streamWriter;
    /**
     * Initialize an instance of `PdfWriter` class.
     * @private
     */
    constructor(stream: StreamWriter);
    /**
     * Gets and Sets the `document`.
     * @private
     */
    document: PdfDocumentBase;
    /**
     * Gets the `position`.
     * @private
     */
    readonly position: number;
    /**
     * Gets  the `length` of the stream'.
     * @private
     */
    readonly length: number;
    /**
     * Gets the `stream`.
     * @private
     */
    readonly stream: StreamWriter;
    /**
     * `Writes the specified data`.
     * @private
     */
    write(overload: IPdfPrimitive | number | string | number[]): void;
}
