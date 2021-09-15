import { IGrid } from '../base/interface';
/**
 * Edit render module is used to render grid edit row.
 *
 * @hidden
 */
export declare class InlineEditRender {
    private parent;
    private isEdit;
    /**
     * Constructor for render module
     *
     * @param {IGrid} parent - returns the IGrid
     */
    constructor(parent?: IGrid);
    addNew(elements: Object, args: {
        row?: Element;
        rowData?: Object;
        isScroll?: boolean;
    }): void;
    private renderFrozenRightForm;
    private renderMovableform;
    private updateFreezeEdit;
    private getFreezeRightRow;
    private getFreezeRow;
    update(elements: Object, args: {
        row?: Element;
        rowData?: Object;
    }): void;
    private refreshFreezeEdit;
    private refreshEditForm;
    private updateFrozenRightCont;
    private updateFrozenCont;
    private renderRightFrozen;
    private renderMovable;
    private getEditElement;
    removeEventListener(): void;
    private appendChildren;
}
