import { TextStyleModel } from './tooltip-model';
import { Tooltip } from './tooltip';
import { TooltipTheme } from './enum';
/**
 * Specifies the Theme style for chart and accumulation.
 */
export interface ITooltipThemeStyle {
    tooltipFill: string;
    tooltipBoldLabel: string;
    tooltipLightLabel: string;
    tooltipHeaderLine: string;
}
export interface IBlazorTemplate {
    name: string;
    parent: object;
}
export interface ITooltipEventArgs {
    /** Defines the name of the event */
    name: string;
    /** Defines the event cancel status */
    cancel: boolean;
}
export interface ITooltipRenderingEventArgs extends ITooltipEventArgs {
    /** Defines tooltip text collections */
    text?: string;
    /** Defines tooltip text style */
    textStyle?: TextStyleModel;
    /** Defines the current Tooltip instance */
    tooltip: Tooltip;
}
export interface ITooltipAnimationCompleteArgs extends ITooltipEventArgs {
    /** Defines the current Tooltip instance */
    tooltip: Tooltip;
}
export interface ITooltipLoadedEventArgs extends ITooltipEventArgs {
    /** Defines the current Tooltip instance */
    tooltip: Tooltip;
}
/** @private */
export declare function getTooltipThemeColor(theme: TooltipTheme): ITooltipThemeStyle;
