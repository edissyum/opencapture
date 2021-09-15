import { StreamWriter } from '@syncfusion/ej2-file-utils';
import { DocumentHelper } from '../viewer';
/**
 * Exports the document to Text format.
 */
export declare class TextExport {
    private getModuleName;
    /**
     * @private
     */
    pageContent: string;
    private curSectionIndex;
    private sections;
    private document;
    private lastPara;
    private mSections;
    private inField;
    /**
     * @private
     * @param {DocumentHelper} documentHelper - Document helper.
     * @param {string} fileName - Specified file name.
     * @return {void}
     */
    save(documentHelper: DocumentHelper, fileName: string): void;
    /**
     * Save text document as Blob.
     *
     * @private
     * @param {DocumentHelper} documentHelper - Document helper.
     * @return {Promise<Blob>} - Returns promise object.
     */
    saveAsBlob(documentHelper: DocumentHelper): Promise<Blob>;
    private serialize;
    /**
     * @private
     * @param document
     */
    setDocument(document: any): void;
    /**
     * @private
     * @param streamWriter - Stream writer instance.
     * @return {void}
     */
    writeInternal(streamWriter?: StreamWriter): void;
    private writeBody;
    private writeParagraph;
    private writeTable;
    private writeHeadersFooters;
    private writeHeaderFooter;
    private writeSectionEnd;
    private writeNewLine;
    private writeText;
    private updateLastParagraph;
    /**
     * @private
     * @returns {void}
     */
    destroy(): void;
}
