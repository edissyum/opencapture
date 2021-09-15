import { ChildProperty } from '@syncfusion/ej2-base';
export declare const fileItems: string[];
export declare const folderItems: string[];
export declare const layoutItems: string[];
/**
 * Specifies the ContextMenu settings of the File Manager.
 */
export declare class ContextMenuSettings extends ChildProperty<ContextMenuSettings> {
    /**
     * Specifies the array of string or object that is used to configure file items.
     *
     * @default fileItems
     */
    file: string[];
    /**
     * An array of string or object that is used to configure folder items.
     *
     * @default folderItems
     */
    folder: string[];
    /**
     * An array of string or object that is used to configure layout items.
     *
     * @default layoutItems
     */
    layout: string[];
    /**
     * Enables or disables the ContextMenu.
     *
     * @default true
     */
    visible: boolean;
}
