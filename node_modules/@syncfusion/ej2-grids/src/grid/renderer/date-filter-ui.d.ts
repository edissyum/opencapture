import { IGrid, IFilterMUI, IFilterCreate } from '../base/interface';
import { Column } from '../models/column';
import { FilterSettings } from '../base/grid';
import { ServiceLocator } from '../services/service-locator';
import { Filter } from '../actions/filter';
/**
 * `datefilterui` render date column.
 *
 * @hidden
 */
export declare class DateFilterUI implements IFilterMUI {
    private parent;
    protected locator: ServiceLocator;
    private inputElem;
    private value;
    private datePickerObj;
    private fltrSettings;
    private dialogObj;
    private dpOpen;
    constructor(parent?: IGrid, serviceLocator?: ServiceLocator, filterSettings?: FilterSettings);
    create(args: IFilterCreate): void;
    write(args: {
        column: Column;
        target: Element;
        parent: IGrid;
        filteredValue: number | string | Date | boolean;
    }): void;
    read(element: Element, column: Column, filterOptr: string, filterObj: Filter): void;
    private openPopup;
    private destroy;
}
