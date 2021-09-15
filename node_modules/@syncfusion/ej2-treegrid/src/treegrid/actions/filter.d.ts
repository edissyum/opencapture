import { TreeGrid } from '../base/treegrid';
/**
 * TreeGrid Filter module will handle filtering action
 *
 * @hidden
 */
export declare class Filter {
    private parent;
    filteredResult: Object[];
    private flatFilteredData;
    private filteredParentRecs;
    private isHierarchyFilter;
    /**
     * Constructor for Filter module
     *
     * @param {TreeGrid} parent - Tree Grid instance
     */
    constructor(parent?: TreeGrid);
    /**
     * For internal use only - Get the module name.
     *
     * @private
     * @returns {string} Returns Filter module name
     */
    protected getModuleName(): string;
    /**
     * To destroy the Filter module
     *
     * @returns {void}
     * @hidden
     */
    destroy(): void;
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
     * Function to update filtered records
     *
     * @param {{data: Object} } dataDetails - Filtered data collection
     * @param {Object} dataDetails.data - Fliltered data collection
     * @hidden
     * @returns {void}
     */
    private updatedFilteredRecord;
    private updateParentFilteredRecord;
    private addParentRecord;
    private checkChildExsist;
    private updateFilterLevel;
    private clearFilterLevel;
}
