import { Gantt } from '../base/gantt';
/**
 * Gantt Virtual Scroll module will handle Virtualization
 *
 * @hidden
 */
export declare class VirtualScroll {
    private parent;
    constructor(parent?: Gantt);
    /**
     * Get module name
     *
     * @returns {void} .
     */
    protected getModuleName(): string;
    /**
     * Bind virtual-scroll related properties from Gantt to TreeGrid
     *
     * @returns {void} .
     */
    private bindTreeGridProperties;
    /**
     * @returns {number} .
     * @private
     */
    getTopPosition(): number;
    /**
     * To destroy the virtual scroll module.
     *
     * @returns {void} .
     * @private
     */
    destroy(): void;
}
