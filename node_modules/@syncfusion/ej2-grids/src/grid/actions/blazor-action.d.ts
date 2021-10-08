import { IGrid, ActionArgs, NotifyArgs } from '../base/interface';
import { Observer } from '@syncfusion/ej2-base';
import { Column } from '../models/column';
import { ReturnType } from '../base/type';
export declare const gridObserver: Observer;
/**
 * BlazorAction is used for performing Blazor related Grid Actions.
 *
 * @hidden
 */
export declare class BlazorAction {
    private parent;
    private aria;
    private actionArgs;
    private dataSourceChanged;
    private virtualContentModule;
    private virtualHeight;
    constructor(parent?: IGrid);
    addEventListener(): void;
    removeEventListener(): void;
    getModuleName(): string;
    modelChanged(args: ActionArgs): void;
    addDeleteSuccess(args: NotifyArgs): void;
    editSuccess(args: ActionArgs): void;
    invokeServerDataBind(args: ActionArgs): void;
    onDetailRowClick(target: Element): void;
    setColumnVisibility(columns: Column[]): void;
    dataSuccess(args: ReturnType): void;
    removeDisplayNone(): void;
    setVirtualTrackHeight(args: {
        VisibleGroupedRowsCount: number;
    }): void;
    setColVTableWidthAndTranslate(args?: {
        refresh: boolean;
    }): void;
    private dataSourceModified;
    private setClientOffSet;
    private setServerOffSet;
    onGroupClick(args: object): void;
    setPersistData(args: Object): void;
    resetPersistData(args: string): void;
    private contentColGroup;
    dataFailure(args: {
        result: Object[];
    }): void;
    destroy(): void;
}
