import { Gantt } from '../base/gantt';
/**
 * Gantt Excel Export module
 */
export declare class RowDD {
    private parent;
    isTest: boolean;
    /** @hidden */
    private ganttData;
    /** @hidden */
    private treeGridData;
    /** @hidden */
    private draggedRecord;
    /** @hidden */
    private updateParentRecords;
    /** @hidden */
    private droppedRecord;
    /** @hidden */
    isaddtoBottom: boolean;
    /** @hidden */
    private previousParent;
    private dropPosition;
    /** @hidden */
    private isSharedTask;
    /** @hidden */
    private canDrop;
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
    private rowDragStart;
    private addErrorElem;
    private removeErrorElem;
    private rowDrag;
    private rowDragStartHelper;
    private rowDrop;
    private dropRows;
    private updateCurrentTask;
    private deleteSharedResourceTask;
    private removeExistingResources;
    private updateSharedResourceTask;
    private _getExistingTaskWithID;
    private removeResourceInfo;
    private refreshDataSource;
    private dropMiddle;
    private recordLevel;
    private deleteDragRow;
    private checkisSharedTask;
    private dropAtTop;
    private updateChildRecordLevel;
    private updateChildRecord;
    private removeRecords;
    private removeChildItem;
    /**
     * Reorder the rows based on given indexes and position
     *
     * @param {number[]} fromIndexes .
     * @param {number} toIndex .
     * @param {string} position .
     * @returns {void} .
     */
    reorderRows(fromIndexes: number[], toIndex: number, position: string): void;
}
