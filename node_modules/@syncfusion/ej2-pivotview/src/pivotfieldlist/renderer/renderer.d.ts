import { PivotFieldList } from '../base/field-list';
/**
 * Module to render Pivot Table component
 */
/** @hidden */
export declare class Render {
    parent: PivotFieldList;
    /** Constructor for render module
     * @param {PivotFieldList} parent - Instance of field list.
     */
    constructor(parent: PivotFieldList);
    /**
     * Initialize the pivot table rendering
     * @returns {void}
     * @private
     */
    render(): void;
}
