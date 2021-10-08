import { TreeMap } from '../treemap';
/**
 * Render Tooltip
 */
export declare class TreeMapTooltip {
    private treemap;
    private tooltipSettings;
    private svgTooltip;
    private isTouch;
    private tooltipId;
    private clearTimeout;
    constructor(treeMap: TreeMap);
    renderTooltip(e: PointerEvent): void;
    private addTooltip;
    mouseUpHandler(e: PointerEvent): void;
    removeTooltip(): void;
    /**
     * To bind events for tooltip module
     */
    addEventListener(): void;
    /**
     * To unbind events for tooltip module
     */
    removeEventListener(): void;
    /**
     * Get module name.
     *
     * @returns {string} returns string
     */
    protected getModuleName(): string;
    /**
     * To destroy the tooltip.
     *
     * @param {TreeMap} treeMap - Specifies the instance of the treemap
     * @returns {void}
     * @private
     */
    destroy(treeMap: TreeMap): void;
}
