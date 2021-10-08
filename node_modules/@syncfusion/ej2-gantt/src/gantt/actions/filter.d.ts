import { Gantt } from '../base/gantt';
/**
 * The Filter module is used to handle filter action.
 */
export declare class Filter {
    parent: Gantt;
    private filterMenuElement;
    constructor(gantt: Gantt);
    private getModuleName;
    /**
     * Update custom filter for default Gantt columns
     *
     * @returns {void} .
     */
    private updateCustomFilters;
    private updateModel;
    private addEventListener;
    private initiateFiltering;
    /**
     * To get filter menu UI
     *
     * @param {ColumnModel} column .
     * @returns {IFilterMUI} .
     */
    private getCustomFilterUi;
    private getDatePickerFilter;
    private getDateTimePickerFilter;
    private getDurationFilter;
    /**
     * Remove filter menu while opening column chooser menu
     *
     * @param {ColumnMenuOpenEventArgs} args .
     * @returns {void} .
     */
    private columnMenuOpen;
    private actionBegin;
    closeFilterOnContextClick(element: Element): void;
    private actionComplete;
    private setPosition;
    private updateFilterMenuPosition;
    private removeEventListener;
    /**
     * To destroy module
     *
     * @returns {void} .
     */
    destroy(): void;
}
