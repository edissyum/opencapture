import { Gantt } from '../base/gantt';
import { IGanttData, IPredecessor, ITaskbarEditedEventArgs } from '../base/interface';
import { Dialog } from '@syncfusion/ej2-popups';
/**
 * File for handling connector line edit operation in Gantt.
 *
 */
export declare class ConnectorLineEdit {
    private parent;
    private connectorLineElement;
    /**
     * @private
     */
    validationPredecessor: IPredecessor[];
    /** @private */
    confirmPredecessorDialog: Dialog;
    /** @private */
    predecessorIndex: number;
    /** @private */
    childRecord: IGanttData;
    private dateValidateModule;
    constructor(ganttObj?: Gantt);
    /**
     * To update connector line edit element.
     *
     * @param {PointerEvent} e .
     * @returns {void} .
     * @private
     */
    updateConnectorLineEditElement(e: PointerEvent): void;
    /**
     * To get hovered connector line element.
     *
     * @param {EventTarget} target .
     * @returns {void} .
     * @private
     */
    private getConnectorLineHoverElement;
    /**
     * To highlight connector line while hover.
     *
     * @param {Element} element .
     * @returns {void} .
     * @private
     */
    private highlightConnectorLineElements;
    /**
     * To add connector line highlight class.
     *
     * @param {Element} element .
     * @returns {void} .
     * @private
     */
    private addHighlight;
    /**
     * To remove connector line highlight class.
     *
     * @returns {void} .
     * @private
     */
    private removeHighlight;
    /**
     * To remove connector line highlight class.
     *
     * @param {IGanttData[]} records .
     * @returns {string} .
     * @private
     */
    getEditedConnectorLineString(records: IGanttData[]): string;
    /**
     * Tp refresh connector lines of edited records
     *
     * @param {IGanttData[]} editedRecord .
     * @returns {void} .
     * @private
     */
    refreshEditedRecordConnectorLine(editedRecord: IGanttData[]): void;
    private idFromPredecessor;
    private predecessorValidation;
    /**
     * To validate predecessor relations
     *
     * @param {IGanttData} ganttRecord .
     * @param {string} predecessorString .
     * @returns {boolean} .
     * @private
     */
    validatePredecessorRelation(ganttRecord: IGanttData, predecessorString: string): boolean;
    /**
     * To add dependency for Task
     *
     * @param {IGanttData} ganttRecord .
     * @param {string} predecessorString .
     * @returns {void} .
     * @private
     */
    addPredecessor(ganttRecord: IGanttData, predecessorString: string): void;
    /**
     * To remove dependency from task
     *
     * @param {IGanttData} ganttRecord .
     * @returns {void} .
     * @private
     */
    removePredecessor(ganttRecord: IGanttData): void;
    /**
     * To modify current dependency values of Task
     *
     * @param {IGanttData} ganttRecord .
     * @param {string} predecessorString .
     * @param {ITaskbarEditedEventArgs} editedArgs .
     * @returns {boolean} .
     * @private
     */
    updatePredecessor(ganttRecord: IGanttData, predecessorString: string, editedArgs?: ITaskbarEditedEventArgs): boolean;
    private updatePredecessorHelper;
    private checkParentRelation;
    private initPredecessorValidationDialog;
    /**
     * To render validation dialog
     *
     * @returns {void} .
     * @private
     */
    renderValidationDialog(): void;
    private validationDialogOkButton;
    private validationDialogCancelButton;
    private validationDialogClose;
    /**
     * Validate and apply the predecessor option from validation dialog
     *
     * @returns {void} .
     * @private
     */
    applyPredecessorOption(): void;
    private calculateOffset;
    /**
     * Update predecessor value with user selection option in predecessor validation dialog
     *
     * @param {IGanttData} ganttRecord .
     * @param {IPredecessor[]} predecessor .
     * @returns {void} .
     */
    private removePredecessors;
    /**
     * To open predecessor validation dialog
     *
     * @param {object} args .
     * @returns {void} .
     * @private
     */
    openValidationDialog(args: object): void;
    /**
     * Predecessor link validation dialog template
     *
     * @param {object} args .
     * @returns {HTMLElement} .
     * @private
     */
    validationDialogTemplate(args: object): HTMLElement;
    /**
     * To validate the types while editing the taskbar
     *
     * @param {IGanttData} ganttRecord .
     * @returns {boolean} .
     * @private
     */
    validateTypes(ganttRecord: IGanttData): object;
    /**
     * Method to remove and update new predecessor collection in successor record
     *
     * @param {IGanttData} data .
     * @returns {void} .
     * @private
     */
    addRemovePredecessor(data: IGanttData): void;
    /**
     * Method to remove a predecessor from a record.
     *
     * @param {IGanttData} childRecord .
     * @param {number} index .
     * @returns {void} .
     * @private
     */
    removePredecessorByIndex(childRecord: IGanttData, index: number): void;
    /**
     * To render predecessor delete confirmation dialog
     *
     * @returns {void} .
     * @private
     */
    renderPredecessorDeleteConfirmDialog(): void;
    private confirmCloseDialog;
    private confirmOkDeleteButton;
}
