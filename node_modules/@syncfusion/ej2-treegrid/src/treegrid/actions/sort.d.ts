import { TreeGrid } from '../base/treegrid';
import { SortDirection } from '@syncfusion/ej2-grids';
/**
 * Internal dataoperations for TreeGrid
 *
 * @hidden
 */
export declare class Sort {
    private flatSortedData;
    private taskIds;
    private storedIndex;
    private parent;
    private isSelfReference;
    constructor(grid: TreeGrid);
    /**
     * For internal use only - Get the module name.
     *
     * @private
     * @returns {string} Returns Sort module name
     */
    private getModuleName;
    /**
     * @hidden
     */
    addEventListener(): void;
    /**
     * @hidden
     * @returns {void}
     */
    removeEventListener(): void;
    private createdSortedRecords;
    private iterateSort;
    /**
     * Sorts a column with the given options.
     *
     * @param {string} columnName - Defines the column name to be sorted.
     * @param {SortDirection} direction - Defines the direction of sorting field.
     * @param {boolean} isMultiSort - Specifies whether the previous sorted columns are to be maintained.
     * @returns {void}
     */
    sortColumn(columnName: string, direction: SortDirection, isMultiSort?: boolean): void;
    removeSortColumn(field: string): void;
    /**
     * The function used to update sortSettings of TreeGrid.
     *
     * @returns {void}
     * @hidden
     */
    private updateModel;
    /**
     * Clears all the sorted columns of the TreeGrid.
     *
     * @returns {void}
     */
    clearSorting(): void;
    /**
     * Destroys the Sorting of TreeGrid.
     *
     * @function destroy
     * @returns {void}
     */
    destroy(): void;
}
