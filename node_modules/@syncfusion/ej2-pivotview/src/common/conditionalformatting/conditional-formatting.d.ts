import { PivotView } from '../../pivotview/base/pivotview';
/**
 * Module to render Conditional Formatting Dialog
 */
/** @hidden */
export declare class ConditionalFormatting {
    parent: PivotView;
    /**
     * Internal variables.
     */
    private dialog;
    private parentID;
    private fieldsDropDown;
    private conditionsDropDown;
    private fontNameDropDown;
    private fontSizeDropDown;
    private fontColor;
    private backgroundColor;
    private newFormat;
    /** Constructor for conditionalformatting module
     * @param {PivotView} parent - Instance of pivot table.
     */
    constructor(parent: PivotView);
    /**
     * To get module name.
     * @returns {string} - Module name.
     */
    protected getModuleName(): string;
    private createDialog;
    private beforeOpen;
    private addButtonClick;
    private applyButtonClick;
    private cancelButtonClick;
    private refreshConditionValues;
    private addFormat;
    private createDialogElements;
    private renderDropDowns;
    private conditionChange;
    private fontNameChange;
    private fontSizeChange;
    private measureChange;
    private renderColorPicker;
    private backColorChange;
    private fontColorChange;
    private toggleButtonClick;
    /**
     * To check is Hex or not.
     * @param {string} h - hex value.
     * @returns {boolean} - boolean.
     * @hidden
     */
    isHex(h: string): boolean;
    /**
     * To convert hex to RGB.
     * @param {string} hex - hex value.
     * @returns { r: number, g: number, b: number } | null - Hex value.
     * @hidden
     */
    hexToRgb(hex: string): {
        r: number;
        g: number;
        b: number;
    } | null;
    /**
     * To convert color to hex.
     * @param {string} colour - color value.
     * @returns {string} - color value.
     * @hidden
     */
    colourNameToHex(colour: string): string;
    private removeDialog;
    private destroyColorPickers;
    /**
     * To create Conditional Formatting dialog.
     * @returns {void}
     */
    showConditionalFormattingDialog(): void;
    /**
     * To destroy the Conditional Formatting dialog
     * @returns {void}
     * @hidden
     */
    destroy(): void;
}
