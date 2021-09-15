import { Gantt } from '../base/gantt';
import { Tooltip as TooltipComponent, TooltipEventArgs } from '@syncfusion/ej2-popups';
import { IGanttData, PredecessorTooltip } from '../base/interface';
import { EventMarkerModel } from '../models/models';
/**
 * File for handling tooltip in Gantt.
 */
export declare class Tooltip {
    parent: Gantt;
    toolTipObj: TooltipComponent;
    private predecessorTooltipData;
    private currentTarget;
    private tooltipMouseEvent;
    constructor(gantt: Gantt);
    /**
     * To create tooltip.
     *
     * @returns {void} .
     * @private
     */
    createTooltip(): void;
    private tooltipBeforeRender;
    private tooltipCloseHandler;
    private mouseMoveHandler;
    /**
     * Method to update tooltip position
     *
     * @param {TooltipEventArgs} args .
     * @returns {void} .
     */
    private updateTooltipPosition;
    /**
     * Method to get mouse pointor position
     *
     * @param {Event} e .
     * @returns {number} .
     */
    private getPointorPosition;
    /**
     *  Getting tooltip content for different elements
     *
     * @param {string} elementType .
     * @param {IGanttData} ganttData .
     * @param {Gantt} parent .
     * @param {TooltipEventArgs} args .
     * @returns {string} .
     */
    private getTooltipContent;
    /**
     * To get the details of an event marker.
     *
     * @param {TooltipEventArgs} args .
     * @returns {EventMarkerModel} .
     * @private
     */
    getMarkerTooltipData(args: TooltipEventArgs): EventMarkerModel;
    /**
     * To get the details of a connector line.
     *
     * @param {TooltipEventArgs} args .
     * @returns {PredecessorTooltip} .
     * @private
     */
    getPredecessorTooltipData(args: TooltipEventArgs): PredecessorTooltip;
    /**
     * To compile template string.
     *
     * @param {string} template .
     * @param {Gantt} parent .
     * @param {IGanttData|PredecessorTooltip} data .
     * @param {string} propName .
     * @returns {NodeList} .
     * @private
     */
    templateCompiler(template: string, parent: Gantt, data: IGanttData | PredecessorTooltip, propName: string): NodeList;
    private destroy;
}
