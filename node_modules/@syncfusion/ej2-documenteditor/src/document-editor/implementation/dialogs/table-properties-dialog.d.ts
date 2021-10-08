import { L10n } from '@syncfusion/ej2-base';
import { TableWidget } from '../viewer/page';
import { DocumentHelper } from '../viewer';
/**
 * The Table properties dialog is used to modify properties of selected table.
 */
export declare class TablePropertiesDialog {
    private dialog;
    private target;
    private cellAlignment;
    private tableAlignment;
    documentHelper: DocumentHelper;
    private preferCheckBox;
    private tableWidthType;
    private preferredWidth;
    private rowHeightType;
    private rowHeightCheckBox;
    private rowHeight;
    private cellWidthType;
    private preferredCellWidthCheckBox;
    private preferredCellWidth;
    private tableTab;
    private rowTab;
    private cellTab;
    private left;
    private center;
    private right;
    private leftIndent;
    private allowRowBreak;
    private repeatHeader;
    private cellTopAlign;
    private cellCenterAlign;
    private cellBottomAlign;
    private indentingLabel;
    private hasTableWidth;
    private hasCellWidth;
    private bidi;
    /**
     * @private
     */
    isTableBordersAndShadingUpdated: boolean;
    /**
     * @private
     */
    isCellBordersAndShadingUpdated: boolean;
    private tableFormatIn;
    private rowFormatInternal;
    private cellFormatIn;
    private tableWidthBox;
    private rowHeightBox;
    private cellWidthBox;
    private leftIndentBox;
    private bordersAndShadingButton;
    private tableOptionButton;
    private cellOptionButton;
    private rowHeightValue;
    private tabObj;
    private rtlButton;
    private ltrButton;
    private localValue;
    /**
     * @private
     */
    isCellOptionsUpdated: boolean;
    /**
     * @private
     */
    isTableOptionsUpdated: boolean;
    private cellFormat;
    private tableFormat;
    private readonly rowFormat;
    /**
     * @param {DocumentHelper} documentHelper - Specifies the document helper.
     * @private
     */
    constructor(documentHelper: DocumentHelper);
    private getModuleName;
    /**
     * @private
     * @param {L10n} localValue - Specifies the locale value
     * @param {boolean} isRtl - Specifies the is rtl
     * @returns {void}
     */
    initTablePropertyDialog(localValue: L10n, isRtl?: boolean): void;
    /**
     * @private
     * @returns {void}
     */
    show(): void;
    /**
     * @returns {void}
     */
    private onBeforeOpen;
    /**
     * @private
     * @returns {void}
     */
    onCloseTablePropertyDialog: () => void;
    /**
     * @private
     * @returns {void}
     */
    applyTableProperties: () => void;
    /**
     * @private
     * @param {TableWidget} table - Specifies the table widget.
     * @returns {void}
     */
    calculateGridValue(table: TableWidget): void;
    /**
     * @private
     * @returns {void}
     */
    applyTableSubProperties: () => void;
    /**
     * @private
     * @returns {void}
     */
    loadTableProperties(): void;
    /**
     * @private
     * @returns {void}
     */
    unWireEvent: () => void;
    /**
     * @private
     * @returns {void}
     */
    wireEvent(): void;
    /**
     * @private
     * @returns {void}
     */
    closeTablePropertiesDialog: () => void;
    private initTableProperties;
    /**
     * @private
     * @param {Event} event - Specified the event.
     * @returns {void}
     */
    private changeBidirectional;
    /**
     * @private
     * @returns {void}
     */
    onTableWidthChange(): void;
    /**
     * @private
     * @returns {void}
     */
    onTableWidthTypeChange(): void;
    /**
     * @private
     * @returns {void}
     */
    onLeftIndentChange(): void;
    private setTableProperties;
    private activeTableAlignment;
    /**
     * @private
     * @returns {void}
     */
    changeTableCheckBox: () => void;
    /**
     * @private
     * @param {Event} event - Specified the event.
     * @returns {void}
     */
    changeTableAlignment: (event: Event) => void;
    /**
     * @private
     * @returns {string} Resturns table alignment
     */
    getTableAlignment(): string;
    private updateClassForAlignmentProperties;
    private initTableRowProperties;
    private setTableRowProperties;
    /**
     * @private
     * @returns {void}
     */
    onRowHeightChange(): void;
    /**
     * @private
     * @returns {void}
     */
    onRowHeightTypeChange(): void;
    /**
     * @private
     * @returns {void}
     */
    changeTableRowCheckBox: () => void;
    private onAllowBreakAcrossPage;
    private onRepeatHeader;
    /**
     * @private
     * @returns {boolean} Returns enable repeat header
     */
    enableRepeatHeader(): boolean;
    private initTableCellProperties;
    private setTableCellProperties;
    private updateClassForCellAlignment;
    private formatNumericTextBox;
    /**
     * @private
     * @returns {string} - Returns the alignement.
     */
    getCellAlignment(): string;
    /**
     * @private
     * @returns {void}
     */
    changeTableCellCheckBox: () => void;
    /**
     * @private
     * @returns {void}
     */
    onCellWidthChange(): void;
    /**
     * @private
     * @returns {void}
     */
    onCellWidthTypeChange(): void;
    /**
     * @private
     * @param {Event} event - Specified the event
     * @returns {void}
     */
    changeCellAlignment: (event: Event) => void;
    /**
     * @private
     *
     * @returns {void}
     */
    showTableOptionsDialog: () => void;
    /**
     * @private
     *
     * @returns {void}
     */
    showBordersShadingsPropertiesDialog: () => void;
    /**
     * @private
     *
     * @returns {void}
     */
    showCellOptionsDialog: () => void;
    /**
     * @private
     *
     * @returns {void}
     */
    destroy(): void;
}
