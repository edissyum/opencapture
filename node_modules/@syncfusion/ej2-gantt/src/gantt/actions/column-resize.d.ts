import { Gantt } from '../base/gantt';
/**
 * Column resize action related code goes here
 */
export declare class Resize {
    parent: Gantt;
    constructor(gantt: Gantt);
    /**
     * Get module name
     *
     * @returns {void} .
     */
    private getModuleName;
    /**
     * To bind resize events.
     *
     * @returns {void} .
     * @private
     */
    private bindEvents;
    /**
     * To destroy the column-resizer.
     *
     * @returns {void} .
     * @private
     */
    destroy(): void;
}
