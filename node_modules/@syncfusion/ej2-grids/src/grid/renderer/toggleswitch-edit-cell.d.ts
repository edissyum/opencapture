import { IEditCell } from '../base/interface';
import { Column } from '../models/column';
import { EditCellBase } from './edit-cell-base';
/**
 * `ToggleEditCell` is used to handle boolean cell type editing.
 *
 * @hidden
 */
export declare class ToggleEditCell extends EditCellBase implements IEditCell {
    private editRow;
    private editType;
    private activeClasses;
    create(args: {
        column: Column;
        value: string;
        type: string;
    }): Element;
    read(element: Element): boolean;
    write(args: {
        rowData: Object;
        element: Element;
        column: Column;
        requestType: string;
        row: Element;
    }): void;
    private switchModeChange;
}
