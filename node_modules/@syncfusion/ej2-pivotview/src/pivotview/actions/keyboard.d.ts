import { KeyboardEventArgs } from '@syncfusion/ej2-base';
import { PivotView } from '../base/pivotview';
/**
 * PivotView Keyboard interaction
 */
/** @hidden */
export declare class KeyboardInteraction {
    /** @hidden */
    event: KeyboardEventArgs;
    private parent;
    private keyConfigs;
    private pivotViewKeyboardModule;
    private timeOutObj;
    /**
     * Constructor.
     * @param {PivotView} parent - Instance of pivot table.
     */
    constructor(parent: PivotView);
    private keyActionHandler;
    private getNextButton;
    private getPrevButton;
    private allpivotButtons;
    private processTab;
    private processShiftTab;
    private processEnter;
    private clearSelection;
    private processSelection;
    private getParentElement;
    private toggleFieldList;
    /**
     * To destroy the keyboard module.
     * @returns  {void}
     * @private
     */
    destroy(): void;
}
