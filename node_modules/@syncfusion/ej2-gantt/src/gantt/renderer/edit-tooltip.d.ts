import { Gantt } from '../base/gantt';
import { Tooltip } from '@syncfusion/ej2-popups';
import { TaskbarEdit } from '../actions/taskbar-edit';
/**
 * File for handling taskbar editing tooltip in Gantt.
 */
export declare class EditTooltip {
    parent: Gantt;
    toolTipObj: Tooltip;
    taskbarTooltipContainer: HTMLElement;
    taskbarTooltipDiv: HTMLElement;
    private taskbarEdit;
    constructor(gantt: Gantt, taskbarEdit: TaskbarEdit);
    /**
     * To create tooltip.
     *
     * @param {string} opensOn .
     * @param {boolean} mouseTrail .
     * @param {string} target .
     * @returns {void}
     * @private
     */
    createTooltip(opensOn: string, mouseTrail: boolean, target?: string): void;
    /**
     * Method to update tooltip position
     *
     * @param {TooltipEventArgs} args .
     * @returns {void} .
     */
    private updateTooltipPosition;
    /**
     * To show/hide taskbar edit tooltip.
     *
     * @param {boolean} bool .
     * @param {number} segmentIndex .
     * @returns {void}
     * @private
     */
    showHideTaskbarEditTooltip(bool: boolean, segmentIndex: number): void;
    /**
     * To update tooltip content and position.
     *
     * @param {number} segmentIndex .
     * @returns {void} .
     * @private
     */
    updateTooltip(segmentIndex: number): void;
    /**
     * To get updated tooltip text.
     *
     * @param {number} segmentIndex .
     * @returns {void} .
     * @private
     */
    private getTooltipText;
}
