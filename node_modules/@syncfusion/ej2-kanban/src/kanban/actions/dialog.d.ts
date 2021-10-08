import { Dialog } from '@syncfusion/ej2-popups';
import { Kanban } from '../base/kanban';
import { CurrentAction } from '../base/type';
/**
 * Dialog module is used to perform card actions.
 */
export declare class KanbanDialog {
    private parent;
    dialogObj: Dialog;
    private element;
    private formObj;
    private action;
    private storeElement;
    private cardData;
    private preventUpdate;
    /**
     * Constructor for dialog module
     *
     * @param {Kanban} parent Accepts the kanban instance
     */
    constructor(parent: Kanban);
    openDialog(action: CurrentAction, data?: Record<string, any>): void;
    closeDialog(): void;
    private renderDialog;
    private getDialogContent;
    private getDialogFields;
    private getDialogButtons;
    private renderComponents;
    private onBeforeDialogOpen;
    private onBeforeDialogClose;
    private getIDType;
    private applyFormValidation;
    private createTooltip;
    private destroyToolTip;
    private dialogButtonClick;
    private getFormElements;
    private getColumnName;
    private getValueFromElement;
    private destroyComponents;
    destroy(): void;
}
