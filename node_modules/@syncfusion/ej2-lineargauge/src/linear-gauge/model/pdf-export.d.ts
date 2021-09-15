import { LinearGauge } from '../../index';
import { ExportType } from '../utils/enum';
import { PdfPageOrientation } from '@syncfusion/ej2-pdf-export';
/**
 * Represent the print and export for gauge.
 *
 * @hidden
 */
export declare class PdfExport {
    private control;
    /**
     * Constructor for gauge
     *
     * @param control
     */
    constructor(control: LinearGauge);
    /**
     * To export the file as pdf format
     *
     * @param type
     * @param fileName
     * @private
     */
    export(type: ExportType, fileName: string, orientation?: PdfPageOrientation, allowDownload?: boolean): Promise<string>;
    /**
     * Get module name.
     */
    protected getModuleName(): string;
    /**
     * To destroy the PdfExport.
     *
     * @return {void}
     * @private
     */
    destroy(control: LinearGauge): void;
}
