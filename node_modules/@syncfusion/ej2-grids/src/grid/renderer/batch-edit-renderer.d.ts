import { IGrid } from '../base/interface';
import { Column } from '../models/column';
/**
 * Edit render module is used to render grid edit row.
 *
 * @hidden
 */
export declare class BatchEditRender {
    private parent;
    /**
     * Constructor for render module
     *
     * @param {IGrid} parent - specifies the IGrid
     */
    constructor(parent?: IGrid);
    update(elements: Element[], args: {
        columnObject?: Column;
        cell?: Element;
        row?: Element;
    }): void;
    private getEditElement;
    removeEventListener(): void;
}
