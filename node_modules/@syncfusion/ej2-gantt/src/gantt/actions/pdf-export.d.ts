import { PdfExportProperties } from './../base/interface';
import { Gantt } from '../base/gantt';
import { PdfGantt } from '../export/pdf-gantt';
/**
 *
 * @hidden
 */
export declare class PdfExport {
    private parent;
    private helper;
    private pdfDocument;
    gantt: PdfGantt;
    isPdfExport: boolean;
    /**
     * @param {Gantt} parent .
     * @hidden
     */
    constructor(parent?: Gantt);
    /**
     * @returns {string} .
     */
    private getModuleName;
    /**
     * To destroy Pdf export module.
     *
     * @returns {void} .
     * @private
     */
    destroy(): void;
    private initGantt;
    /**
     * @param {PdfExportProperties} pdfExportProperties .
     * @param {boolean} isMultipleExport .
     * @param {object} pdfDoc .
     * @returns {Promise<Object>} .
     */
    export(pdfExportProperties?: PdfExportProperties, isMultipleExport?: boolean, pdfDoc?: Object): Promise<Object>;
    private exportWithData;
    private processExport;
    private processSectionExportProperties;
    private getPageSize;
}
