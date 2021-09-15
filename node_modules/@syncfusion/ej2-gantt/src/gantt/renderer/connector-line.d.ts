import { Gantt } from '../base/gantt';
import { IGanttData, IConnectorLineObject, IPredecessor } from '../base/interface';
/**
 * To render the connector line in Gantt
 */
export declare class ConnectorLine {
    private parent;
    dependencyViewContainer: HTMLElement;
    private lineColor;
    private lineStroke;
    tooltipTable: HTMLElement;
    /**
     * @hidden
     */
    expandedRecords: IGanttData[];
    constructor(ganttObj?: Gantt);
    /**
     * To get connector line gap.
     *
     * @param {IConnectorLineObject} data .
     * @returns {number} .
     * @private
     */
    private getconnectorLineGap;
    /**
     * To initialize the public property.
     *
     * @returns {void}
     * @private
     */
    initPublicProp(): void;
    private getTaskbarMidpoint;
    /**
     * To connector line object collection.
     *
     * @param {IGanttData} parentGanttData .
     * @param {IGanttData} childGanttData .
     * @param {IPredecessor}  predecessor .
     * @returns {void}
     * @private
     */
    createConnectorLineObject(parentGanttData: IGanttData, childGanttData: IGanttData, predecessor: IPredecessor): IConnectorLineObject;
    /**
     * To render connector line.
     *
     * @param {IConnectorLineObject} connectorLinesCollection .
     * @returns {void}
     * @private
     */
    renderConnectorLines(connectorLinesCollection: IConnectorLineObject[]): void;
    /**
     * To get parent position.
     *
     * @param {IConnectorLineObject} data .
     * @returns {void}
     * @private
     */
    private getParentPosition;
    /**
     * To get line height.
     *
     * @param {IConnectorLineObject} data .
     * @returns {void}
     * @private
     */
    private getHeightValue;
    /**
     * To get sstype2 inner element width.
     *
     * @param {IConnectorLineObject} data .
     * @returns {void}
     * @private
     */
    private getInnerElementWidthSSType2;
    /**
     * To get sstype2 inner element left.
     *
     * @param {IConnectorLineObject} data .
     * @returns {void}
     * @private
     */
    private getInnerElementLeftSSType2;
    /**
     * To get sstype2 inner child element width.
     *
     * @param {IConnectorLineObject} data .
     * @returns {void}
     * @private
     */
    private getInnerChildWidthSSType2;
    private getBorderStyles;
    /**
     * To get connector line template.
     *
     * @param {IConnectorLineObject} data .
     * @returns {void}
     * @private
     */
    getConnectorLineTemplate(data: IConnectorLineObject): string;
    /**
     * @param {IConnectorLineObject} data .
     * @param {string} type .
     * @param {number} heightValue .
     * @returns {number} .
     * @private
     */
    private getPosition;
    /**
     * @returns {void} .
     * @private
     */
    createConnectorLineTooltipTable(): void;
    /**
     * @param {string} fromTaskName .
     * @param {string} fromPredecessorText .
     * @param {string} toTaskName .
     * @param {string} toPredecessorText .
     * @returns {string} .
     * @private
     */
    getConnectorLineTooltipInnerTd(fromTaskName: string, fromPredecessorText: string, toTaskName?: string, toPredecessorText?: string): string;
    /**
     * Generate aria-label for connectorline
     *
     * @param {IConnectorLineObject} data .
     * @returns {string} .
     * @private
     */
    generateAriaLabel(data: IConnectorLineObject): string;
    /**
     * To get the record based on the predecessor value
     *
     * @param {string} id .
     * @returns {IGanttData} .
     * @private
     */
    getRecordByID(id: string): IGanttData;
    /**
     * Method to remove connector line from DOM
     *
     * @param {IGanttData[] | object} records .
     * @returns {void} .
     * @private
     */
    removePreviousConnectorLines(records: IGanttData[] | object): void;
    /**
     * @param {string} id .
     * @returns {void} .
     * @private
     */
    removeConnectorLineById(id: string): void;
}
