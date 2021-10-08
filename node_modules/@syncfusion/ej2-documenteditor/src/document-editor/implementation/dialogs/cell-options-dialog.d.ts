import { LayoutViewer } from '../index';
import { TableOptionsDialog } from './index';
import { Dialog } from '@syncfusion/ej2-popups';
import { NumericTextBox } from '@syncfusion/ej2-inputs';
import { WCellFormat } from '../index';
import { L10n } from '@syncfusion/ej2-base';
import { TableRowWidget } from '../viewer/page';
import { TextPosition } from '../selection/selection-helper';
import { DocumentHelper } from '../viewer';
/**
 * The Cell options dialog is used to modify margins of selected cells.
 */
export declare class CellOptionsDialog {
    /**
     * @private
     */
    documentHelper: DocumentHelper;
    owner: LayoutViewer;
    /**
     * @private
     */
    dialog: Dialog;
    /**
     * @private
     */
    target: HTMLElement;
    private sameAsTableCheckBox;
    /**
     * @private
     */
    sameAsTable: boolean;
    /**
     * @private
     */
    topMarginBox: NumericTextBox;
    /**
     * @private
     */
    leftMarginBox: NumericTextBox;
    /**
     * @private
     */
    bottomMarginBox: NumericTextBox;
    /**
     * @private
     */
    rightMarginBox: NumericTextBox;
    /**
     * @private
     */
    cellFormatIn: WCellFormat;
    /**
     * @param {DocumentHelper} documentHelper - Specifies the document helper.
     * @private
     */
    constructor(documentHelper: DocumentHelper);
    /**
     * @private
     * @returns {WCellFormat} - Returns cell format.
     */
    readonly cellFormat: WCellFormat;
    private getModuleName;
    /**
     * @private
     * @param {L10n} localValue - Specifies the locale.
     * @param {boolean} isRtl - Specifies is rtl.
     * @returns {void}
     */
    initCellMarginsDialog(localValue: L10n, isRtl?: boolean): void;
    /**
     * @private
     * @returns {void}
     */
    show(): void;
    /**
     * @private
     * @returns {void}
     */
    removeEvents: () => void;
    /**
     * @private
     * @returns {void}
     */
    changeSameAsTable: () => void;
    /**
     * @private
     * @returns {void}
     */
    loadCellMarginsDialog(): void;
    private loadCellProperties;
    /**
     * @private
     * @returns {void}
     */
    applyTableCellProperties: () => void;
    /**
     * @private
     * @param {WCellFormat} cellFormat Specifies cell format.
     * @returns {void}
     */
    applySubCellOptions(cellFormat: WCellFormat): void;
    applyCellMarginValue(row: TableRowWidget, start: TextPosition, end: TextPosition, cellFormat: WCellFormat): void;
    private applyCellMarginsInternal;
    private applyCellMarginsForCells;
    private iterateCells;
    private applySubCellMargins;
    private applyTableOptions;
    /**
     * @private
     * @returns {void}
     */
    closeCellMarginsDialog: () => void;
    /**
     * @private
     * @returns {void}
     */
    destroy(): void;
    /**
     * @private
     * @param {CellOptionsDialog | TableOptionsDialog} dialog - Specifies cell options dialog.
     * @param {HTMLDivElement} div - Specifies the html element.
     * @param {L10n} locale - Specifies the locale
     * @returns {void}
     */
    static getCellMarginDialogElements(dialog: CellOptionsDialog | TableOptionsDialog, div: HTMLDivElement, locale: L10n): void;
}
