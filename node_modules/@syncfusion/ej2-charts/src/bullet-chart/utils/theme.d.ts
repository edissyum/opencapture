import { IFontMapping } from '../../common/model/interface';
import { ChartTheme } from '../../chart/utils/enum';
import { IBulletStyle } from '../model/bullet-interface';
/**
 *
 */
export declare namespace BulletChartTheme {
    /** @private */
    const axisLabelFont: IFontMapping;
    /** @private */
    const tooltipLabelFont: IFontMapping;
    /** @private */
    const legendLabelFont: IFontMapping;
    /** @private */
    const dataLabelFont: IFontMapping;
    /** @private */
    const titleFont: IFontMapping;
    /** @private */
    const subTitleFont: IFontMapping;
}
/** @private
 * @param {ChartTheme} theme Passed theme parameter.
 * @returns {IBulletStyle} It returns bullet style.
 */
export declare function getBulletThemeColor(theme: ChartTheme): IBulletStyle;
