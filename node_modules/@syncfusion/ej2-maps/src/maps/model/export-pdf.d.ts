import { Maps } from '../../index';
import { ExportType } from '../utils/enum';
import { PdfPageOrientation } from '@syncfusion/ej2-pdf-export';
/**
 * This module enables the export to PDF functionality in Maps control.
 *
 * @hidden
 */
export declare class PdfExport {
    private control;
    /**
     * Constructor for Maps
     *
     * @param {Maps} control Specifies the instance of the map
     */
    constructor(control: Maps);
    /**
     * To export the file as image/svg format
     *
     * @param {ExportType} type - Specifies the type of the document
     * @param {string} fileName - Specifies the file name of the document
     * @param {boolean} allowDownload - Specifies whether to download the document or not
     * @param {PdfPageOrientation} orientation - Specifies the orientation of the PDF document to export the component
     * @returns {Promise<string>} - Returns the promise string
     * @private
     */
    export(type: ExportType, fileName: string, allowDownload?: boolean, orientation?: PdfPageOrientation): Promise<string>;
    /**
     * Get module name.
     *
     * @returns {string} - Returns the module name
     */
    protected getModuleName(): string;
    /**
     * To destroy the PdfExports.
     *
     * @param {Maps} maps - Specifies the instance of the maps.
     * @returns {void}
     * @private
     */
    destroy(maps: Maps): void;
}
