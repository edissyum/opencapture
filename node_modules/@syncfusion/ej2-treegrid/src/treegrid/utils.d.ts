import { IGrid } from '@syncfusion/ej2-grids';
import { TreeGrid } from './base/treegrid';
import { ITreeData } from './base/interface';
/**
 * @param {TreeGrid} parent - Tree Grid instance
 * @returns {boolean} - Specifies whether remote data binding
 */
export declare function isRemoteData(parent: TreeGrid): boolean;
/**
 * @param {TreeGrid | IGrid} parent - Tree Grid or Grid instance
 * @returns {boolean} - Returns whether custom binding
 */
export declare function isCountRequired(parent: TreeGrid | IGrid): boolean;
/**
 * @param {TreeGrid} parent - Tree Grid instance
 * @returns {boolean} - Returns whether checkbox column is enabled
 */
export declare function isCheckboxcolumn(parent: TreeGrid): boolean;
/**
 * @param {TreeGrid} parent - Tree Grid instance
 * @returns {boolean} - Returns whether filtering and searching done
 */
export declare function isFilterChildHierarchy(parent: TreeGrid): boolean;
/**
 * @param {Object} records - Define records for which parent records has to be found
 * @hidden
 * @returns {Object} - Returns parent records collection
 */
export declare function findParentRecords(records: Object): Object;
/**
 * @param {TreeGrid} parent - Tree Grid instance
 * @returns {boolean} - Returns the expand status of record
 * @param {ITreeData} record - Define the record for which expand status has be found
 * @param {ITreeData[]} parents - Parent Data collection
 * @hidden
 */
export declare function getExpandStatus(parent: TreeGrid, record: ITreeData, parents: ITreeData[]): boolean;
/**
 * @param {ITreeData} records - Define the record for which child records has to be found
 * @returns {Object[]} - Returns child records collection
 * @hidden
 */
export declare function findChildrenRecords(records: ITreeData): Object[];
/**
 * @param {TreeGrid} parent - Tree Grid instance
 * @returns {boolean} - Returns whether local data binding
 */
export declare function isOffline(parent: TreeGrid): boolean;
/**
 * @param {Object[]} array - Defines the array to be cloned
 * @returns {Object[]} - Returns cloned array collection
 */
export declare function extendArray(array: Object[]): Object[];
/**
 * @param {ITreeData} value - Defined the dirty data to be cleaned
 * @returns {ITreeData} - Returns cleaned original data
 */
export declare function getPlainData(value: ITreeData): ITreeData;
/**
 * @param {TreeGrid} parent - TreeGrid instance
 * @param {string} value - IdMapping field name
 * @param {boolean} requireFilter - Specified whether treegrid data is filtered
 * @returns {ITreeData} - Returns IdMapping matched record
 */
export declare function getParentData(parent: TreeGrid, value: string, requireFilter?: boolean): ITreeData;
/**
 * @param {HTMLTableRowElement} el - Row element
 * @returns {boolean} - Returns whether hidden
 */
export declare function isHidden(el: HTMLTableRowElement): boolean;
