import { IFontMapping, IThemeStyle } from './interface';
import { HeatMapTheme } from '../utils/enum';
/**
 * Specifies HeatMaps Themes
 */
export declare namespace Theme {
    /** @private */
    const heatMapTitleFont: IFontMapping;
    /** @private */
    const titleFont: IFontMapping;
    /** @private */
    const axisTitleFont: IFontMapping;
    /** @private */
    const axisLabelFont: IFontMapping;
    /** @private */
    const legendLabelFont: IFontMapping;
    /** @private */
    const rectLabelFont: IFontMapping;
    /** @private */
    const tooltipFont: IFontMapping;
}
/**
 * Functions to check whether target object implement specific interface.
 *
 * @param  { HeatMapTheme } theme - specifies the value.
 * @returns { IThemeStyle } returns the theme style
 */
export declare function getThemeColor(theme: HeatMapTheme): IThemeStyle;
