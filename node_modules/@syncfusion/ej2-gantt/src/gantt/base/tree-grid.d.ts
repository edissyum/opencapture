import { Gantt } from './gantt';
import { ColumnModel } from '@syncfusion/ej2-treegrid';
import { IGanttData } from './interface';
/**
 * TreeGrid related code goes here
 *
 * @param {object} args .
 * @returns {void} .
 */
export declare class GanttTreeGrid {
    private parent;
    private treeGridElement;
    treeGridColumns: ColumnModel[];
    /**
     * @private
     */
    currentEditRow: {};
    private previousScroll;
    /** @hidden */
    prevCurrentView: Object;
    constructor(parent: Gantt);
    private addEventListener;
    private renderReactTemplate;
    private createContainer;
    /**
     * Method to initiate TreeGrid
     *
     * @returns {void} .
     */
    renderTreeGrid(): void;
    private composeProperties;
    private getContentDiv;
    private getHeaderDiv;
    private getScrollbarWidth;
    /**
     * @returns {void} .
     * @private
     */
    ensureScrollBar(): void;
    private bindEvents;
    private beforeDataBound;
    private dataBound;
    private dataStateChange;
    private collapsing;
    private expanding;
    private collapsed;
    private expanded;
    private actionBegin;
    private created;
    private actionFailure;
    private queryCellInfo;
    private headerCellInfo;
    private rowDataBound;
    private columnMenuOpen;
    private columnMenuClick;
    private createExpandCollapseArgs;
    private objectEqualityChecker;
    private treeActionComplete;
    private updateKeyConfigSettings;
    /**
     * Method to bind internal events on TreeGrid element
     *
     * @returns {void} .
     */
    private wireEvents;
    private unWireEvents;
    private scrollHandler;
    /**
     * @returns {void} .
     * @private
     */
    validateGanttColumns(): void;
    /**
     *
     * @param {GanttColumnModel} column .
     * @param {boolean} isDefined .
     * @returns {void} .
     */
    private createTreeGridColumn;
    /**
     * Compose Resource columns
     *
     * @param {GanttColumnModel} column .
     * @returns {void} .
     */
    private composeResourceColumn;
    /**
     * @param {IGanttData} data .
     * @returns {object} .
     * @private
     */
    getResourceIds(data: IGanttData): object;
    /**
     * Create Id column
     *
     * @param {GanttColumnModel} column .
     * @returns {void} .
     */
    private composeIDColumn;
    private composeUniqueIDColumn;
    /**
     * Create progress column
     *
     * @param {GanttColumnModel} column .
     * @returns {void} .
     */
    private composeProgressColumn;
    /**
     * @param {GanttColumnModel} newGanttColumn .
     * @param {boolean} isDefined .
     * @returns {void} .
     */
    private bindTreeGridColumnProperties;
    private durationValueAccessor;
    private resourceValueAccessor;
    private workValueAccessor;
    private taskTypeValueAccessor;
    private modeValueAccessor;
    private idValueAccessor;
    private updateScrollTop;
    private treeGridClickHandler;
    private removeEventListener;
    private destroy;
}
