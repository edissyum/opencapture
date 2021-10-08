import { IGrid, IFilterMUI, IFilterCreate } from '../base/interface';
import { Column } from '../models/column';
import { FilterSettings } from '../base/grid';
import { ServiceLocator } from '../services/service-locator';
import { Filter } from '../actions/filter';
/**
 * `numberfilterui` render number column.
 *
 * @hidden
 */
export declare class NumberFilterUI implements IFilterMUI {
    private parent;
    protected serviceLocator: ServiceLocator;
    private instance;
    private value;
    private numericTxtObj;
    private filterSettings;
    private filter;
    constructor(parent?: IGrid, serviceLocator?: ServiceLocator, filterSettings?: FilterSettings);
    private keyEventHandler;
    create(args: IFilterCreate): void;
    write(args: {
        column: Column;
        target: Element;
        parent: IGrid;
        filteredValue: number | string | Date | boolean;
    }): void;
    read(element: Element, column: Column, filterOptr: string, filterObj: Filter): void;
    private destroy;
}
