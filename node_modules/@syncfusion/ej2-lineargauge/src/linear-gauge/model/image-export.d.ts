import { LinearGauge } from '../../index';
import { ExportType } from '../utils/enum';
/**
 * Represent the print and export for gauge.
 *
 * @hidden
 */
export declare class ImageExport {
    private control;
    /**
     * Constructor for gauge
     *
     * @param control
     */
    constructor(control: LinearGauge);
    /**
     * To export the file as image/svg format
     *
     * @param type
     * @param fileName
     * @private
     */
    export(type: ExportType, fileName: string, allowDownload?: boolean): Promise<string>;
    /**
     * Get module name.
     */
    protected getModuleName(): string;
    /**
     * To destroy the ImageExport.
     *
     * @return {void}
     * @private
     */
    destroy(control: LinearGauge): void;
}
