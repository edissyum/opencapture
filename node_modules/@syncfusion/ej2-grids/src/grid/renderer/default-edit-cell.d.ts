import { IEditCell } from '../base/interface';
import { Column } from '../models/column';
import { EditCellBase } from './edit-cell-base';
/**
 * `DefaultEditCell` is used to handle default cell type editing.
 *
 * @hidden
 */
export declare class DefaultEditCell extends EditCellBase implements IEditCell {
    create(args: {
        column: Column;
        value: string;
        requestType: string;
    }): Element;
    read(element: Element): string;
    write(args: {
        rowData: Object;
        element: Element;
        column: Column;
        requestType: string;
    }): void;
}
