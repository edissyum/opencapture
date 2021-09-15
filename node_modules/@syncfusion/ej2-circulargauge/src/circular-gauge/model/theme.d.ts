import { IFontMapping, IThemeStyle } from './interface';
import { GaugeTheme } from '../utils/enum';
/**
 * Specifies gauge Themes
 */
export declare namespace Theme {
    /** @private */
    const axisLabelFont: IFontMapping;
    const legendLabelFont: IFontMapping;
}
/**
 * @param {string} theme theme
 * @returns {string[]} palette
 * @private */
export declare function getRangePalette(theme: string): string[];
/**
 * Function to get ThemeStyle
 *
 * @param {GaugeTheme} theme theme
 * @returns {IThemeStyle} style
 * @private */
export declare function getThemeStyle(theme: GaugeTheme): IThemeStyle;
