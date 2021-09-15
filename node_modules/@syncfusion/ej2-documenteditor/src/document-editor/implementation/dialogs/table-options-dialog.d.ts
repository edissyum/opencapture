import { Dialog } from '@syncfusion/ej2-popups';
import { NumericTextBox } from '@syncfusion/ej2-inputs';
import { WTableFormat } from '../index';
import { L10n } from '@syncfusion/ej2-base';
import { DocumentHelper } from '../viewer';
/**
 * The Table options dialog is used to modify default cell margins and cell spacing of selected table.
 */
export declare class TableOptionsDialog {
    /**
     * @private
     */
    documentHelper: DocumentHelper;
    /**
     * @private
     */
    dialog: Dialog;
    /**
     * @private
     */
    target: HTMLElement;
    private cellspacingTextBox;
    private allowSpaceCheckBox;
    private cellSpaceTextBox;
    /**
     * @private
     */
    leftMarginBox: NumericTextBox;
    /**
     * @private
     */
    topMarginBox: NumericTextBox;
    /**
     * @private
     */
    rightMarginBox: NumericTextBox;
    /**
     * @private
     */
    bottomMarginBox: NumericTextBox;
    /**
     * @private
     */
    tableFormatIn: WTableFormat;
    /**
     * @param {DocumentHelper} documentHelper - Specifies the document helper.
     * @private
     */
    constructor(documentHelper: DocumentHelper);
    /**
     * @private
     * @returns {WTableFormat} - Returns table format.
     */
    readonly tableFormat: WTableFormat;
    private getModuleName;
    /**
     * @private
     * @param {L10n} localValue - Specifies the locale value
     * @param {boolean} isRtl - Specifies the is rtl
     * @returns {void}
     */
    initTableOptionsDialog(localValue: L10n, isRtl?: boolean): void;
    /**
     * @private
     * @returns {void}
     */
    loadCellMarginsDialog(): void;
    /**
     * @private
     * @returns {void}
     */
    applyTableCellProperties: () => void;
    /**
     * @private
     * @param {WTableFormat} tableFormat Specifies table format.
     * @returns {void}
     */
    applySubTableOptions(tableFormat: WTableFormat): void;
    /**
     * @private
     * @param {WTableFormat} tableFormat Specifies table format.
     * @returns {void}
     */
    applyTableOptionsHelper(tableFormat: WTableFormat): void;
    private applyTableOptionsHistory;
    private applySubTableOptionsHelper;
    /**
     * @private
     * @param {WTableFormat} tableFormat Specifies the table format
     */
    applyTableOptions(tableFormat: WTableFormat): void;
    /**
     * @private
     * @returns {void}
     */
    closeCellMarginsDialog: () => void;
    /**
     * @private
     * @returns {void}
     */
    show(): void;
    /**
     * @private
     * @returns {void}
     */
    changeAllowSpaceCheckBox: () => void;
    /**
     * @private
     * @returns {void}
     */
    removeEvents: () => void;
    /**
     * @private
     * @returns {void}
     */
    destroy(): void;
}
