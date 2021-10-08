import { IEditCell } from '../base/interface';
import { Column } from '../models/column';
import { EditCellBase } from './edit-cell-base';
/**
 * `BooleanEditCell` is used to handle boolean cell type editing.
 *
 * @hidden
 */
export declare class BooleanEditCell extends EditCellBase implements IEditCell {
    private editRow;
    private editType;
    private activeClasses;
    private cbChange;
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
    private addEventListener;
    private removeEventListener;
    private checkBoxChange;
}
