import { Gantt } from '../base/gantt';
/**
 * Configures columnMenu collection in Gantt.
 */
export declare class ColumnMenu {
    private parent;
    constructor(parent?: Gantt);
    /**
     * @returns {HTMLAllCollection} .
     * To get column menu collection.
     */
    getColumnMenu(): HTMLElement;
    destroy(): void;
    /**
     * For internal use only - Get the module name.
     *
     * @returns {string} .
     * @private
     */
    private getModuleName;
}
