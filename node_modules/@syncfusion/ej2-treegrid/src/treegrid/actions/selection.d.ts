import { TreeGrid } from '../base/treegrid';
/**
 * TreeGrid Selection module
 *
 * @hidden
 */
export declare class Selection {
    private parent;
    private columnIndex;
    private selectedItems;
    private selectedIndexes;
    private filteredList;
    /**
     * Constructor for Selection module
     *
     * @param {TreeGrid} parent - Tree Grid instance
     */
    constructor(parent: TreeGrid);
    /**
     * For internal use only - Get the module name.
     *
     * @private
     * @returns {string} Returns Selection module name
     */
    private getModuleName;
    addEventListener(): void;
    removeEventListener(): void;
    /**
     * To destroy the Selection
     *
     * @returns {void}
     * @hidden
     */
    destroy(): void;
    private checkboxSelection;
    private triggerChkChangeEvent;
    private getCheckboxcolumnIndex;
    private headerCheckbox;
    private renderColumnCheckbox;
    private columnCheckbox;
    selectCheckboxes(rowIndexes: number[]): void;
    private traverSelection;
    private getFilteredChildRecords;
    private updateParentSelection;
    private headerSelection;
    private updateSelectedItems;
    private updateGridActions;
    getCheckedrecords(): Object[];
    getCheckedRowIndexes(): number[];
}
