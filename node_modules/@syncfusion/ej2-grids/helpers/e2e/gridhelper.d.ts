import { TestHelper } from '@syncfusion/ej2-base/helpers/e2e';
/**
 * Represents the class which contains Helper functions to test Grid component.
 */
export declare class GridHelper extends TestHelper {
    id: string;
    wrapperFn: Function;
    constructor(id: string, wrapperFn: Function);
    /**
     * Gets container element of the grid component.
     * @return {Element}
     */
    getDataGridElement(): any;
    /**
     * Gets the header element of the grid component.
     * @return {Element}
     */
    getHeaderElement(): any;
    /**
     * Gets the content element of the grid component.
     * @return {Element}
     */
    getContentElement(): any;
    /**
     * Gets the footer element of the grid component when [`aggregates`](./aggregates.html) functionality is configured in the grid.
     * @return {Element}
     */
    getFooterElement(): any;
    /**
     * Gets the pager element of the grid component when [`allowPaging`](./api-grid.html#allowpaging) property is set to true.
     * @return {Element}
     */
    getPagerElement(): any;
    /**
     * Gets the dialog container of the grid component when edit mode is set as Dialog in the [`editSettings`](./api-grid.html#editSettings) property and grid is in edit state.
     * @return {Element}
     */
    getDialogElement(): any;
    /**
      * Gets the filter container of the grid component when filter type is set as Menu or CheckBox or Excel in the [`filterSettings`](./api-grid.html#filterSettings) property and popup is in open state.
      * @return {Element}
      */
    getFilterPopupElement(): any;
    /**
     * Gets the toolbar element of the grid component when [`toolbar`](./api-grid.html#toolbar) property is configured in the grid.
     * @return {Element}
     */
    getToolbarElement(): any;
    /**
     * Gets the active numeric items's element of pager when [`allowPaging`](./api-grid.html#allowPaging) property is set to true.
     * @return {Element}
     */
    getCurrentPagerElement(): any;
    /**
     * Gets the dropdown element of the grid pager when [`pageSizes`](./api-grid.html#pageSettings) is set to true in [`pageSettings`](./api-grid.html#pageSettings) property of the grid.
     * @return {Element}
     */
    getPagerDropDownElement(): any;
}
