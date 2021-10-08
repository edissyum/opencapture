import { IFilterArgs, FilterUI } from '../base/interface';
import { ContextMenu, MenuEventArgs } from '@syncfusion/ej2-navigations';
import { CheckBoxFilterBase } from '../common/checkbox-filter-base';
import { IXLFilter } from '../common/filter-interface';
/**
 * @hidden
 * `ExcelFilter` module is used to handle filtering action.
 */
export declare class ExcelFilterBase extends CheckBoxFilterBase {
    private dlgDiv;
    private dlgObj;
    private customFilterOperators;
    private optrData;
    private menuItem;
    private menu;
    private cmenu;
    protected menuObj: ContextMenu;
    private isCMenuOpen;
    private firstOperator;
    private secondOperator;
    private childRefs;
    private eventHandlers;
    private isDevice;
    /**
     * Constructor for excel filtering module
     *
     * @param {IXLFilter} parent - parent details
     * @param {Object} customFltrOperators - operator details
     * @hidden
     */
    constructor(parent?: IXLFilter, customFltrOperators?: Object);
    private getCMenuDS;
    /**
     * To destroy the filter bar.
     *
     * @returns {void}
     * @hidden
     */
    destroy(): void;
    private createMenu;
    private createMenuElem;
    private wireExEvents;
    private unwireExEvents;
    private clickExHandler;
    private destroyCMenu;
    private hoverHandler;
    private ensureTextFilter;
    private preventClose;
    private getContextBounds;
    private getCMenuYPosition;
    openDialog(options: IFilterArgs): void;
    closeDialog(): void;
    private selectHandler;
    /**
     * @hidden
     * @param {MenuEventArgs} e - event args
     * @returns {void}
     */
    renderDialogue(e?: MenuEventArgs): void;
    private renderResponsiveDialog;
    /**
     * @hidden
     * @returns {void}
     */
    removeDialog(): void;
    private createdDialog;
    private renderCustomFilter;
    /**
     * @hidden
     * @param {string} col - Defines column details
     * @returns {void}
     */
    filterBtnClick(col: string): void;
    /**
     * @hidden
     * Filters grid row by column name with given options.
     *
     * @param {string} fieldName - Defines the field name of the filter column.
     * @param {string} firstOperator - Defines the first operator by how to filter records.
     * @param {string | number | Date | boolean} firstValue - Defines the first value which is used to filter records.
     * @param  {string} predicate - Defines the relationship between one filter query with another by using AND or OR predicate.
     * @param {boolean} matchCase - If ignore case set to true, then filter records with exact match or else
     * filter records with case insensitive(uppercase and lowercase letters treated as same).
     * @param {boolean} ignoreAccent - If ignoreAccent set to true, then ignores the diacritic characters or accents when filtering.
     * @param {string} secondOperator - Defines the second operator by how to filter records.
     * @param {string | number | Date | boolean} secondValue - Defines the first value which is used to filter records.
     * @returns {void}
     */
    filterByColumn(fieldName: string, firstOperator: string, firstValue: string | number | Date | boolean, predicate?: string, matchCase?: boolean, ignoreAccent?: boolean, secondOperator?: string, secondValue?: string | number | Date | boolean): void;
    private renderOperatorUI;
    private removeHandlersFromComponent;
    private dropDownOpen;
    private dropDownValueChange;
    /**
     * @hidden
     * @returns {FilterUI} returns filter UI
     */
    getFilterUIInfo(): FilterUI;
    private getSelectedValue;
    private dropSelectedVal;
    private getSelectedText;
    private renderFilterUI;
    private renderRadioButton;
    private removeObjects;
    private renderFlValueUI;
    private getExcelFilterData;
    private renderMatchCase;
    private renderDate;
    private renderDateTime;
    private completeAction;
    private renderNumericTextBox;
    private renderAutoComplete;
    private acActionComplete;
    private acFocus;
}
