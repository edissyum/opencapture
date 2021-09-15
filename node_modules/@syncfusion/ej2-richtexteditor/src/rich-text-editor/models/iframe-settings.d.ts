import { ChildProperty } from '@syncfusion/ej2-base';
import { ResourcesModel } from './iframe-settings-model';
/**
 * Objects used for configuring the iframe resources properties.
 */
export declare class Resources extends ChildProperty<Resources> {
    /**
     * Specifies styles that inject into iframe.
     *
     * @default []
     */
    styles: string[];
    /**
     * Specifies scripts that inject into iframe.
     *
     * @default []
     */
    scripts: string[];
}
/**
 * Configures the iframe settings of the RTE.
 */
export declare class IFrameSettings extends ChildProperty<IFrameSettings> {
    /**
     * Specifies whether to render iframe based editable element in RTE.
     *
     * @default false
     */
    enable: boolean;
    /**
     * Defines additional attributes to render iframe.
     *
     * @default 'null'
     */
    attributes: {
        [key: string]: string;
    };
    /**
     * The object used for inject styles and scripts.
     *
     * @default {}
     */
    resources: ResourcesModel;
}
