import { Gantt } from '../base/gantt';
/**
 * Gantt Excel Export module
 *
 * @hidden
 */
export declare class ExcelExport {
    private parent;
    /**
     * Constructor for Excel Export module
     *
     * @param {Gantt} gantt .
     */
    constructor(gantt: Gantt);
    /**
     * For internal use only - Get the module name.
     *
     * @returns {string} .
     * @private
     */
    protected getModuleName(): string;
    /**
     * To destroy excel export module.
     *
     * @returns {void} .
     * @private
     */
    destroy(): void;
    /**
     * To bind excel exporting events.
     *
     * @returns {void} .
     * @private
     */
    private bindEvents;
}
