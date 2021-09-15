import { ChildProperty } from '@syncfusion/ej2-base';
/**
 * Configures the inlineMode property of the RTE.
 */
export declare class InlineMode extends ChildProperty<InlineMode> {
    /**
     * Specifies whether enable/disable inline toolbar in RTE.
     *
     * @default false
     */
    enable: boolean;
    /**
     * Specifies the inline toolbar render based on with or without selection.
     *
     * @default true
     */
    onSelection: boolean;
}
