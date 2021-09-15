import { IEditCell } from '../base/interface';
import { Column } from '../models/column';
import { EditCellBase } from './edit-cell-base';
/**
 * `MultiSelectEditCell` is used to handle multiselect dropdown cell type editing.
 *
 * @hidden
 */
export declare class MultiSelectEditCell extends EditCellBase implements IEditCell {
    private column;
    write(args: {
        rowData: Object;
        element: Element;
        column: Column;
        row: HTMLElement;
        requestType: string;
    }): void;
}
