import { PivotView } from '../../pivotview/base/pivotview';
import { IAction } from '../../common/base/interface';
import { Toolbar } from '@syncfusion/ej2-navigations';
/**
 * Module for GroupingBar rendering
 */
/** @hidden */
export declare class GroupingBar implements IAction {
    /**
     * Internal variables
     */
    /** @hidden */
    gridPanel: Toolbar;
    /** @hidden */
    chartPanel: Toolbar;
    private groupingTable;
    private groupingChartTable;
    private leftAxisPanel;
    private rightAxisPanel;
    private filterPanel;
    private rowPanel;
    private columnPanel;
    private valuePanel;
    private rowAxisPanel;
    private columnAxisPanel;
    private valueAxisPanel;
    private filterAxisPanel;
    private touchObj;
    private resColWidth;
    private timeOutObj;
    /**
     * Module declarations
     */
    private parent;
    private handlers;
    /** Constructor for GroupingBar module */
    constructor(parent: PivotView);
    /**
     * For internal use only - Get the module name.
     * @returns {string} - Module name.
     * @private
     */
    protected getModuleName(): string;
    /** @hidden */
    renderLayout(): void;
    private appendToElement;
    private updateChartAxisHeight;
    /**
     * @hidden
     */
    refreshUI(): void;
    /** @hidden */
    alignIcon(): void;
    /**
     * @hidden
     */
    setGridRowWidth(): void;
    private setColWidth;
    private wireEvent;
    private unWireEvent;
    private dropIndicatorUpdate;
    private tapHoldHandler;
    RefreshFieldsPanel(): void;
    private createToolbarUI;
    /**
     * @hidden
     */
    addEventListener(): void;
    /**
     * @hidden
     */
    removeEventListener(): void;
    /**
     * To destroy the groupingbar
     * @returns {void}
     * @hidden
     */
    destroy(): void;
}
