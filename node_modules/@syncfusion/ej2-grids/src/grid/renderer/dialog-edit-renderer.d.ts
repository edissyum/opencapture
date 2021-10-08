import { IGrid } from '../base/interface';
import { ServiceLocator } from '../services/service-locator';
/**
 * Edit render module is used to render grid edit row.
 *
 * @hidden
 */
export declare class DialogEditRender {
    private parent;
    private l10n;
    private isEdit;
    private serviceLocator;
    private dialog;
    private dialogObj;
    /**
     * Constructor for render module
     *
     * @param {IGrid} parent - specifies the IGrid
     * @param {ServiceLocator} serviceLocator - specifies the serviceLocator
     */
    constructor(parent?: IGrid, serviceLocator?: ServiceLocator);
    private setLocaleObj;
    addNew(elements: Element[], args: {
        primaryKeyValue?: string[];
    }): void;
    update(elements: Element[], args: {
        primaryKeyValue?: string[];
    }): void;
    private createDialogHeader;
    private createDialog;
    private dialogCreated;
    private renderResponsiveDialog;
    private btnClick;
    private dialogClose;
    private destroy;
    private getDialogEditTemplateElement;
    private getEditElement;
    removeEventListener(): void;
}
