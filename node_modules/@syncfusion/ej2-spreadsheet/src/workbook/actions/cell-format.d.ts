import { Workbook } from '../base/index';
/**
 * Workbook Cell format.
 */
export declare class WorkbookCellFormat {
    private parent;
    constructor(parent: Workbook);
    private format;
    private setBottomBorderPriority;
    private setFullBorder;
    private checkAdjustantBorder;
    private checkFullBorder;
    private textDecorationActionUpdate;
    private setTypedBorder;
    private setCellBorder;
    private setCellStyle;
    private skipHiddenRows;
    private addEventListener;
    private removeEventListener;
    private clearCellObj;
    /**
     * To destroy workbook cell format.
     *
     * @returns {void} - To destroy workbook cell format.
     */
    destroy(): void;
    /**
     * Get the workbook cell format module name.
     *
     *  @returns {void}
     */
    getModuleName(): string;
}
