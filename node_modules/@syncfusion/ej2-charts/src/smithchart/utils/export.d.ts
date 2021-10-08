import { Smithchart } from '../../index';
import { SmithchartExportType } from '../utils/enum';
import { PdfPageOrientation } from '@syncfusion/ej2-pdf-export';
/**
 * Annotation Module handles the Annotation for Maps
 */
export declare class ExportUtils {
    private control;
    private smithchartPrint;
    /**
     * Constructor for Maps
     *
     * @param {Smithchart} control smithchart instance
     */
    constructor(control: Smithchart);
    /**
     * To print the Maps
     *
     * @param {string} elements html element
     * @returns {void}
     */
    print(elements?: string[] | string | Element): void;
    /**
     * To get the html string of the Maps
     *
     * @param {string} svgElements svg element
     * @private
     * @returns {Element} content of the html element
     */
    getHTMLContent(svgElements?: string[] | string | Element): Element;
    /**
     * To export the file as image/svg format
     *
     * @param {SmithchartExportType} exportType export type
     * @param {string} fileName export file name
     * @param {PdfPageOrientation} orientation orientation of the page
     * @returns {void}
     */
    export(exportType: SmithchartExportType, fileName: string, orientation?: PdfPageOrientation): void;
    /**
     * To trigger the download element
     *
     * @param {string} fileName export file name
     * @param {SmithchartExportType} exportType export type
     * @param {string} url file url
     * @param {boolean} isDownload download
     */
    triggerDownload(fileName: string, exportType: SmithchartExportType, url: string, isDownload: boolean): void;
}
