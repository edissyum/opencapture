import { PivotView } from '../../pivotview/base/pivotview';
import { PivotFieldList } from '../../pivotfieldlist/base/field-list';
import { ContextMenu } from '@syncfusion/ej2-navigations';
/**
 * Module to render Pivot button
 */
/** @hidden */
export declare class PivotContextMenu {
    parent: PivotView | PivotFieldList;
    /** @hidden */
    menuObj: ContextMenu;
    /** @hidden */
    fieldElement: HTMLElement;
    /** Constructor for render module */
    constructor(parent: PivotView | PivotFieldList);
    /**
     * Initialize the pivot table rendering
     * @returns {void}
     * @private
     */
    render(): void;
    private renderContextMenu;
    private onBeforeMenuOpen;
    private onSelectContextMenu;
    /**
     * To destroy the pivot button event listener
     * @returns {void}
     * @hidden
     */
    destroy(): void;
}
