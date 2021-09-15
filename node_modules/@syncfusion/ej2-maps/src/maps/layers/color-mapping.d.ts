import { Maps } from '../../index';
import { ShapeSettingsModel, ColorMappingSettingsModel, ColorValue } from '../index';
/**
 * ColorMapping class
 */
export declare class ColorMapping {
    private maps;
    constructor(maps: Maps);
    /**
     * To get color based on shape settings.
     *
     * @param { ShapeSettingsModel } shapeSettings - Specifies the shape settings.
     * @param { object } layerData - Specifies the layer data.
     * @param { string } color - Specifies the color.
     * @returns {Object} - Returns the object.
     * @private
     */
    getShapeColorMapping(shapeSettings: ShapeSettingsModel, layerData: any, color: string): any;
    /**
     * To color by value and color mapping
     */
    getColorByValue(colorMapping: ColorMappingSettingsModel[], colorValue: number, equalValue: string): any;
    deSaturationColor(colorMapping: ColorMappingSettingsModel, color: string, rangeValue: number, equalValue: string): number;
    rgbToHex(r: number, g: number, b: number): string;
    componentToHex(value: number): string;
    getColor(colorMap: ColorMappingSettingsModel, value: number): string;
    getGradientColor(value: number, colorMap: ColorMappingSettingsModel): ColorValue;
    getPercentageColor(percent: number, previous: string, next: string): ColorValue;
    getPercentage(percent: number, previous: number, next: number): number;
    _colorNameToHex(color: string): string;
}
