import { ChildProperty } from '@syncfusion/ej2-base';
/**
 * Specifies the navigationpane settings of the File Manager.
 */
export declare class NavigationPaneSettings extends ChildProperty<NavigationPaneSettings> {
    /**
     * Specifies the maximum width of navigationpane.
     *
     * @default '650px'
     */
    maxWidth: string | number;
    /**
     * Specifies the minimum width of navigationpane.
     *
     * @default '240px'
     */
    minWidth: string | number;
    /**
     * Enables or disables the navigation pane.
     *
     * @default true
     */
    visible: boolean;
}
