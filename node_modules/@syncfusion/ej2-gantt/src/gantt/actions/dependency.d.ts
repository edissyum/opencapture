/**
 * Predecessor calculation goes here
 */
import { IGanttData, ITaskData, IPredecessor, IConnectorLineObject } from '../base/interface';
import { Gantt } from '../base/gantt';
export declare class Dependency {
    private parent;
    private dateValidateModule;
    private parentRecord;
    private parentIds;
    constructor(gantt: Gantt);
    /**
     * Method to populate predecessor collections in records
     *
     * @returns {void} .
     * @private
     */
    ensurePredecessorCollection(): void;
    /**
     *
     * @param {IGanttData} ganttData .
     * @param {ITaskData} ganttProp .
     * @returns {void} .
     * @private
     */
    ensurePredecessorCollectionHelper(ganttData: IGanttData, ganttProp: ITaskData): void;
    /**
     * To render unscheduled empty task with 1 day duration during predecessor map
     *
     * @param {IGanttData} data .
     * @returns {void} .
     * @private
     */
    updateUnscheduledDependency(data: IGanttData): void;
    /**
     *
     * @param {string} fromId .
     * @returns {boolean} .
     */
    private checkIsParent;
    /**
     * Get predecessor collection object from predecessor string value
     *
     * @param {string | number} predecessorValue .
     * @param {IGanttData} ganttRecord .
     * @returns {IPredecessor[]} .
     * @private
     */
    calculatePredecessor(predecessorValue: string | number, ganttRecord?: IGanttData): IPredecessor[];
    /**
     * Get predecessor value as string with offset values
     *
     * @param {IGanttData} data .
     * @returns {string} .
     * @private
     */
    getPredecessorStringValue(data: IGanttData): string;
    private getOffsetDurationUnit;
    /**
     * Update predecessor object in both from and to tasks collection
     *
     * @returns {void} .
     * @private
     */
    updatePredecessors(): void;
    /**
     * To update predecessor collection to successor tasks
     *
     * @param {IGanttData} ganttRecord .
     * @param {IGanttData[]} predecessorsCollection .
     * @returns {void} .
     * @private
     */
    updatePredecessorHelper(ganttRecord: IGanttData, predecessorsCollection?: IGanttData[]): void;
    /**
     * Method to validate date of tasks with predecessor values for all records
     *
     * @returns {void} .
     * @private
     */
    updatedRecordsDateByPredecessor(): void;
    /**
     * To validate task date values with dependency
     *
     * @param {IGanttData} ganttRecord .
     * @returns {void} .
     * @private
     */
    validatePredecessorDates(ganttRecord: IGanttData): void;
    /**
     * Method to validate task with predecessor
     *
     * @param {IGanttData} parentGanttRecord .
     * @param {IGanttData} childGanttRecord .
     * @returns {void} .
     */
    private validateChildGanttRecord;
    /**
     *
     * @param {IGanttData} ganttRecord .
     * @param {IPredecessor[]} predecessorsCollection .
     * @returns {Date} .
     * @private
     */
    getPredecessorDate(ganttRecord: IGanttData, predecessorsCollection: IPredecessor[]): Date;
    /**
     * Get validated start date as per predecessor type
     *
     * @param {ITaskData} ganttProperty .
     * @param {ITaskData} parentRecordProperty .
     * @param {IPredecessor} predecessor .
     * @returns {Date} .
     */
    private getValidatedStartDate;
    /**
     *
     * @param {Date} date .
     * @param {IPredecessor} predecessor .
     * @param {ITaskData} record .
     * @returns {void} .
     */
    private updateDateByOffset;
    /**
     *
     * @param {IGanttData} records .
     * @returns {void} .
     * @private
     */
    createConnectorLinesCollection(records?: IGanttData[]): void;
    /**
     *
     * @param {object[]} predecessorsCollection .
     * @returns {void} .
     */
    private addPredecessorsCollection;
    /**
     * To refresh connector line object collections
     *
     * @param {IGanttData} parentGanttRecord .
     * @param {IGanttData} childGanttRecord .
     * @param {IPredecessor} predecessor .
     * @returns {void} .
     * @private
     */
    updateConnectorLineObject(parentGanttRecord: IGanttData, childGanttRecord: IGanttData, predecessor: IPredecessor): IConnectorLineObject;
    /**
     *
     * @param {IGanttData} childGanttRecord .
     * @param {IPredecessor[]} previousValue .
     * @param {string} validationOn .
     * @returns {void} .
     * @private
     */
    validatePredecessor(childGanttRecord: IGanttData, previousValue: IPredecessor[], validationOn: string): void;
    /**
     * Method to get validate able predecessor alone from record
     *
     * @param {IGanttData} record .
     * @returns {IPredecessor[]} .
     * @private
     */
    getValidPredecessor(record: IGanttData): IPredecessor[];
}
