/**
 * PivotFieldList component
 */
import { TestHelper } from '@syncfusion/ej2-base/helpers/e2e';
export declare class PivotFieldListHelper extends TestHelper {
    /**
     * Specifies the ID of the pivot field list.
     */
    id: string;
    /**
     * Specifies the current helper function of the pivot field list.
     */
    wrapperFn: Function;
    /**
     * Constructor to create a helper object for the pivot field list component.
     */
    constructor(id: string, wrapperFn: Function);
    /**
     * Gets the root element of the pivot field list component.
     */
    getElement(): any;
    /**
     * Gets the wrapper element of pop-up field list component, which will have node elements and axis elements.
     */
    getFieldListPopupElement(): any;
    /**
     * Gets the filter popup element of field list component. Which will have treeview and search elements.
     */
    getFilterPopupElement(): any;
    /**
     * Gets the context menu element of field list component, which will have the aggregation types.
     */
    getAggregationContextMenuElement(): any;
    /**
     * Gets the value field settings pop-up of field list component, which will have aggregation options and caption related elements.
     */
    getValueSettingsDialogElement(): any;
    /**
     * Gets the calculated field pop-up element of field list component, which will have elements to create a dynamic field.
     */
    getCalculatedMemberPopupElement(): any;
}
