import { Dialog } from '@syncfusion/ej2-popups';
import { PivotView } from '../../pivotview/base/pivotview';
import { DrillThroughEventArgs } from '../base/interface';
import { Grid, ColumnModel } from '@syncfusion/ej2-grids';
import { IDataSet } from '../../base/engine';
/**
 * `DrillThroughDialog` module to create drill-through dialog.
 */
/** @hidden */
export declare class DrillThroughDialog {
    parent: PivotView;
    /** @hidden */
    dialogPopUp: Dialog;
    /** @hidden */
    drillThroughGrid: Grid;
    /** @hidden */
    indexString: string[];
    private clonedData;
    private isUpdated;
    private gridIndexObjects;
    private engine;
    private gridData;
    private numericTextBox;
    private formatList;
    private drillKeyConfigs;
    private drillthroughKeyboardModule;
    /**
     * Constructor for the dialog action.
     * @hidden
     */
    constructor(parent?: PivotView);
    private frameHeaderWithKeys;
    /** @hidden */
    showDrillThroughDialog(eventArgs: DrillThroughEventArgs): void;
    private editCell;
    private updateData;
    private removeDrillThroughDialog;
    private createDrillThroughGrid;
    /** @hidden */
    frameGridColumns(rawData: IDataSet[]): ColumnModel[];
    private isDateFieldExist;
    private formatData;
    private dataWithPrimarykey;
    private drillthroughKeyActionHandler;
    private processClose;
    /**
     * To destroy the drillthrough keyboard module.
     * @returns  {void}
     * @hidden
     */
    destroy(): void;
}
