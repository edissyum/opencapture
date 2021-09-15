import { IGrid, IEditCell } from '../base/interface';
import { AutoComplete, DropDownList, ComboBox, MultiSelect } from '@syncfusion/ej2-dropdowns';
import { CheckBox, Switch } from '@syncfusion/ej2-buttons';
import { DatePicker, TimePicker } from '@syncfusion/ej2-calendars';
import { TextBox, MaskedTextBox } from '@syncfusion/ej2-inputs';
import { Column } from '../models/column';
/**
 * `DropDownEditCell` is used to handle dropdown cell type editing.
 *
 * @hidden
 */
export declare class EditCellBase implements IEditCell {
    protected parent: IGrid;
    protected obj: AutoComplete | CheckBox | ComboBox | DatePicker | TextBox | DropDownList | MaskedTextBox | MultiSelect | TimePicker | Switch;
    protected removeEventHandler: Function;
    constructor(parent?: IGrid);
    create(args: {
        column: Column;
        value: string;
        type?: string;
        requestType?: string;
    }): Element;
    read(element: Element): string | boolean | Date;
    destroy(): void;
}
