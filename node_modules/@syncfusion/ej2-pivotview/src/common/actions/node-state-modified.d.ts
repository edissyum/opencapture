import { DragEventArgs } from '@syncfusion/ej2-base';
import { PivotCommon } from '../base/pivot-common';
import { DragAndDropEventArgs } from '@syncfusion/ej2-navigations';
/**
 * `DialogAction` module is used to handle field list dialog related behaviour.
 */
/** @hidden */
export declare class NodeStateModified {
    parent: PivotCommon;
    /**
     * Constructor for the dialog action.
     * @param {PivotCommon} parent - parent.
     * @hidden
     */
    constructor(parent?: PivotCommon);
    /**
     * Updates the dataSource by drag and drop the selected field from either field list or axis table with dropped target position.
     * @function onStateModified
     * @param  {DragEventArgs & DragAndDropEventArgs} args -  Contains both pivot button and field list drag and drop information.
     * @param  {string} fieldName - Defines dropped field name to update dataSource.
     * @returns {void}
     * @hidden
     */
    onStateModified(args: DragEventArgs & DragAndDropEventArgs, fieldName: string): boolean;
    private getButtonPosition;
}
