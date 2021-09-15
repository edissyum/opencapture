import { TreeMap } from '../../index';
import { ExportType } from '../utils/enum';
/**
 * ImageExport module handles the export to image functionality for treemap.
 *
 * @hidden
 */
export declare class ImageExport {
    private control;
    /**
     * Constructor for Maps
     *
     * @param {TreeMap} control - Specifies the treemap instance
     */
    constructor(control: TreeMap);
    /**
     * This method is used to perform the export functionality for the rendered treemap.
     *
     * @param {ExportType} type - Specifies the type of the image file.
     * @param {string} fileName - Specifies the file name of the image file.
     * @param {boolean} allowDownload - Specifies whether to download the file or not.
     * @returns {Promise} - Returns the promise string.
     * @private
     */
    export(type: ExportType, fileName: string, allowDownload?: boolean): Promise<string>;
    protected getModuleName(): string;
    /**
     * To destroy the ImageExport.
     *
     * @param {TreeMap} treemap - Specifies the instance of the treemap.
     * @returns {void}
     * @private
     */
    destroy(treemap: TreeMap): void;
}
