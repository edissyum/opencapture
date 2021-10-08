import { AccumulationChart } from '../accumulation';
import { BaseTooltip } from '../../common/user-interaction/tooltip';
/**
 * `AccumulationTooltip` module is used to render tooltip for accumulation chart.
 */
export declare class AccumulationTooltip extends BaseTooltip {
    accumulation: AccumulationChart;
    constructor(accumulation: AccumulationChart);
    /**
     * @hidden
     */
    private addEventListener;
    private mouseLeaveHandler;
    private mouseUpHandler;
    private mouseMoveHandler;
    /**
     * Renders the tooltip.
     * @param  {PointerEvent} event - Mouse move event.
     * @return {void}
     */
    tooltip(event: PointerEvent | TouchEvent): void;
    private renderSeriesTooltip;
    private triggerTooltipRender;
    private getPieData;
    /**
     * To get series from index
     */
    private getSeriesFromIndex;
    private getTooltipText;
    private findHeader;
    private parseTemplate;
    /**
     * Get module name
     */
    protected getModuleName(): string;
    /**
     * To destroy the Tooltip.
     * @return {void}
     * @private
     */
    destroy(chart: AccumulationChart): void;
}
