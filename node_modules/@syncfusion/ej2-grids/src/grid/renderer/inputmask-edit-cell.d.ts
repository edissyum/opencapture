import { IEditCell } from '../base/interface';
import { Column } from '../models/column';
import { EditCellBase } from './edit-cell-base';
/**
 * `MaskedTextBoxCellEdit` is used to handle masked input cell type editing.
 *
 * @hidden
 */
export declare class MaskedTextBoxCellEdit extends EditCellBase implements IEditCell {
    private column;
    write(args: {
        rowData: Object;
        element: Element;
        column: Column;
        row: HTMLElement;
        requestType: string;
    }): void;
}
