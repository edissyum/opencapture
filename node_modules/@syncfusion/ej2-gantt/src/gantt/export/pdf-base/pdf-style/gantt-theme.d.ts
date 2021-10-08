import { PdfTheme } from './../../../base/enum';
import { IGanttStyle } from './../../../base/interface';
/**
 * @hidden
 */
export declare class PdfGanttTheme {
    ganttStyle: IGanttStyle;
    private theme;
    constructor(theme: PdfTheme);
    readonly style: IGanttStyle;
    private setTheme;
    private initStyles;
}
