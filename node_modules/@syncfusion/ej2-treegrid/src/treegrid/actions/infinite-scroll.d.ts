import { TreeGrid } from '../base/treegrid';
/**
 * TreeGrid Infinite Scroll module will handle Infinite Scrolling.
 *
 * @hidden
 */
export declare class InfiniteScroll {
    private parent;
    private visualData;
    /**
     * Constructor for VirtualScroll module
     *
     * @param {TreeGrid} parent - Tree Grid instance
     */
    constructor(parent?: TreeGrid);
    /**
     * For internal use only - Get the module name.
     *
     * @private
     * @returns {string} - Returns Logger module name
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
    /**
     * Handles the Expand Collapse action for Remote data with infinite scrolling.
     *
     * @param {{ index: number, childData: ITreeData[] }} args - expanded row index and its child data
     * @param { number } args.index - expanded row index
     * @param { ITreeData[] } args.childData - child data of expanded row
     * @returns {void}
     */
    private infiniteRemoteExpand;
    /**
     * Resetted the row index for expand collapse action for cache support.
     *
     * @returns {void}
     */
    private contentready;
    /**
     * Handles the page query for Data operations and CRUD actions.
     *
     * @param {{ result: ITreeData[], count: number, actionArgs: object }} pageingDetails - data, its count and action details
     * @param {ITreeData[]} pageingDetails.result - data on scroll action
     * @param {number} pageingDetails.count - data count on scroll action
     * @param {Object} pageingDetails.actionArgs - scroll action details
     * @returns {void}
     */
    private infinitePageAction;
    /**
     * Handles the currentviewdata for delete operation.
     *
     * @param {{ e: InfiniteScrollArgs, result: Object[] }} args - Scroller and data details
     * @param {InfiniteScrollArgs} args.e -  scroller details while CRUD
     * @param {Object[]} args.result - data details while CRUD
     * @returns {void}
     */
    private infiniteEditHandler;
    /**
     * Handles the row objects for delete operation.
     *
     * @param {ActionEventArgs} args - crud action details
     * @returns {void}
     */
    private infiniteDeleteHandler;
    /**
     * Handles the row objects for delete operation.
     *
     * @param {Element[]} rowElms - row elements
     * @param {Row<Column>[]} rows - Row object collection
     * @param {Object[]} data - data collection
     * @param {string} keyField - primary key name
     * @param { boolean} isFrozen - Specifies whether frozen column enabled
     * @returns {void}
     */
    private removeRows;
    /**
     * Handles the row objects for Add operation.
     */
    private createRows;
    /**
     * To destroy the infiniteScroll module
     *
     * @returns {void}
     * @hidden
     */
    destroy(): void;
}
