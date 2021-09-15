import { IGanttData, ITaskData, IParent, IWorkTimelineRanges, ITaskSegment } from './interface';
import { Gantt } from './gantt';
import { DateProcessor } from './date-processor';
/**
 * To calculate and update task related values
 */
export declare class TaskProcessor extends DateProcessor {
    private recordIndex;
    private dataArray;
    private taskIds;
    private segmentCollection;
    private hierarchyData;
    constructor(parent: Gantt);
    private addEventListener;
    /**
     * @param {boolean} isChange .
     * @returns {void} .
     * @private
     */
    checkDataBinding(isChange?: boolean): void;
    private processTimeline;
    private initDataSource;
    private constructDataSource;
    private cloneDataSource;
    /**
     * @param {object[]} resources .
     * @param {object[]} data .
     * @param {object[]} unassignedTasks .
     * @returns {void} .
     *
     */
    private constructResourceViewDataSource;
    /**
     * Function to manipulate data-source
     *
     * @param {object[]} data .
     * @returns {void} .
     * @hidden
     */
    private prepareDataSource;
    private calculateSharedTaskUniqueIds;
    private prepareRecordCollection;
    /**
     * Method to update custom field values in gantt record
     *
     * @param {object} data .
     * @param {IGanttData} ganttRecord .
     * @returns {void} .
     */
    private addCustomFieldValue;
    /**
     * To populate Gantt record
     *
     * @param {object} data .
     * @param {number} level .
     * @param {IGanttData} parentItem .
     * @param {boolean} isLoad .
     * @returns {IGanttData} .
     * @private
     */
    createRecord(data: Object, level: number, parentItem?: IGanttData, isLoad?: boolean): IGanttData;
    private sortSegmentsData;
    setSegmentsInfo(data: IGanttData, onLoad: boolean): ITaskSegment[];
    private setSegmentTaskData;
    /**
     * Method to calculate work based on resource unit and duration.
     *
     * @param {IGanttData} ganttData .
     * @returns {void} .
     */
    updateWorkWithDuration(ganttData: IGanttData): void;
    /**
     *
     * @param {IGanttData} parent .
     * @returns {IParent} .
     * @private
     */
    getCloneParent(parent: IGanttData): IParent;
    /**
     * @returns {void} .
     * @private
     */
    reUpdateResources(): void;
    private addTaskData;
    private updateExpandStateMappingValue;
    /**
     * @param {IGanttData} ganttData .
     * @param {object} data .
     * @returns {void} .
     */
    private setValidatedDates;
    /**
     *
     * @param {IGanttData} ganttData .
     * @param {object} data .
     * @param {boolean} isLoad .
     * @returns {void} .
     * @private
     */
    calculateScheduledValues(ganttData: IGanttData, data: Object, isLoad: boolean): void;
    /**
     * Method to update duration with work value.
     *
     * @param {IGanttData} ganttData .
     * @returns {void} .
     */
    updateDurationWithWork(ganttData: IGanttData): void;
    /**
     * Update units of resources with respect to duration and work of a task.
     *
     * @param {IGanttData} ganttData .
     * @returns {void} .
     */
    updateUnitWithWork(ganttData: IGanttData): void;
    private calculateDateFromEndDate;
    private calculateDateFromStartDate;
    /**
     *
     * @param {number} parentWidth .
     * @param {number} percent .
     * @returns {number} .
     * @private
     */
    getProgressWidth(parentWidth: number, percent: number): number;
    /**
     *
     * @param {IGanttData} ganttData .
     * @param {boolean} isAuto .
     * @returns {number} .
     * @private
     */
    calculateWidth(ganttData: IGanttData, isAuto?: boolean): number;
    private getTaskbarHeight;
    /**
     * Method to calculate left
     *
     * @param {ITaskData} ganttProp .
     * @param {boolean} isAuto .
     * @returns {number} .
     * @private
     */
    calculateLeft(ganttProp: ITaskData, isAuto?: boolean): number;
    /**
     * calculate the left position of the auto scheduled taskbar
     *
     * @param {ITaskData} ganttProperties - Defines the gantt data.
     * @returns {number} .
     * @private
     */
    calculateAutoLeft(ganttProperties: ITaskData): number;
    /**
     * To calculate duration of Gantt record with auto scheduled start date and auto scheduled end date
     *
     * @param {ITaskData} ganttProperties - Defines the gantt data.
     * @returns {number} .
     */
    calculateAutoDuration(ganttProperties: ITaskData): number;
    /**
     * calculate the with between auto scheduled start date and auto scheduled end date
     *
     * @param {ITaskData} ganttProperties - Defines the gantt data.
     * @returns {number} .
     * @private
     */
    calculateAutoWidth(ganttProperties: ITaskData): number;
    /**
     * calculate the left margin of the baseline element
     *
     * @param {ITaskData} ganttProperties .
     * @returns {number} .
     * @private
     */
    calculateBaselineLeft(ganttProperties: ITaskData): number;
    /**
     * calculate the width between baseline start date and baseline end date.
     *
     * @param {ITaskData} ganttProperties .
     * @returns {number} .
     * @private
     */
    calculateBaselineWidth(ganttProperties: ITaskData): number;
    /**
     * To get tasks width value
     *
     * @param {Date} startDate .
     * @param {Date} endDate .
     * @returns {number} .
     * @private
     */
    getTaskWidth(startDate: Date, endDate: Date): number;
    /**
     * Get task left value
     *
     * @param {Date} startDate .
     * @param {boolean} isMilestone .
     * @returns {number} .
     * @private
     */
    getTaskLeft(startDate: Date, isMilestone: boolean): number;
    getSplitTaskWidth(sDate: Date, duration: number, data: IGanttData): number;
    getSplitTaskLeft(sDate: Date, segmentTaskStartDate: Date): number;
    /**
     *
     * @param {IGanttData} ganttData .
     * @param {string} fieldName .
     * @returns {void} .
     * @private
     */
    updateMappingData(ganttData: IGanttData, fieldName: string): void;
    private segmentTaskData;
    /**
     * Method to update the task data resource values
     *
     * @param {IGanttData} ganttData .
     * @returns {void} .
     */
    private updateTaskDataResource;
    private setRecordDate;
    private getDurationInDay;
    private setRecordDuration;
    private getWorkInHour;
    /**
     *
     * @param {IGanttData} ganttData .
     * @returns {void} .
     * @private
     */
    updateTaskData(ganttData: IGanttData): void;
    /**
     * To set resource value in Gantt record
     *
     * @param {object} data .
     * @returns {object[]} .
     * @private
     */
    setResourceInfo(data: Object): Object[];
    /**
     * To set resource unit in Gantt record
     *
     * @param {object[]} resourceData .
     * @returns {void} .
     * @private
     */
    updateResourceUnit(resourceData: Object[]): void;
    /**
     * @param {IGanttData} data .
     * @returns {void} .
     * @private
     */
    updateResourceName(data: IGanttData): void;
    private dataReorder;
    private validateDurationUnitMapping;
    private validateTaskTypeMapping;
    private validateWorkUnitMapping;
    /**
     * To update duration value in Task
     *
     * @param {string} duration .
     * @param {ITaskData} ganttProperties .
     * @returns {void} .
     * @private
     */
    updateDurationValue(duration: string, ganttProperties: ITaskData): void;
    /**
     * @returns {void} .
     * @private
     */
    reUpdateGanttData(): void;
    private _isInStartDateRange;
    private _isInEndDateRange;
    /**
     * Method to find overlapping value of the parent task
     *
     * @param {IGanttData} resourceTask .
     * @returns {void} .
     * @private
     */
    updateOverlappingValues(resourceTask: IGanttData): void;
    /**
     * @param {IGanttData[]} tasks .
     * @returns {void} .
     * @private
     */
    updateOverlappingIndex(tasks: IGanttData[]): void;
    /**
     * Method to calculate the left and width value of oarlapping ranges
     *
     * @param {IWorkTimelineRanges[]} ranges .
     * @returns {void} .
     * @private
     */
    calculateRangeLeftWidth(ranges: IWorkTimelineRanges[]): void;
    /**
     * @param {IWorkTimelineRanges[]} ranges .
     * @param {boolean} isSplit .
     * @returns {IWorkTimelineRanges[]} .
     * @private
     */
    mergeRangeCollections(ranges: IWorkTimelineRanges[], isSplit?: boolean): IWorkTimelineRanges[];
    /**
     * Sort resource child records based on start date
     *
     * @param {IGanttData} resourceTask .
     * @returns {IGanttData} .
     * @private
     */
    setSortedChildTasks(resourceTask: IGanttData): IGanttData[];
    private splitRangeCollection;
    private getRangeWithDay;
    private splitRangeForDayMode;
    private getRangeWithWeek;
    private splitRangeForWeekMode;
    /**
     * Update all gantt data collection width, progress width and left value
     *
     * @returns {void} .
     * @private
     */
    updateGanttData(): void;
    /**
     * Update all gantt data collection width, progress width and left value
     *
     * @param {IGanttData} data .
     * @returns {void} .
     * @public
     */
    private updateTaskLeftWidth;
    /**
     * @returns {void} .
     * @private
     */
    reUpdateGanttDataPosition(): void;
    /**
     * method to update left, width, progress width in record
     *
     * @param {IGanttData} data .
     * @returns {void} .
     * @private
     */
    updateWidthLeft(data: IGanttData): void;
    /**
     * method to update left, width, progress width in record
     *
     * @param {IGanttData} data .
     * @returns {void} .
     * @private
     */
    updateAutoWidthLeft(data: IGanttData): void;
    /**
     * To calculate parent progress value
     *
     * @param {IGanttData} childGanttRecord .
     * @returns {object} .
     * @private
     */
    getParentProgress(childGanttRecord: IGanttData): Object;
    private resetDependency;
    /**
     * @param {IParent | IGanttData} cloneParent .
     * @param {boolean} isParent .
     * @returns {void} .
     * @private
     */
    updateParentItems(cloneParent: IParent | IGanttData, isParent?: boolean): void;
}
