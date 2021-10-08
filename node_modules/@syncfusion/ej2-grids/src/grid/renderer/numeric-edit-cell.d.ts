import { IGrid, IEditCell } from '../base/interface';
import { Column } from '../models/column';
/**
 * `NumericEditCell` is used to handle numeric cell type editing.
 *
 * @hidden
 */
export declare class NumericEditCell implements IEditCell {
    private parent;
    private obj;
    private instances;
    constructor(parent?: IGrid);
    private keyEventHandler;
    create(args: {
        column: Column;
        value: string;
    }): Element;
    read(element: Element): number;
    write(args: {
        rowData: Object;
        element: Element;
        column: Column;
        row: HTMLElement;
        requestType: string;
    }): void;
    destroy(): void;
}
