import { Gantt } from '../base/gantt';
/**
 * To handle column reorder action from TreeGrid
 */
export declare class Reorder {
    parent: Gantt;
    constructor(gantt: Gantt);
    /**
     * Get module name
     *
     * @returns {string} .
     */
    private getModuleName;
    /**
     * To bind reorder events.
     *
     * @returns {void} .
     * @private
     */
    private bindEvents;
    /**
     * To destroy the column-reorder.
     *
     * @returns {void} .
     * @private
     */
    destroy(): void;
}
