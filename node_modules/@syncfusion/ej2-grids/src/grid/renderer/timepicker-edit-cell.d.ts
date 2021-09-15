import { Column } from '../models/column';
import { IEditCell } from '../base/interface';
import { EditCellBase } from './edit-cell-base';
/**
 * `TimePickerEditCell` is used to handle Timepicker cell type editing.
 *
 * @hidden
 */
export declare class TimePickerEditCell extends EditCellBase implements IEditCell {
    write(args: {
        rowData: Object;
        element: Element;
        column: Column;
        type: string;
        row: HTMLElement;
        requestType: string;
    }): void;
}
