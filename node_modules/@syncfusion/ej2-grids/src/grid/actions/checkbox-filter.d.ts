import { FilterSettings } from '../base/grid';
import { IGrid, IFilterArgs } from '../base/interface';
import { ServiceLocator } from '../services/service-locator';
import { CheckBoxFilterBase } from '../common/checkbox-filter-base';
import { Column } from '../models/column';
/**
 * @hidden
 * `CheckBoxFilter` module is used to handle filtering action.
 */
export declare class CheckBoxFilter {
    protected parent: IGrid;
    checkBoxBase: CheckBoxFilterBase;
    isresetFocus: boolean;
    /**
     * Constructor for checkbox filtering module
     *
     * @param {IGrid} parent - specifies the IGrid
     * @param {FilterSettings} filterSettings - specifies the filtersettings
     * @param {ServiceLocator} serviceLocator - specifies the ServiceLocator
     * @hidden
     */
    constructor(parent?: IGrid, filterSettings?: FilterSettings, serviceLocator?: ServiceLocator);
    /**
     * To destroy the check box filter.
     *
     * @returns {void}
     * @hidden
     */
    destroy(): void;
    openDialog(options: IFilterArgs): void;
    closeDialog(): void;
    protected closeResponsiveDialog(): void;
    /**
     * For internal use only - Get the module name.
     *
     * @returns {string} - returns the module name
     * @private
     */
    protected getModuleName(): string;
    private actionBegin;
    private actionComplete;
    private actionPrevent;
    protected clearCustomFilter(col: Column): void;
    protected applyCustomFilter(): void;
    addEventListener(): void;
    removeEventListener(): void;
}
