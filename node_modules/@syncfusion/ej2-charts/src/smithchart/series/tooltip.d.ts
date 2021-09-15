import { Smithchart } from '../../smithchart';
import { Tooltip } from '@syncfusion/ej2-svg-base';
/**
 * To render tooltip
 */
export declare class TooltipRender {
    private mouseX;
    private mouseY;
    private locationX;
    private locationY;
    /** To define the tooltip element */
    tooltipElement: Tooltip;
    smithchartMouseMove(smithchart: Smithchart, e: PointerEvent): Tooltip;
    private setMouseXY;
    private createTooltip;
    private closestPointXY;
    /**
     * Get module name.
     *
     * @returns {string} It returns module name
     */
    protected getModuleName(): string;
    /**
     * To destroy the legend.
     *
     * @returns {void}
     * @private
     */
    destroy(): void;
}
