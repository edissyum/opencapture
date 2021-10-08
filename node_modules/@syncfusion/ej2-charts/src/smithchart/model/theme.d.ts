import { ISmithchartThemeStyle, ISmithchartFontMapping } from '../model/interface';
import { SmithchartTheme } from '../utils/enum';
export declare namespace Theme {
    /** @private */
    const axisLabelFont: ISmithchartFontMapping;
    /** @private */
    const smithchartTitleFont: ISmithchartFontMapping;
    /** @private */
    const smithchartSubtitleFont: ISmithchartFontMapping;
    /** @private */
    const dataLabelFont: ISmithchartFontMapping;
    /** @private */
    const legendLabelFont: ISmithchartFontMapping;
}
/**
 * @param {SmithchartTheme} theme theme of the smith chart
 * @private
 * @returns {string[]} series colors
 */
export declare function getSeriesColor(theme: SmithchartTheme): string[];
/**
 * @param {SmithchartTheme} theme smithchart theme
 * @private
 * @returns {ISmithchartThemeStyle} theme style of the smith chart
 */
export declare function getThemeColor(theme: SmithchartTheme): ISmithchartThemeStyle;
