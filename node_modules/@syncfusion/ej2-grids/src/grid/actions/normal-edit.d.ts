import { IGrid, NotifyArgs } from '../base/interface';
import { EditRender } from '../renderer/edit-renderer';
import { ServiceLocator } from '../services/service-locator';
import { FormValidator } from '@syncfusion/ej2-inputs';
/**
 * `NormalEdit` module is used to handle normal('inline, dialog, external') editing actions.
 *
 * @hidden
 */
export declare class NormalEdit {
    protected parent: IGrid;
    protected serviceLocator: ServiceLocator;
    protected renderer: EditRender;
    formObj: FormValidator;
    protected previousData: Object;
    private editRowIndex;
    private rowIndex;
    private addedRowIndex;
    private uid;
    private args;
    private cloneRow;
    private originalRow;
    private frozen;
    private cloneFrozen;
    private currentVirtualData;
    private evtHandlers;
    constructor(parent?: IGrid, serviceLocator?: ServiceLocator, renderer?: EditRender);
    protected clickHandler(e: MouseEvent): void;
    protected dblClickHandler(e: MouseEvent): void;
    /**
     * The function used to trigger editComplete
     *
     * @param {NotifyArgs} e - specifies the NotifyArgs
     * @returns {void}
     * @hidden
     */
    editComplete(e: NotifyArgs): void;
    private getEditArgs;
    protected startEdit(tr: Element): void;
    private inlineEditHandler;
    protected updateRow(index: number, data: Object): void;
    private editFormValidate;
    protected endEdit(): void;
    private destroyElements;
    private editHandler;
    private edSucc;
    private edFail;
    private updateCurrentViewData;
    private requestSuccess;
    private editSuccess;
    private closeForm;
    private blazorTemplate;
    private editFailure;
    private needRefresh;
    private refreshRow;
    protected closeEdit(): void;
    protected addRecord(data?: Object, index?: number): void;
    private inlineAddHandler;
    protected deleteRecord(fieldname?: string, data?: Object): void;
    private stopEditStatus;
    /**
     * @returns {void}
     * @hidden
     */
    addEventListener(): void;
    /**
     * @returns {void}
     * @hidden
     */
    removeEventListener(): void;
    /**
     * @returns {void}
     * @hidden
     */
    destroy(): void;
}
