import { PivotView } from '../../pivotview/base/pivotview';
import { Dialog } from '@syncfusion/ej2-popups';
import { IAction } from '../base/interface';
/**
 * Module to render NumberFormatting Dialog
 */
export declare class NumberFormatting implements IAction {
    parent: PivotView;
    dialog: Dialog;
    private valuesDropDown;
    private formatDropDown;
    private groupingDropDown;
    private decimalDropDown;
    private customText;
    private customLable;
    private newFormat;
    private lastFormattedValue;
    constructor(parent?: PivotView);
    /**
     * To get module name.
     * @returns {string} - string
     */
    protected getModuleName(): string;
    /**
     * To show Number Formatting dialog.
     * @returns {void}
     */
    showNumberFormattingDialog(): void;
    private getDialogContent;
    private renderControls;
    private valueChange;
    private updateFormattingDialog;
    private customUpdate;
    private dropDownChange;
    private groupingChange;
    private getIndexValue;
    private decimalChange;
    private formattedText;
    private removeDialog;
    private updateFormatting;
    private insertFormat;
    /**
     * To add event listener.
     * @returns {void}
     * @hidden
     */
    addEventListener(): void;
    /**
     * To remove event listener.
     * @returns {void}
     * @hidden
     */
    removeEventListener(): void;
    /**
     * To destroy the calculated field dialog
     * @returns {void}
     * @hidden
     */
    destroy(): void;
}
