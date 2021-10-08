import { ChildProperty } from '@syncfusion/ej2-base';
export declare const toolbarItems: string[];
/**
 * Specifies the Toolbar settings of the FileManager.
 */
export declare class ToolbarSettings extends ChildProperty<ToolbarSettings> {
    /**
     * An array of string or object that is used to configure the toolbar items.
     *
     * @default toolbarItems
     */
    items: string[];
    /**
     * Enables or disables the toolbar rendering in the file manager component.
     *
     * @default true
     */
    visible: boolean;
}
