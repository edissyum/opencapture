/**
 * Maps Themes doc
 */
import { IFontMapping, MapsTheme } from '../index';
import { IThemeStyle } from './interface';
/**
 * Specifies Maps Themes
 */
export declare namespace Theme {
    /** @private */
    const mapsTitleFont: IFontMapping;
    /** @private */
    const mapsSubTitleFont: IFontMapping;
    /** @private */
    const tooltipLabelFont: IFontMapping;
    /** @private */
    const legendTitleFont: IFontMapping;
    /** @private */
    const legendLabelFont: IFontMapping;
    /** @private */
    const dataLabelFont: IFontMapping;
}
export declare namespace FabricTheme {
    /** @private */
    const mapsTitleFont: IFontMapping;
    /** @private */
    const mapsSubTitleFont: IFontMapping;
    /** @private */
    const tooltipLabelFont: IFontMapping;
    /** @private */
    const legendTitleFont: IFontMapping;
    /** @private */
    const legendLabelFont: IFontMapping;
    /** @private */
    const dataLabelFont: IFontMapping;
}
export declare namespace BootstrapTheme {
    /** @private */
    const mapsTitleFont: IFontMapping;
    /** @private */
    const mapsSubTitleFont: IFontMapping;
    /** @private */
    const tooltipLabelFont: IFontMapping;
    /** @private */
    const legendTitleFont: IFontMapping;
    /** @private */
    const legendLabelFont: IFontMapping;
    /** @private */
    const dataLabelFont: IFontMapping;
}
/**
 * Internal use of Method to getting colors based on themes.
 *
 * @private
 * @param {MapsTheme} theme Specifies the theme of the maps
 * @returns {string[]} Returns the shape color
 */
export declare function getShapeColor(theme: MapsTheme): string[];
/**
 * HighContrast Theme configuration
 */
export declare namespace HighContrastTheme {
    /** @private */
    const mapsTitleFont: IFontMapping;
    /** @private */
    const mapsSubTitleFont: IFontMapping;
    /** @private */
    const tooltipLabelFont: IFontMapping;
    /** @private */
    const legendTitleFont: IFontMapping;
    /** @private */
    const legendLabelFont: IFontMapping;
    /** @private */
    const dataLabelFont: IFontMapping;
}
/**
 * Dark Theme configuration
 */
export declare namespace DarkTheme {
    /** @private */
    const mapsTitleFont: IFontMapping;
    /** @private */
    const mapsSubTitleFont: IFontMapping;
    /** @private */
    const tooltipLabelFont: IFontMapping;
    /** @private */
    const legendTitleFont: IFontMapping;
    /** @private */
    const legendLabelFont: IFontMapping;
}
/**
 * Method to get the theme style
 *
 * @param {MapsTheme} theme - Specifies the theme.
 * @returns {IThemeStyle} - Returns the theme style.
 */
export declare function getThemeStyle(theme: MapsTheme): IThemeStyle;
