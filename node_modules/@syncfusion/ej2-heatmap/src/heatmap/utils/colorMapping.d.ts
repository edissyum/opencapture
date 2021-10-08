import { ChildProperty } from '@syncfusion/ej2-base';
import { HeatMap } from '../heatmap';
import { PaletteType, ColorGradientMode } from '../utils/enum';
import { ColorCollection } from '../model/base';
import { PaletteCollectionModel, FillColorModel } from '../model/base-model';
/**
 * Configures the color property in Heatmap.
 */
export declare class PaletteSettings extends ChildProperty<PaletteSettings> {
    /**
     * Specifies the color collection for heat map cell.
     *
     * @default ''
     */
    palette: PaletteCollectionModel[];
    /**
     * Specifies the color style
     * * Gradient - Render a HeatMap cells with linear gradient color.
     * * Fixed - Render a HeatMap cells with fixed color.
     *
     * @default 'Gradient'
     */
    type: PaletteType;
    /**
     * Specifies the color for empty points in Heatmap.
     *
     * @default ''
     */
    emptyPointColor: string;
    /**
     * Specifies the colorGradientMode in Heatmap.
     *
     * @default 'Table'
     */
    colorGradientMode: ColorGradientMode;
    /**
     * Options to set fill colors.
     */
    fillColor: FillColorModel;
}
/**
 * Helper class for colormapping
 */
export declare class RgbColor {
    R: number;
    G: number;
    B: number;
    constructor(r: number, g: number, b: number);
}
export declare class CellColor {
    heatMap: HeatMap;
    constructor(heatMap?: HeatMap);
    /**
     * To convert hexa color to RGB.
     *
     * @returns {any}
     * @private
     */
    convertToRGB(value: number, colorMapping: ColorCollection[]): RgbColor;
    /**
     * To convert RGB to HEX.
     *
     * @returns {string}
     * @private
     */
    rgbToHex(r: number, g: number, b: number): string;
    /**
     * To convert Component to HEX.
     *
     * @returns {string}
     * @private
     */
    protected componentToHex(c: number): string;
    /**
     * To get similar color.
     *
     * @returns {string}
     * @private
     */
    protected getEqualColor(list: ColorCollection[], offset: number): string;
    /**
     * To convert RGB to HEX.
     *
     * @returns {string}
     * @private
     */
    protected convertToHex(color: string): string;
    /**
     * To get RGB for percentage value.
     *
     * @returns {any}
     * @private
     */
    protected getPercentageColor(percent: number, previous: string, next: string): RgbColor;
    /**
     * To convert numbet to percentage.
     *
     * @returns {any}
     * @private
     */
    protected getPercentage(percent: number, previous: number, next: number): number;
    /**
     * To get complete color Collection.
     *
     * @private
     */
    getColorCollection(): void;
    /**
     * To update legend color Collection.
     *
     * @private
     */
    private updateLegendColorCollection;
    /**
     * To get ordered palette color collection.
     *
     * @private
     */
    private orderbyOffset;
    /**
     * To get color depends to value.
     *
     * @private
     */
    getColorByValue(text: number): string;
}
