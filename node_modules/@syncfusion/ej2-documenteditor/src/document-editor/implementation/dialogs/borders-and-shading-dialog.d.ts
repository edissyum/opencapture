import { L10n } from '@syncfusion/ej2-base';
import { DocumentHelper } from '../viewer';
/**
 * The Borders and Shading dialog is used to modify borders and shading options for selected table or cells.
 */
export declare class BordersAndShadingDialog {
    documentHelper: DocumentHelper;
    private dialog;
    private target;
    private tableFormatIn;
    private cellFormatIn;
    private applyTo;
    private cellFormat;
    private tableFormat;
    private borderStyle;
    private borderColorPicker;
    private noneDiv;
    private boxDiv;
    private allDiv;
    private customDiv;
    private noneDivTransparent;
    private boxDivTransparent;
    private allDivTransparent;
    private customDivTransparent;
    private previewDiv;
    private previewRightDiagonalDiv;
    private previewLeftDiagonalDiv;
    private previewVerticalDiv;
    private previewHorizontalDiv;
    private previewDivTopTopContainer;
    private previewDivTopTop;
    private previewDivTopCenterContainer;
    private previewDivTopCenter;
    private previewDivTopBottomContainer;
    private previewDivTopBottom;
    private previewDivLeftDiagonalContainer;
    private previewDivLeftDiagonal;
    private previewDivBottomLeftContainer;
    private previewDivBottomLeft;
    private previewDivBottomcenterContainer;
    private previewDivBottomcenter;
    private previewDivBottomRightContainer;
    private previewDivBottomRight;
    private previewDivDiagonalRightContainer;
    private previewDivDiagonalRight;
    private previewDivTopTopTransParent;
    private previewDivTopCenterTransParent;
    private previewDivTopBottomTransParent;
    private previewDivLeftDiagonalTransParent;
    private previewDivBottomLeftTransparent;
    private previewDivBottomcenterTransparent;
    private previewDivBottomRightTransparent;
    private previewDivDiagonalRightTransparent;
    private shadingContiner;
    private shadingColorPicker;
    private ulelementShading;
    private borderWidth;
    private isShadingChanged;
    /**
     * @param {DocumentHelper} documentHelper - Specifies the document helper.
     * @private
     */
    constructor(documentHelper: DocumentHelper);
    private getModuleName;
    /**
     * @private
     * @param {L10n} localeValue - Specifies the locale.
     * @param {boolean} isRtl - Specifies is rtl.
     * @returns {void}
     */
    initBordersAndShadingsDialog(localeValue: L10n, isRtl?: boolean): void;
    /**
     * @private
     * @returns {void}
     */
    private applyBordersShadingsProperties;
    private applyFormat;
    private getBorder;
    private checkClassName;
    /**
     * @private
     * @returns {void}
     */
    closeDialog: () => void;
    /**
     * @private
     * @returns {void}
     */
    private closeBordersShadingsDialog;
    /**
     * @private
     * @returns {void}
     */
    show(): void;
    /**
     * @private
     * @param {Event} event - Specifies the event args.
     * @returns {void}
     */
    private handleSettingCheckBoxAction;
    private updateClassForSettingDivElements;
    private setSettingPreviewDivElement;
    private isShowHidePreviewTableElements;
    /**
     * @private
     * @param {Event} event - Specifies the event args.
     * @returns {void}
     */
    private handlePreviewCheckBoxAction;
    private handlePreviewCheckBoxShowHide;
    private showHidePreviewDivElements;
    private setPropertyPreviewDivElement;
    /**
     * @private
     * @returns {void}
     */
    private applyTableCellPreviewBoxes;
    /**
     * @private
     * @param {ColorPickerEventArgs} args - Specifies the event args.
     * @returns {void}
     */
    private applyPreviewTableBackgroundColor;
    /**
     * @private
     * @param {ColorPickerEventArgs} args - Specifies the event args.
     * @returns {void}
     */
    private applyPreviewTableBorderColor;
    private loadBordersShadingsPropertiesDialog;
    private cloneBorders;
    private getLineStyle;
    /**
     * @private
     * @returns {void}
     */
    destroy(): void;
}
