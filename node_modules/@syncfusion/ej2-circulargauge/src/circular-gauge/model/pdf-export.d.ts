import { CircularGauge } from '../../index';
import { ExportType } from '../utils/enum';
import { PdfPageOrientation } from '@syncfusion/ej2-pdf-export';
/**
 * Represent the Pdf export for gauge
 *
 * @hidden
 */
export declare class PdfExport {
    private control;
    /**
     * Constructor for gauge
     *
     * @param {CircularGauge} control - Specfies the instance of the gauge.
     */
    constructor(control: CircularGauge);
    /**
     * To export the file as image/svg format
     *
     * @param {ExportType} type - Specifies the type of the document.
     * @param {string} fileName Specfies the file name of the document.
     * @param {PdfPageOrientation} orientation - Specfies the orientation of the PDF document to export the component.
     * @param {boolean} allowDownload - Specfies whether to download the document or not.
     * @returns {Promise<string>} - Returns the promise string
     * @private
     */
    export(type: ExportType, fileName: string, orientation?: PdfPageOrientation, allowDownload?: boolean): Promise<string>;
    protected getModuleName(): string;
    /**
     * To destroy the PdfExport.
     *
     * @param {CircularGauge} gauge - Specfies the instance of the gauge
     * @returns {void}
     * @private
     */
    destroy(gauge: CircularGauge): void;
}
