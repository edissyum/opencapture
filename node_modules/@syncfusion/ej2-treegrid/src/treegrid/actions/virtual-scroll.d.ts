import { TreeGrid } from '../base/treegrid';
import { VirtualScroll as GridVirtualScroll, IGrid, ServiceLocator } from '@syncfusion/ej2-grids';
/**
 * TreeGrid Virtual Scroll module will handle Virtualization
 *
 * @hidden
 */
export declare class VirtualScroll {
    private parent;
    private expandCollapseRec;
    private prevstartIndex;
    private prevendIndex;
    private visualData;
    /**
     * Constructor for VirtualScroll module
     *
     * @param {TreeGrid} parent - Tree Grid instance
     */
    constructor(parent?: TreeGrid);
    private returnVisualData;
    /**
     * For internal use only - Get the module name.
     *
     * @private
     * @returns {string} - Returns VirtualScroll module name
     */
    protected getModuleName(): string;
    /**
     * @hidden
     * @returns {void}
     */
    addEventListener(): void;
    /**
     * @hidden
     * @returns {void}
     */
    removeEventListener(): void;
    private collapseExpandVirtualchilds;
    private virtualPageAction;
    /**
     * To destroy the virtualScroll module
     *
     * @returns {void}
     * @hidden
     */
    destroy(): void;
}
export declare class TreeVirtual extends GridVirtualScroll {
    constructor(parent: IGrid, locator?: ServiceLocator);
    getModuleName(): string;
    protected instantiateRenderers(): void;
    ensurePageSize(): void;
}
