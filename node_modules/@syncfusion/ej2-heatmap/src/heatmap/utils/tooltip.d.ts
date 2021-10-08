/**
 * HeatMap tool tip file
 */
import { ChildProperty } from '@syncfusion/ej2-base';
import { HeatMap } from '../heatmap';
import { CurrentRect } from '../utils/helper';
import { Tooltip as tool } from '@syncfusion/ej2-svg-base';
import { TooltipBorderModel, FontModel } from '../model/base-model';
/**
 * Configures the color property in Heatmap.
 */
export declare class TooltipSettings extends ChildProperty<TooltipSettings> {
    /**
     * Custom template to format the ToolTip content.
     *
     * @default ''
     */
    template: string;
    /**
     * Specifies the color collection for heat map cell.
     *
     * @default ''
     */
    fill: string;
    /**
     * Specifies the cell border style.
     *
     * @default ''
     */
    border: TooltipBorderModel;
    /**
     * Specifies the cell label style.
     *
     * @default ''
     */
    textStyle: FontModel;
}
/**
 *
 * The `Tooltip` module is used to render the tooltip for heatmap series.
 */
export declare class Tooltip {
    private heatMap;
    private isFirst;
    isFadeout: boolean;
    tooltipObject: tool;
    constructor(heatMap?: HeatMap);
    /**
     * Get module name
     */
    protected getModuleName(): string;
    /**
     * To show/hide Tooltip.
     *
     * @private
     */
    showHideTooltip(isShow: boolean, isFadeout?: boolean): void;
    /**
     * To destroy the Tooltip.
     *
     * @returns {void}
     * @private
     */
    destroy(): void;
    /**
     * To add Tooltip to the rect cell.
     *
     * @returns {void}
     * @private
     */
    private createTooltip;
    /**
     * To create div container for tooltip.
     *
     * @returns {void}
     * @private
     */
    createTooltipDiv(heatMap: HeatMap): void;
    /**
     * To get default tooltip content.
     *
     * @private
     */
    private getTooltipContent;
    /**
     * To render tooltip.
     *
     * @private
     */
    renderTooltip(currentRect: CurrentRect): void;
    /**
     * To render tooltip.
     */
    private tooltipCallback;
}
