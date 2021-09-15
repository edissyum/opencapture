import { Maps } from '../../index';
import { ExportType } from '../utils/enum';
/**
 * This module enables the export to Image functionality in Maps control.
 *
 * @hidden
 */
export declare class ImageExport {
    private control;
    /**
     * Constructor for Maps
     *
     * @param {Maps} control - Specifies the instance of the map
     */
    constructor(control: Maps);
    /**
     * To export the file as image/svg format
     *
     * @param {ExportType} type - Specifies the type of the image file
     * @param {string} fileName - Specifies the file name of the image file
     * @param {boolean} allowDownload - Specifies whether to download image as a file or not.
     * @returns {Promise<string>} - Returns the promise string.
     * @private
     */
    export(type: ExportType, fileName: string, allowDownload?: boolean): Promise<string>;
    /**
     * Get module name.
     *
     * @returns {string} - Returns the module name
     */
    protected getModuleName(): string;
    /**
     * To destroy the ImageExport.
     *
     * @param {Maps} maps - Specifies the instance of the maps.
     * @returns {void}
     * @private
     */
    destroy(maps: Maps): void;
}
