/**
 * Maps Themes doc
 */
import { IFontMapping, IThemeStyle } from '../model/interface';
import { TreeMapTheme } from '../utils/enum';
export declare namespace Theme {
    /**
     * @private
     */
    const mapsTitleFont: IFontMapping;
}
/**
 * To get the theme style based on treemap theme.
 *
 * @param {TreeMapTheme} theme Specifies the theme of the treemap control.
 * @returns {IThemeStyle} Returns the theme.
 * @private
 */
export declare function getThemeStyle(theme: TreeMapTheme): IThemeStyle;
