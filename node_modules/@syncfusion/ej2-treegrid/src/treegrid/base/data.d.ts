import { TreeGrid } from './treegrid';
import { BeforeDataBoundArgs } from '@syncfusion/ej2-grids';
/**
 * Internal dataoperations for tree grid
 *
 * @hidden
 */
export declare class DataManipulation {
    private taskIds;
    private parentItems;
    private zerothLevelData;
    private storedIndex;
    private batchChanges;
    private addedRecords;
    private parent;
    private dataResults;
    private sortedData;
    private hierarchyData;
    private isSelfReference;
    private isSortAction;
    constructor(grid: TreeGrid);
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
     * To destroy the dataModule
     *
     * @returns {void}
     * @hidden
     */
    destroy(): void;
    /**
     * @hidden
     * @returns {boolean} -Returns whether remote data binding
     */
    isRemote(): boolean;
    /**
     * Function to manipulate datasource
     *
     * @param {Object} data - Provide tree grid datasource to convert to flat data
     * @hidden
     * @returns {void}
     */
    convertToFlatData(data: Object): void;
    private convertJSONData;
    private selfReferenceUpdate;
    /**
     * Function to update the zeroth level parent records in remote binding
     *
     * @param {BeforeDataBoundArgs} args - contains data before its bounds to tree grid
     * @hidden
     * @returns {void}
     */
    private updateParentRemoteData;
    /**
     * Function to manipulate datasource
     *
     * @param {{record: ITreeData, rows: HTMLTableRowElement[], parentRow: HTMLTableRowElement}} rowDetails - Row details for which child rows has to be fetched
     * @param {ITreeData} rowDetails.record - current expanding record
     * @param {HTMLTableRowElement[]} rowDetails.rows - Expanding Row element
     * @param {HTMLTableRowElement} rowDetails.parentRow  - Curent expanding row element
     * @param {boolean} isChild - Specified whether current record is already a child record
     * @hidden
     * @returns {void}
     */
    private collectExpandingRecs;
    private fetchRemoteChildData;
    private remoteVirtualAction;
    private beginSorting;
    private createRecords;
    /**
     * Function to perform filtering/sorting action for local data
     *
     * @param {BeforeDataBoundArgs} args - data details to be processed before binding to grid
     * @hidden
     * @returns {void}
     */
    dataProcessor(args?: BeforeDataBoundArgs): void;
    private paging;
    private updateData;
    private updateAction;
}
