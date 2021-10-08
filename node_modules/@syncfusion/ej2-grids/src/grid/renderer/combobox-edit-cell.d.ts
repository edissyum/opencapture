import { IEditCell } from '../base/interface';
import { Column } from '../models/column';
import { EditCellBase } from './edit-cell-base';
/**
 * `ComboBoxEditCell` is used to handle ComboBoxEdit cell type editing.
 *
 * @hidden
 */
export declare class ComboboxEditCell extends EditCellBase implements IEditCell {
    private column;
    write(args: {
        rowData: Object;
        element: Element;
        column: Column;
        row: HTMLElement;
        requestType: string;
    }): void;
    private finalValue;
}
