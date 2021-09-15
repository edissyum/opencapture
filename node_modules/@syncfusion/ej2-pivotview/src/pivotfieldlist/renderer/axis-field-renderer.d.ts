import { PivotFieldList } from '../base/field-list';
/**
 * Module to render Axis Fields
 */
/** @hidden */
export declare class AxisFieldRenderer {
    parent: PivotFieldList;
    /** Constructor for render module */
    constructor(parent: PivotFieldList);
    /**
     * Initialize the pivot button rendering
     * @returns {void}
     * @private
     */
    render(): void;
    private createPivotButtons;
}
