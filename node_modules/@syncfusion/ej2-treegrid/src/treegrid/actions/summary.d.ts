import { TreeGrid } from '../base/treegrid';
import { QueryOptions } from '@syncfusion/ej2-data';
/**
 * TreeGrid Aggregate module
 *
 * @hidden
 */
export declare class Aggregate {
    private parent;
    private flatChildRecords;
    private summaryQuery;
    /**
     * Constructor for Aggregate module
     *
     * @param {TreeGrid} parent - Tree Grid instance
     */
    constructor(parent?: TreeGrid);
    /**
     * For internal use only - Get the module name.
     *
     * @private
     * @returns {string} Returns Summary module name
     */
    private getModuleName;
    removeEventListener(): void;
    /**
     * Function to calculate summary values
     *
     * @param {QueryOptions[]} summaryQuery - DataManager query for aggregate operations
     * @param {Object[]} filteredData - Filtered data collection
     * @param {boolean} isSort - Specified whether sorting operation performed
     * @hidden
     * @returns {Object[]} -  return flat records with summary values
     */
    calculateSummaryValue(summaryQuery: QueryOptions[], filteredData: Object[], isSort: boolean): Object[];
    private getChildRecordsLength;
    private createSummaryItem;
    private getSummaryValues;
    private getFormatFromType;
    /**
     * To destroy the Aggregate module
     *
     * @returns {void}
     * @hidden
     */
    destroy(): void;
}
