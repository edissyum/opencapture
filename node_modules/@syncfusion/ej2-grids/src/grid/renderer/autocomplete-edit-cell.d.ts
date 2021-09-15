import { IEditCell } from '../base/interface';
import { Column } from '../models/column';
import { EditCellBase } from './edit-cell-base';
/**
 * `AutoCompleteEditCell` is used to handle autocomplete cell type editing.
 *
 * @hidden
 */
export declare class AutoCompleteEditCell extends EditCellBase implements IEditCell {
    private object;
    private column;
    write(args: {
        rowData: Object;
        element: Element;
        column: Column;
        rowElement: HTMLElement;
        requestType: string;
    }): void;
    private selectedValues;
}
