import { MouseEventArgs } from '@syncfusion/ej2-base';
import { PivotView } from '../../pivotview/base/pivotview';
import { PivotFieldList } from '../../pivotfieldlist/base/field-list';
/**
 * `AggregateMenu` module to create aggregate type popup.
 */
/** @hidden */
export declare class AggregateMenu {
    parent: PivotView | PivotFieldList;
    private menuInfo;
    private parentElement;
    private buttonElement;
    private currentMenu;
    private valueDialog;
    private summaryTypes;
    private stringAggregateTypes;
    /**
     * Constructor for the rener action.
     * @hidden
     */
    constructor(parent?: PivotView | PivotFieldList);
    /**
     * Initialize the pivot table rendering
     * @returns {void}
     * @private
     */
    render(args: MouseEventArgs, parentElement: HTMLElement): void;
    private openContextMenu;
    private createContextMenu;
    private getMenuItem;
    private beforeMenuOpen;
    /** @hidden */
    createValueSettingsDialog(target: HTMLElement, parentElement: HTMLElement, type?: string): void;
    private createFieldOptions;
    private selectOptionInContextMenu;
    private updateDataSource;
    private updateValueSettings;
    private removeDialog;
    /**
     * To destroy the pivot button event listener
     * @returns {void}
     * @hidden
     */
    destroy(): void;
}
