import { Gantt } from '../base/gantt';
import { DateProcessor } from '../base/date-processor';
import { IGanttData, ITaskSegment } from '../base/interface';
/**
 * To render the chart rows in Gantt
 */
export declare class ChartRows extends DateProcessor {
    ganttChartTableBody: Element;
    taskTable: HTMLElement;
    protected parent: Gantt;
    taskBarHeight: number;
    milestoneHeight: number;
    private milesStoneRadius;
    private baselineTop;
    baselineHeight: number;
    private baselineColor;
    private parentTaskbarTemplateFunction;
    private leftTaskLabelTemplateFunction;
    private rightTaskLabelTemplateFunction;
    private taskLabelTemplateFunction;
    private childTaskbarTemplateFunction;
    private milestoneTemplateFunction;
    private templateData;
    private touchLeftConnectorpoint;
    private touchRightConnectorpoint;
    connectorPointWidth: number;
    private connectorPointMargin;
    taskBarMarginTop: number;
    milestoneMarginTop: number;
    private dropSplit;
    private refreshedTr;
    private refreshedData;
    private isUpdated;
    constructor(ganttObj?: Gantt);
    /**
     * To initialize the public property.
     *
     * @returns {void}
     * @private
     */
    private initPublicProp;
    private addEventListener;
    refreshChartByTimeline(): void;
    /**
     * To render chart rows.
     *
     * @returns {void}
     * @private
     */
    private createChartTable;
    initiateTemplates(): void;
    /**
     * To render chart rows.
     *
     * @returns {void}
     * @private
     */
    renderChartRows(): void;
    /**
     * To get gantt Indicator.
     *
     * @param {IIndicator} indicator .
     * @returns {NodeList} .
     * @private
     */
    private getIndicatorNode;
    /**
     * To get gantt Indicator.
     *
     * @param {Date | string} date .
     * @returns {number} .
     * @private
     */
    getIndicatorleft(date: Date | string): number;
    /**
     * To get child taskbar Node.
     *
     *  @param {number} i .
     * @param {NodeList} rootElement .
     * @returns {NodeList} .
     * @private
     */
    private getChildTaskbarNode;
    private splitTaskbar;
    private getSplitTaskbarLeftResizerNode;
    private getSplitTaskbarRightResizerNode;
    private getSplitProgressResizerNode;
    getSegmentIndex(splitStartDate: Date, record: IGanttData): number;
    mergeTask(taskId: number | string, segmentIndexes: {
        firstSegmentIndex: number;
        secondSegmentIndex: number;
    }[]): void;
    private refreshChartAfterSegment;
    /**
     * public method to split task bar.
     *
     * @public
     */
    splitTask(taskId: number | string, splitDates: Date | Date[]): void;
    private constructSegments;
    private splitSegmentedTaskbar;
    incrementSegments(segments: ITaskSegment[], segmentIndex: number, ganttData: IGanttData): void;
    /**
     * To get milestone node.
     *
     * @param {number} i .
     * @param {NodeList} rootElement .
     * @returns {NodeList} .
     * @private
     */
    private getMilestoneNode;
    /**
     * To get task baseline Node.
     *
     * @returns {NodeList} .
     * @private
     */
    private getTaskBaselineNode;
    /**
     * To get milestone baseline node.
     *
     * @returns {NodeList} .
     * @private
     */
    private getMilestoneBaselineNode;
    /**
     * To get left label node.
     *
     * @param {number} i .
     * @returns {NodeList} .
     * @private
     */
    private getLeftLabelNode;
    private getLableText;
    /**
     * To get right label node.
     *
     * @param {number} i .
     * @returns {NodeList} .
     * @private
     */
    private getRightLabelNode;
    private getManualTaskbar;
    /**
     * To get parent taskbar node.
     *
     * @param {number} i .
     * @param {NodeList} rootElement .
     * @returns {NodeList} .
     * @private
     */
    private getParentTaskbarNode;
    /**
     * To get taskbar row('TR') node
     *
     * @returns {NodeList} .
     * @private
     */
    private getTableTrNode;
    /**
     * To initialize chart templates.
     *
     * @returns {void}
     * @private
     */
    private initializeChartTemplate;
    private createDivElement;
    private isTemplate;
    /**
     * @param {string} templateName .
     * @returns {string} .
     * @private
     */
    getTemplateID(templateName: string): string;
    private leftLabelContainer;
    private taskbarContainer;
    private rightLabelContainer;
    private childTaskbarLeftResizer;
    private childTaskbarRightResizer;
    private childTaskbarProgressResizer;
    private getLeftPointNode;
    private getRightPointNode;
    /**
     * To get task label.
     *
     * @param {string} field .
     * @returns {string} .
     * @private
     */
    private getTaskLabel;
    private getExpandDisplayProp;
    private getRowClassName;
    private getBorderRadius;
    private getSplitTaskBorderRadius;
    private taskNameWidth;
    private getRightLabelLeft;
    private getExpandClass;
    private getFieldValue;
    private getResourceName;
    /**
     * To initialize private variable help to render task bars.
     *
     * @returns {void}
     * @private
     */
    private initChartHelperPrivateVariable;
    /**
     * Function used to refresh Gantt rows.
     *
     * @returns {void}
     * @private
     */
    refreshGanttRows(): void;
    /**
     * To render taskbars.
     *
     * @returns {void}
     * @private
     */
    private createTaskbarTemplate;
    /**
     * To render taskbars.
     *
     * @param {number} i .
     * @param {IGanttData} tempTemplateData .
     * @returns {Node} .
     * @private
     */
    getGanttChartRow(i: number, tempTemplateData: IGanttData): Node;
    /**
     * To set aria-rowindex for chart rows
     *
     * @returns {void} .
     * @private
     */
    setAriaRowIndex(tempTemplateData: IGanttData, tRow: Node): void;
    /**
     * To trigger query taskbar info event.
     *
     * @returns {void}
     * @private
     */
    triggerQueryTaskbarInfo(): void;
    /**
     *
     * @param {Element} trElement .
     * @param {IGanttData} data .
     * @returns {void} .
     * @private
     */
    triggerQueryTaskbarInfoByIndex(trElement: Element, data: IGanttData): void;
    /**
     * To update query taskbar info args.
     *
     * @param {IQueryTaskbarInfoEventArgs} args .
     * @param {Element} rowElement .
     * @param {Element} taskBarElement .
     * @returns {void}
     * @private
     */
    private updateQueryTaskbarInfoArgs;
    private getClassName;
    /**
     * To compile template string.
     *
     * @param {string} template .
     * @returns {Function} .
     * @private
     */
    templateCompiler(template: string): Function;
    /**
     * To refresh edited TR
     *
     * @param {number} index .
     * @param {boolean} isValidateRange .
     * @returns {void} .
     * @private
     */
    refreshRow(index: number, isValidateRange?: boolean): void;
    private getResourceParent;
    /**
     * To refresh all edited records
     *
     * @param {IGanttData} items .
     * @param {boolean} isValidateRange .
     * @returns {void} .
     * @private
     */
    refreshRecords(items: IGanttData[], isValidateRange?: boolean): void;
    private removeEventListener;
    private destroy;
    private generateAriaLabel;
    private generateSpiltTaskAriaLabel;
    private generateTaskLabelAriaLabel;
}
