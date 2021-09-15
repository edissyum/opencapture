import { HeatMap } from '../../index';
import { ExportType } from '../utils/enum';
import { PdfPageOrientation } from '@syncfusion/ej2-pdf-export';
export declare class ExportUtils {
    private control;
    private printWindow;
    /**
     * Constructor for Heatmap
     *
     * @param  {HeatMap} control - specifies the control
     *
     */
    constructor(control: HeatMap);
    /**
     * To export the file as image/svg format
     *
     * @param type
     * @param fileName
     * @private
     */
    export(type: ExportType, fileName: string, orientation?: PdfPageOrientation): void;
    /**
     * To trigger the download element
     *
     * @param fileName
     * @param type
     * @param url
     * @private
     */
    triggerDownload(fileName: string, type: ExportType, url: string, isDownload: boolean): void;
    /**
     * To get the maximum size value
     *
     * @param controls
     * @param name
     */
    private getControlsValue;
    private createCanvas;
    private exportPdf;
    private doExport;
    private exportImage;
    /**
     * To print the heatmap elements.
     *
     * @param elements
     * @private
     */
    print(): void;
    /**
     * To get the html string of the heatmap.
     *
     * @param elements
     * @private
     */
    private getHTMLContent;
}
