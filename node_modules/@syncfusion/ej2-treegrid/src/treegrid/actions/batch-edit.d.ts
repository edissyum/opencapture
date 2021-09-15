import { TreeGrid } from '../base';
/**
 * `BatchEdit` module is used to handle batch editing actions.
 *
 * @hidden
 */
export declare class BatchEdit {
    private parent;
    private isSelfReference;
    private addRowRecord;
    private batchChildCount;
    private addedRecords;
    private deletedRecords;
    private matrix;
    private batchRecords;
    private currentViewRecords;
    private batchAddedRecords;
    private batchDeletedRecords;
    private batchIndex;
    private batchAddRowRecord;
    private isAdd;
    private newBatchRowAdded;
    private selectedIndex;
    private addRowIndex;
    constructor(parent: TreeGrid);
    addEventListener(): void;
    /**
     * @hidden
     * @returns {void}
     */
    removeEventListener(): void;
    /**
     * To destroy the editModule
     *
     * @returns {void}
     * @hidden
     */
    destroy(): void;
    /**
     * @hidden
     * @returns {Object[]} Returns modified records in batch editing.
     */
    getBatchRecords(): Object[];
    /**
     * @hidden
     * @returns {number} Returns index of newly add row
     */
    getAddRowIndex(): number;
    /**
     * @hidden
     * @returns {number} Returns selected row index
     */
    getSelectedIndex(): number;
    /**
     * @hidden
     * @returns {number} Returns newly added child count
     */
    getBatchChildCount(): number;
    private batchPageAction;
    private cellSaved;
    private beforeBatchAdd;
    private batchAdd;
    private beforeBatchDelete;
    private updateRowIndex;
    private updateChildCount;
    private beforeBatchSave;
    private deleteUniqueID;
    private batchCancelAction;
    private batchSave;
    private getActualRowObjectIndex;
    private immutableBatchAction;
    private nextCellIndex;
}
