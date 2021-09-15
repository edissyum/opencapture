import { Tooltip } from '@syncfusion/ej2-popups';
import { Kanban } from '../base';
/**
 * Tooltip for Kanban board
 */
export declare class KanbanTooltip {
    private parent;
    tooltipObj: Tooltip;
    /**
     * Constructor for tooltip module
     *
     * @param {Kanban} parent Accepts the kanban instance
     */
    constructor(parent: Kanban);
    private renderTooltip;
    private onBeforeRender;
    private onBeforeClose;
    destroy(): void;
}
