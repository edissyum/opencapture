import { PivotView } from '../../pivotview/base/pivotview';
/**
 * Module to render Axis Fields
 */
/** @hidden */
export declare class AxisFields {
    parent: PivotView;
    /** Constructor for render module
     * @param {PivotView} parent - Instance.
     */
    constructor(parent: PivotView);
    /**
     * Initialize the grouping bar pivot button rendering
     * @returns {void}
     * @private
     */
    render(): void;
    private createPivotButtons;
}
