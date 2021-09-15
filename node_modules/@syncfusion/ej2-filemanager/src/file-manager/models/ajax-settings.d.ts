import { ChildProperty } from '@syncfusion/ej2-base';
/**
 * Specifies the Ajax settings of the File Manager.
 */
export declare class AjaxSettings extends ChildProperty<AjaxSettings> {
    /**
     * Specifies URL to download the files from server.
     *
     * @default null
     */
    downloadUrl: string;
    /**
     * Specifies URL to get the images from server.
     *
     * @default null
     */
    getImageUrl: string;
    /**
     * Specifies URL to upload the files to server.
     *
     * @default null
     */
    uploadUrl: string;
    /**
     * Specifies URL to read the files from server.
     *
     * @default null
     */
    url: string;
}
