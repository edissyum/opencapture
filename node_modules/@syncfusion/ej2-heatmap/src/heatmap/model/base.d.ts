import { ChildProperty } from '@syncfusion/ej2-base';
import { Alignment, TextOverflow, BorderType } from '../utils/enum';
import { FontModel, MultiLevelCategoriesModel, AxisLabelBorderModel } from './base-model';
/**
 * Configures the fonts in heat map.
 */
export declare class Font extends ChildProperty<Font> {
    /**
     * Font size for the text.
     *
     * @default '16px'
     */
    size: string;
    /**
     * Color for the text.
     *
     * @default ''
     */
    color: string;
    /**
     * FontFamily for the text.
     */
    fontFamily: string;
    /**
     * FontWeight for the text.
     *
     * @default 'Normal'
     */
    fontWeight: string;
    /**
     * FontStyle for the text.
     *
     * @default 'Normal'
     */
    fontStyle: string;
    /**
     * text alignment
     *
     * @default 'Center'
     */
    textAlignment: Alignment;
    /**
     * Specifies the heat map text overflow
     *
     * @default 'Trim'
     */
    textOverflow: TextOverflow;
}
/**
 * Configures the heat map margins.
 */
export declare class Margin extends ChildProperty<Margin> {
    /**
     * Left margin in pixels.
     *
     * @default 10
     */
    left: number;
    /**
     * Right margin in pixels.
     *
     * @default 10
     */
    right: number;
    /**
     * Top margin in pixels.
     *
     * @default 10
     */
    top: number;
    /**
     * Bottom margin in pixels.
     *
     * @default 10
     */
    bottom: number;
}
/**
 * Configures the borders in the heat map.
 */
export declare class Border extends ChildProperty<Border> {
    /**
     * The color of the border that accepts value in hex and rgba as a valid CSS color string.
     *
     * @default ''
     */
    color: string;
    /**
     * The width of the border in pixels.
     *
     * @default 1
     */
    width: number;
    /**
     * The radius of the border in pixels.
     *
     * @default ''
     */
    radius: number;
}
/**
 * Configures the tooltip borders in the heat map.
 */
export declare class TooltipBorder extends ChildProperty<TooltipBorder> {
    /**
     * The color of the border that accepts value in hex and rgba as a valid CSS color string.
     *
     * @default ''
     */
    color: string;
    /**
     * The width of the border in pixels.
     *
     * @default 0
     */
    width: number;
}
/**
 * Configures the mapping name for size and color in SizeAndColor type.
 */
export declare class BubbleData extends ChildProperty<BubbleData> {
    /**
     * Mapping property to set size.
     *
     * @default null
     */
    size: string;
    /**
     * Mapping property to set color.
     *
     * @default null
     */
    color: string;
}
/**
 * class used to maintain Title styles.
 */
export declare class Title extends ChildProperty<Title> {
    /**
     * Title text
     *
     * @default ''
     */
    text: string;
    /**
     * Options for customizing the title.
     */
    textStyle: FontModel;
}
/**
 * class used to maintain the fill color value for cell color range
 */
export declare class FillColor extends ChildProperty<FillColor> {
    /**
     * minimum fill color for cell color range
     *
     * @default '#eeeeee'
     */
    minColor: string;
    /**
     * maximum fill color for cell color range
     *
     * @default '#eeeeee'
     */
    maxColor: string;
}
/**
 * class used to maintain palette information.
 */
export declare class PaletteCollection extends ChildProperty<PaletteCollection> {
    /**
     * Palette color value
     *
     * @default null
     */
    value: number;
    /**
     * Palette color text
     *
     * @default ''
     */
    color: string;
    /**
     * Palette color label
     *
     * @default ''
     */
    label: string;
    /**
     * Palette start value
     *
     * @default null
     */
    startValue: number;
    /**
     * Palette end value
     *
     * @default null
     */
    endValue: number;
    /**
     * Palette minColor value
     *
     * @default null
     */
    minColor: string;
    /**
     * Palette maxColor value
     *
     * @default null
     */
    maxColor: string;
}
/**
 * label border properties.
 */
export declare class AxisLabelBorder extends ChildProperty<AxisLabelBorder> {
    /**
     * The color of the border that accepts value in hex and rgba as a valid CSS color string.
     *
     * @default ''
     */
    color: string;
    /**
     * The width of the border in pixels.
     *
     * @default 1
     */
    width: number;
    /**
     * Border type for labels
     * * Rectangle
     * * Without Top Border
     * * Without Top/Bottom Border
     * * Without Border
     * * Without Bottom Border
     * * Brace
     *
     * @default 'Rectangle'
     */
    type: BorderType;
}
export declare class BubbleSize extends ChildProperty<BubbleSize> {
    /**
     * Specifies the minimum radius value of the cell in percentage.
     *
     * @default '0%'
     */
    minimum: string;
    /**
     * Specifies the maximum radius value of the cell in percentage.
     *
     * @default '100%'
     */
    maximum: string;
}
/**
 * categories for multi level labels
 */
export declare class MultiLevelCategories extends ChildProperty<MultiLevelCategories> {
    /**
     * Start value of the multi level labels
     *
     * @default null
     * @aspDefaultValueIgnore
     */
    start: number | Date | string;
    /**
     * End value of the multi level labels
     *
     * @default null
     * @aspDefaultValueIgnore
     */
    end: number | Date | string;
    /**
     * multi level labels text.
     *
     * @default ''
     */
    text: string;
    /**
     * Maximum width of the text for multi level labels.
     *
     * @default null
     * @aspDefaultValueIgnore
     */
    maximumTextWidth: number;
}
/**
 * MultiLevelLabels properties
 */
export declare class MultiLevelLabels extends ChildProperty<MultiLevelLabels[]> {
    /**
     * Defines the position of the multi level labels. They are,
     * * Near: Places the multi level labels at Near.
     * * Center: Places the multi level labels at Center.
     * * Far: Places the multi level labels at Far.
     *
     * @default 'Center'
     */
    alignment: Alignment;
    /**
     * Defines the textOverFlow for multi level labels. They are,
     * * Trim: Trim textOverflow for multi level labels.
     * * Wrap: Wrap textOverflow for multi level labels.
     * * none: None textOverflow for multi level labels.
     *
     * @default 'Wrap'
     */
    overflow: TextOverflow;
    /**
     * Options to customize the multi level labels.
     */
    textStyle: FontModel;
    /**
     * Border of the multi level labels.
     */
    border: AxisLabelBorderModel;
    /**
     * multi level categories for multi level labels.
     */
    categories: MultiLevelCategoriesModel[];
}
/**
 * Internal class used to maintain colorcollection.
 */
export declare class ColorCollection {
    value: number;
    color: string;
    label: string;
    startValue: number;
    endValue: number;
    minColor: string;
    maxColor: string;
    constructor(value: number, color: string, label: string, startValue: number, endValue: number, minColor: string, maxColor: string);
}
/**
 * class used to maintain color and value collection.
 */
export declare class BubbleTooltipData {
    mappingName: string;
    bubbleData: number;
    valueType: string;
    constructor(mappingName: string, bubbleData: number, valueType: string);
}
/**
 * Internal class used to maintain legend colorcollection.
 */
export declare class LegendColorCollection {
    value: number;
    color: string;
    label: string;
    startValue: number;
    endValue: number;
    minColor: string;
    maxColor: string;
    isHidden: boolean;
    constructor(value: number, color: string, label: string, startValue: number, endValue: number, minColor: string, maxColor: string, isHidden: boolean);
}
/**
 * class used to maintain xAxis labels details for multipleRow label intersect action.
 */
export declare class MultipleRow {
    start: number;
    end: number;
    index: number;
    label: string;
    row: number;
    constructor(start: number, end: number, index: number, label: string, row: number);
}
