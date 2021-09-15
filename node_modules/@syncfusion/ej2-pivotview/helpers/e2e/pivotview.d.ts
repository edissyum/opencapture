/**
 * PivotView component
 */
import { TestHelper } from '@syncfusion/ej2-base/helpers/e2e';
export declare class PivotViewHelper extends TestHelper {
    /**
     * Specifies the ID of the pivot view.
     */
    id: string;
    /**
     * Specifies the current helper function of the pivot view.
     */
    wrapperFn: Function;
    /**
     * Constructor to create a helper object for the pivot view component.
     */
    constructor(id: string, wrapperFn: Function);
    /**
     * Gets the root element of the pivot view component.
     */
    getElement(): any;
    /**
     * Gets the grid table element of the pivot view component.
     */
    getGridElement(): any;
    /**
     * Gets the filter pop-up element of pivot view component, which will have treeview and search elements.
     */
    getFilterPopupElement(): any;
    /**
     * Gets the context menu element of pivot view component, which will have the aggregation types.
     */
    getAggregationContextMenuElement(): any;
    /**
     * Gets the value field settings pop-up of the pivot view component.
     */
    getValueSettingsDialogElement(): any;
    /**
     * Gets the drill-through pop-up element of the pivot view component.
     */
    getDrillThroughPopupElement(): any;
    /**
     * Gets the conditional formatting pop-up element of the pivot view component.
     */
    getConditionalFormattingPopupElement(): any;
    /**
     * Gets the field list element from the pivot view component.
     */
    getFieldListIconElement(): any;
    /**
     * Gets the field list pop-up element from the pivot view component, which will have node elements and axis elements.
     */
    getFieldListPopupElement(): any;
    /**
     * Gets the fieldlist's calculated field pop-up element from the pivot view component, which will have elements to create a dynamic field.
     */
    getCalculatedMemberPopupElement(): any;
    /**
     * Gets the fieldlist's filter pop-up element from the pivot view component, which will have treeview and search elements.
     */
    getFieldListFilterPopupElement(): any;
    /**
     * Gets the fieldlist's context menu element from the pivot view component.
     */
    getFieldListAggregationContextMenuElement(): any;
    /**
     * Gets the fieldlist's value field settings element from the pivot view component, which will have aggregation options and caption related elements.
     */
    getFieldListValueSettingsPopupElement(): any;
}
