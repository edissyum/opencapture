import { IFontMapping } from './interface';
import { AccumulationTheme } from '../../accumulation-chart/model/enum';
import { ChartTheme } from '../../chart/utils/enum';
import { IThemeStyle, IScrollbarThemeStyle } from '../../index';
/**
 * Specifies Chart Themes
 */
export declare namespace Theme {
    /** @private */
    const axisLabelFont: IFontMapping;
    /** @private */
    const axisTitleFont: IFontMapping;
    /** @private */
    const chartTitleFont: IFontMapping;
    /** @private */
    const chartSubTitleFont: IFontMapping;
    /** @private */
    const crosshairLabelFont: IFontMapping;
    /** @private */
    const tooltipLabelFont: IFontMapping;
    /** @private */
    const legendLabelFont: IFontMapping;
    /** @private */
    const legendTitleFont: IFontMapping;
    /** @private */
    const stripLineLabelFont: IFontMapping;
    /** @private */
    const stockEventFont: IFontMapping;
}
/** @private */
export declare function getSeriesColor(theme: ChartTheme | AccumulationTheme): string[];
/** @private */
export declare function getThemeColor(theme: ChartTheme | AccumulationTheme): IThemeStyle;
/** @private */
export declare function getScrollbarThemeColor(theme: ChartTheme): IScrollbarThemeStyle;
