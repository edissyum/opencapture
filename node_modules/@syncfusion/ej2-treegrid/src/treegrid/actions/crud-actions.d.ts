/**
 * crud-actions.ts file
 */
import { ITreeData } from '../base/interface';
import { TreeGrid } from '../base';
/**
 * Performs CRUD update to Tree Grid data source
 *
 * @param {{value: ITreeData, action: string }} details - Gets modified record value and CRUD action type
 * @param {TreeGrid} details.value - Gets modified record value
 * @param {string} details.action - CRUD action type
 * @param {TreeGrid} control - Tree Grid instance
 * @param {boolean} isSelfReference - Denotes whether Self Referential data binding
 * @param {number} addRowIndex - New add row index
 * @param {number} selectedIndex - Selected Row index
 * @param {string} columnName - Column field name
 * @param {ITreeData} addRowRecord - Newly added record
 * @returns {void}
 */
export declare function editAction(details: {
    value: ITreeData;
    action: string;
}, control: TreeGrid, isSelfReference: boolean, addRowIndex: number, selectedIndex: number, columnName?: string, addRowRecord?: ITreeData): void;
/**
 * Performs Add action to Tree Grid data source
 *
 * @param {{value: ITreeData, action: string }} details - Gets modified record value and CRUD action type
 * @param {TreeGrid} details.value - Gets modified record value
 * @param {string} details.action - CRUD action type
 * @param {Object[]} treeData - Tree Grid data source
 * @param {TreeGrid} control - Tree Grid instance
 * @param {boolean} isSelfReference - Denotes whether Self Referential data binding
 * @param {number} addRowIndex - New add row index
 * @param {number} selectedIndex - Selected Row index
 * @param {ITreeData} addRowRecord - Newly added record
 * @returns {void}
 */
export declare function addAction(details: {
    value: ITreeData;
    action: string;
}, treeData: Object[], control: TreeGrid, isSelfReference: boolean, addRowIndex: number, selectedIndex: number, addRowRecord: ITreeData): {
    value: Object;
    isSkip: boolean;
};
/**
 * @param {ITreeData[]} childRecords - Child Records collection
 * @param {Object} modifiedData - Modified data in crud action
 * @param {string} action - crud action type
 * @param {string} key - Primary key field name
 * @param {TreeGrid} control - Tree Grid instance
 * @param {boolean} isSelfReference - Specified whether Self Referential data binding
 * @param {ITreeData} originalData - Non updated data from data source, of edited data
 * @param {string} columnName - column field name
 * @returns {boolean} Returns whether child records exists
 */
export declare function removeChildRecords(childRecords: ITreeData[], modifiedData: Object, action: string, key: string, control: TreeGrid, isSelfReference: boolean, originalData?: ITreeData, columnName?: string): boolean;
/**
 * @param {string} key - Primary key field name
 * @param {ITreeData} record - Parent Record which has to be updated
 * @param {string} action - CRUD action type
 * @param {TreeGrid} control - Tree Grid instance
 * @param {boolean} isSelfReference - Specified whether self referential data binding
 * @param {ITreeData} child - Specifies child record
 * @returns {void}
 */
export declare function updateParentRow(key: string, record: ITreeData, action: string, control: TreeGrid, isSelfReference: boolean, child?: ITreeData): void;
